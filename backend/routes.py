import json
import os
from uuid import uuid4

from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import create_access_token
from PIL import Image, ImageOps
from sqlalchemy import func, or_

from extensions import db
from models import (
    Profile, PhysicalFeature, ProfileImage, Case, User, SearchHistory, AuditLog,
    FEATURE_FIELDS,
)
from auth import role_required, current_username, current_user_id, log_action, ADMIN, EDIT, ALL

api = Blueprint("api", __name__, url_prefix="/api")

ALLOWED_EXT = {"jpg", "jpeg", "png"}
IMAGE_SIZE = (256, 256)
IMAGE_TYPES = {"profile", "front", "additional"}


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
def find_profile(ident):
    """Look up a profile by numeric id or by code like FQ001."""
    if str(ident).isdigit():
        return Profile.query.get_or_404(int(ident))
    return Profile.query.filter_by(profile_code=str(ident).upper()).first_or_404()


def next_profile_code():
    last = db.session.query(func.max(Profile.id)).scalar() or 0
    return f"FQ{last + 1:03d}"


def next_case_code():
    last = db.session.query(func.max(Case.id)).scalar() or 0
    return f"CS{last + 1:03d}"


def apply_features(profile, data):
    if profile.features is None:
        profile.features = PhysicalFeature()
    for f in FEATURE_FIELDS:
        if f in data:
            setattr(profile.features, f, data[f])


# ------------------------------------------------------------------
# Auth
# ------------------------------------------------------------------
@api.post("/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    user = User.query.filter_by(username=body.get("username", "")).first()
    if not user or not user.check_password(body.get("password", "")):
        return jsonify({"error": "Invalid username or password"}), 401
    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "username": user.username},
    )
    log_action("LOGIN", "users", user.id, username=user.username)
    db.session.commit()
    return jsonify({"token": token, "username": user.username, "role": user.role})


# ------------------------------------------------------------------
# Profiles: list / search / filter
# ------------------------------------------------------------------
@api.get("/profiles")
@role_required(*ALL)
def list_profiles():
    q = Profile.query.outerjoin(PhysicalFeature)

    status = request.args.get("status", "active")
    if status != "all":
        q = q.filter(Profile.status == status)

    text = (request.args.get("q") or request.args.get("name") or "").strip()
    if text:
        like = f"%{text}%"
        q = q.filter(or_(Profile.name.ilike(like), Profile.profile_code.ilike(like)))

    used_filters = {}
    for f in FEATURE_FIELDS:
        val = request.args.get(f)
        if val:
            used_filters[f] = val
            q = q.filter(func.lower(getattr(PhysicalFeature, f)) == val.lower())

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    result = q.order_by(Profile.id).paginate(page=page, per_page=per_page, error_out=False)

    if text or used_filters:
        db.session.add(SearchHistory(
            user_id=current_user_id(),
            query=json.dumps({"q": text, **used_filters}),
            result_count=result.total,
        ))
        db.session.commit()

    return jsonify({
        "items": [p.to_dict() for p in result.items],
        "total": result.total,
        "page": result.page,
        "pages": result.pages,
    })


# ------------------------------------------------------------------
# Profiles: create / read / update / archive
# ------------------------------------------------------------------
@api.post("/profiles")
@role_required(*EDIT)
def create_profile():
    data = request.get_json(silent=True) or {}
    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    p = Profile(
        profile_code=next_profile_code(),
        name=data["name"],
        age=data.get("age"),
        gender=data.get("gender"),
        height=data.get("height"),
        created_by=current_username(),
        updated_by=current_username(),
    )
    apply_features(p, data.get("features", {}))
    db.session.add(p)
    db.session.flush()
    log_action("CREATE", "profiles", p.profile_code)
    db.session.commit()
    return jsonify(p.to_dict(detail=True)), 201


@api.get("/profiles/<ident>")
@role_required(*ALL)
def get_profile(ident):
    return jsonify(find_profile(ident).to_dict(detail=True))


@api.put("/profiles/<ident>")
@role_required(*EDIT)
def update_profile(ident):
    p = find_profile(ident)
    data = request.get_json(silent=True) or {}
    for field in ("name", "age", "gender", "height", "identification_status"):
        if field in data:
            setattr(p, field, data[field])
    if "features" in data:
        apply_features(p, data["features"])
    p.updated_by = current_username()
    log_action("UPDATE", "profiles", p.profile_code)
    db.session.commit()
    return jsonify(p.to_dict(detail=True))


@api.delete("/profiles/<ident>")
@role_required(*ADMIN)
def archive_profile(ident):
    """Soft delete: the row stays, status becomes 'archived'."""
    p = find_profile(ident)
    p.status = "archived"
    p.updated_by = current_username()
    log_action("ARCHIVE", "profiles", p.profile_code)
    db.session.commit()
    return jsonify({"message": f"{p.profile_code} archived"})


@api.post("/profiles/<ident>/restore")
@role_required(*ADMIN)
def restore_profile(ident):
    p = find_profile(ident)
    p.status = "active"
    p.updated_by = current_username()
    log_action("RESTORE", "profiles", p.profile_code)
    db.session.commit()
    return jsonify({"message": f"{p.profile_code} restored"})


# ------------------------------------------------------------------
# Images
# ------------------------------------------------------------------
@api.post("/profiles/<ident>/images")
@role_required(*EDIT)
def upload_image(ident):
    p = find_profile(ident)
    f = request.files.get("image")
    if not f or not f.filename:
        return jsonify({"error": "No file sent. Use form field 'image'."}), 400

    ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
    if ext not in ALLOWED_EXT:
        return jsonify({"error": "Only jpg, jpeg and png are allowed"}), 400

    image_type = request.form.get("image_type", "additional")
    if image_type not in IMAGE_TYPES:
        image_type = "additional"

    try:
        img = Image.open(f.stream)
        img = ImageOps.exif_transpose(img).convert("RGB")
        img = ImageOps.fit(img, IMAGE_SIZE)  # fixed size for the face-matching module
    except Exception:
        return jsonify({"error": "File is not a valid image"}), 400

    code = uuid4().hex[:8]
    filename = f"{p.profile_code}_{code}.{ext}"
    img.save(os.path.join(current_app.config["UPLOAD_DIR"], filename))

    rec = ProfileImage(
        image_code=f"IMG-{p.profile_code}-{code}",
        profile_id=p.id,
        filename=filename,
        image_type=image_type,
        format=ext,
        uploaded_by=current_username(),
    )
    db.session.add(rec)
    db.session.flush()
    log_action("UPLOAD", "profile_images", rec.image_code)
    db.session.commit()
    return jsonify(rec.to_dict()), 201


@api.get("/profiles/<ident>/images")
@role_required(*ALL)
def profile_images(ident):
    p = find_profile(ident)
    return jsonify([i.to_dict() for i in p.images])


@api.get("/uploads/<path:filename>")
def serve_upload(filename):
    # Public on purpose: <img> tags cannot send an Authorization header.
    return send_from_directory(current_app.config["UPLOAD_DIR"], filename)


# ------------------------------------------------------------------
# Endpoints for the other two modules
# ------------------------------------------------------------------
@api.get("/profiles/<ident>/features")
@role_required(*ALL)
def profile_features(ident):
    """For the NLP module."""
    p = find_profile(ident)
    return jsonify({
        "profile_code": p.profile_code,
        "features": p.features.to_dict() if p.features else {},
    })


@api.get("/images/all")
@role_required(*ALL)
def all_images():
    """For the face-matching module."""
    rows = (
        db.session.query(ProfileImage, Profile)
        .join(Profile, Profile.id == ProfileImage.profile_id)
        .filter(Profile.status == "active")
        .all()
    )
    return jsonify([
        {
            "image_id": img.id,
            "profile_code": prof.profile_code,
            "image_type": img.image_type,
            "path": os.path.join(current_app.config["UPLOAD_DIR"], img.filename),
            "url": img.url,
        }
        for img, prof in rows
    ])


# ------------------------------------------------------------------
# Cases
# ------------------------------------------------------------------
@api.get("/cases")
@role_required(*ALL)
def list_cases():
    return jsonify([c.to_dict() for c in Case.query.order_by(Case.id).all()])


@api.post("/cases")
@role_required(*EDIT)
def create_case():
    data = request.get_json(silent=True) or {}
    c = Case(
        case_code=next_case_code(),
        category=data.get("category", "Fictional test case"),
        status=data.get("status", "open"),
        department=data.get("department", "Dummy Investigation Dept"),
        created_by=current_username(),
    )
    db.session.add(c)
    db.session.flush()
    c.reference_no = f"REF-{c.created_at.year}-{c.id:03d}"
    log_action("CREATE", "cases", c.case_code)
    db.session.commit()
    return jsonify(c.to_dict(detail=True)), 201


def find_case(ident):
    """Look up a case by numeric id or by code like CS001."""
    if str(ident).isdigit():
        return Case.query.get_or_404(int(ident))
    return Case.query.filter_by(case_code=str(ident).upper()).first_or_404()


@api.get("/cases/<ident>")
@role_required(*ALL)
def get_case(ident):
    return jsonify(find_case(ident).to_dict(detail=True))


@api.put("/cases/<ident>")
@role_required(*EDIT)
def update_case(ident):
    c = find_case(ident)
    data = request.get_json(silent=True) or {}
    if "status" in data and data["status"] not in ("open", "closed"):
        return jsonify({"error": "status must be 'open' or 'closed'"}), 400
    for field in ("category", "status", "department"):
        if field in data:
            setattr(c, field, data[field])
    log_action("UPDATE", "cases", c.case_code)
    db.session.commit()
    return jsonify(c.to_dict(detail=True))


@api.post("/cases/<ident>/profiles")
@role_required(*EDIT)
def link_profile(ident):
    c = find_case(ident)
    pid = (request.get_json(silent=True) or {}).get("profile_id")
    if not pid:
        return jsonify({"error": "profile_id is required"}), 400
    p = find_profile(pid)
    if p not in c.profiles:
        c.profiles.append(p)
        log_action("LINK", "case_profiles", f"{c.case_code}:{p.profile_code}")
        db.session.commit()
    return jsonify(c.to_dict(detail=True))


@api.delete("/cases/<ident>/profiles/<profile_ident>")
@role_required(*EDIT)
def unlink_profile(ident, profile_ident):
    c = find_case(ident)
    p = find_profile(profile_ident)
    if p in c.profiles:
        c.profiles.remove(p)
        log_action("UNLINK", "case_profiles", f"{c.case_code}:{p.profile_code}")
        db.session.commit()
    return jsonify(c.to_dict(detail=True))


# ------------------------------------------------------------------
# Admin: history and audit
# ------------------------------------------------------------------
@api.get("/search-history")
@role_required(*ADMIN)
def search_history():
    rows = SearchHistory.query.order_by(SearchHistory.id.desc()).limit(100).all()
    return jsonify([
        {"user_id": r.user_id, "query": r.query, "result_count": r.result_count,
         "searched_at": r.searched_at.isoformat()}
        for r in rows
    ])


@api.get("/audit-logs")
@role_required(*ADMIN)
def audit_logs():
    rows = AuditLog.query.order_by(AuditLog.id.desc()).limit(200).all()
    return jsonify([
        {"username": r.username, "action": r.action, "table": r.table_name,
         "record_id": r.record_id, "timestamp": r.timestamp.isoformat()}
        for r in rows
    ])
