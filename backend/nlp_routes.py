
from flask import Blueprint, request, jsonify

from extensions import db
from models import Profile, PhysicalFeature, SearchHistory, FEATURE_FIELDS
from auth import role_required, ALL
from nlp_service import extract_attributes

nlp_api = Blueprint("nlp_api", __name__, url_prefix="/api/nlp")


@nlp_api.post("/search")
@role_required(*ALL)
def nlp_search():
    body = request.get_json(silent=True) or {}
    description = (body.get("description") or "").strip()

    if not description:
        return jsonify({"error": "Please enter a suspect description."}), 400

    if len(description) > 2000:
        return jsonify({"error": "Description must be under 2000 characters."}), 400

    extracted = extract_attributes(description)

    if not extracted:
        return jsonify({
            "extracted_attributes": {},
            "matches": [],
            "message": "No recognizable physical attributes found. Please add more details."
        })

    profiles = (
        Profile.query
        .outerjoin(PhysicalFeature)
        .filter(Profile.status == "active")
        .all()
    )

    results = []

    for profile in profiles:
        feature = profile.features
        matched = []
        mismatched = []
        unavailable = []
        total = 0
        score = 0

        # Compare age
        if "age" in extracted:
            total += 1
            if profile.age is None:
                unavailable.append("age")
            elif abs(profile.age - extracted["age"]) <= 3:
                score += 1
                matched.append("age")
            else:
                mismatched.append("age")

        # Compare gender
        if "gender" in extracted:
            total += 1
            if not profile.gender:
                unavailable.append("gender")
            elif profile.gender.lower() == extracted["gender"].lower():
                score += 1
                matched.append("gender")
            else:
                mismatched.append("gender")

        # Compare physical features
        for field in FEATURE_FIELDS:
            if field not in extracted:
                continue

            total += 1
            database_value = getattr(feature, field, None) if feature else None
            search_value = extracted[field]

            if not database_value:
                unavailable.append(field)
            elif field == "marks":
                if any(
                    word in database_value.lower()
                    for word in search_value.lower().split(", ")
                ):
                    score += 1
                    matched.append(field)
                else:
                    mismatched.append(field)
            elif database_value.strip().lower() == search_value.strip().lower():
                score += 1
                matched.append(field)
            else:
                mismatched.append(field)

        # Missing database values are not counted as mismatches.
        comparable = total - len(unavailable)
        similarity = round((score / comparable) * 100) if comparable else 0

        results.append({
            "id": profile.id,
            "profile_code": profile.profile_code,
            "name": profile.name,
            "age": profile.age,
            "gender": profile.gender,
            "thumbnail": profile.images[0].url if profile.images else None,
            "similarity": similarity,
            "matched_attributes": matched,
            "mismatched_attributes": mismatched,
            "unavailable_attributes": unavailable,
            "compared_attributes": comparable,
        })

    results.sort(
        key=lambda item: (item["similarity"], len(item["matched_attributes"])),
        reverse=True
    )

    db.session.add(SearchHistory(
        query=description,
        result_count=len(results),
    ))
    db.session.commit()

    return jsonify({
        "extracted_attributes": extracted,
        "matches": results,
        "total_profiles": len(results),
        "message": "Attribute similarity results generated successfully."
    })
