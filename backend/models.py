from datetime import datetime, timezone

from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db


def utcnow():
    return datetime.now(timezone.utc)


FEATURE_FIELDS = [
    "face_shape", "eye_shape", "eye_colour", "eyebrow_type", "nose_shape",
    "lip_shape", "hair_colour", "hair_style", "facial_hair", "skin_tone", "marks",
]


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    profile_code = db.Column(db.String(10), unique=True, nullable=False)  # FQ001
    name = db.Column(db.String(100), index=True, nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    height = db.Column(db.String(10))
    identification_status = db.Column(db.String(60), default="Fictional test profile")
    status = db.Column(db.String(20), default="active")  # active / archived
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)
    created_by = db.Column(db.String(50))
    updated_by = db.Column(db.String(50))

    features = db.relationship(
        "PhysicalFeature", uselist=False, backref="profile", cascade="all, delete-orphan"
    )
    images = db.relationship("ProfileImage", backref="profile", cascade="all, delete-orphan")

    def to_dict(self, detail=False):
        data = {
            "id": self.id,
            "profile_code": self.profile_code,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "height": self.height,
            "identification_status": self.identification_status,
            "status": self.status,
            "features": self.features.to_dict() if self.features else None,
        }
        if detail:
            data.update({
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "updated_at": self.updated_at.isoformat() if self.updated_at else None,
                "created_by": self.created_by,
                "updated_by": self.updated_by,
                "images": [i.to_dict() for i in self.images],
                "cases": [c.to_dict() for c in self.cases],
            })
        else:
            data["thumbnail"] = self.images[0].url if self.images else None
            data["updated_at"] = self.updated_at.isoformat() if self.updated_at else None
            data["cases"] = [c.to_dict() for c in self.cases]
        return data


class PhysicalFeature(db.Model):
    __tablename__ = "physical_features"

    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("profiles.id"), unique=True, nullable=False)
    face_shape = db.Column(db.String(30), index=True)
    eye_shape = db.Column(db.String(30))
    eye_colour = db.Column(db.String(30), index=True)
    eyebrow_type = db.Column(db.String(30))
    nose_shape = db.Column(db.String(30), index=True)
    lip_shape = db.Column(db.String(30))
    hair_colour = db.Column(db.String(30), index=True)
    hair_style = db.Column(db.String(30))
    facial_hair = db.Column(db.String(30))
    skin_tone = db.Column(db.String(30))
    marks = db.Column(db.String(200))  # fictional scar / mole etc.

    def to_dict(self):
        return {f: getattr(self, f) for f in FEATURE_FIELDS}


class ProfileImage(db.Model):
    __tablename__ = "profile_images"

    id = db.Column(db.Integer, primary_key=True)
    image_code = db.Column(db.String(40), unique=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("profiles.id"), nullable=False)
    filename = db.Column(db.String(120), nullable=False)
    image_type = db.Column(db.String(20), default="additional")  # profile / front / additional
    format = db.Column(db.String(10))
    uploaded_at = db.Column(db.DateTime, default=utcnow)
    uploaded_by = db.Column(db.String(50))

    @property
    def url(self):
        return f"/api/uploads/{self.filename}"

    def to_dict(self):
        return {
            "id": self.id,
            "image_code": self.image_code,
            "profile_id": self.profile_id,
            "image_type": self.image_type,
            "format": self.format,
            "filename": self.filename,
            "url": self.url,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }


class CaseProfile(db.Model):
    """Association table: many profiles <-> many cases."""
    __tablename__ = "case_profiles"

    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("profiles.id"), primary_key=True)
    linked_at = db.Column(db.DateTime, default=utcnow)


class Case(db.Model):
    __tablename__ = "cases"

    id = db.Column(db.Integer, primary_key=True)
    case_code = db.Column(db.String(10), unique=True)  # CS001
    category = db.Column(db.String(60))
    status = db.Column(db.String(20), default="open")
    department = db.Column(db.String(80), default="Dummy Investigation Dept")
    reference_no = db.Column(db.String(30))
    created_at = db.Column(db.DateTime, default=utcnow)
    created_by = db.Column(db.String(50))

    profiles = db.relationship("Profile", secondary="case_profiles", backref="cases")

    def to_dict(self, detail=False):
        data = {
            "id": self.id,
            "case_code": self.case_code,
            "category": self.category,
            "status": self.status,
            "department": self.department,
            "reference_no": self.reference_no,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if detail:
            data["profiles"] = [
                {"id": p.id, "profile_code": p.profile_code, "name": p.name} for p in self.profiles
            ]
        return data


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="viewer")  # admin / investigator / viewer

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)


class SearchHistory(db.Model):
    __tablename__ = "search_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    query = db.Column(db.Text)
    result_count = db.Column(db.Integer)
    searched_at = db.Column(db.DateTime, default=utcnow)


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    action = db.Column(db.String(30))  # CREATE / UPDATE / ARCHIVE / UPLOAD / LINK / LOGIN
    table_name = db.Column(db.String(40))
    record_id = db.Column(db.String(40))
    timestamp = db.Column(db.DateTime, default=utcnow)
