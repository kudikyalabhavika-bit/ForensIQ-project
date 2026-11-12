"""
Fill the database with FICTIONAL test data.
Run from the backend folder:   python seed.py          (skips if data exists)
                               python seed.py --reset  (wipes and recreates)
"""
import random
import sys

from app import app
from extensions import db
from models import Profile, PhysicalFeature, Case, User

FIRST = ["Rahul", "Amit", "Vikram", "Suresh", "Karan", "Neha", "Priya", "Anita",
         "Rohan", "Sanjay", "Meera", "Deepak", "Kavya", "Arjun", "Pooja", "Imran"]
LAST = ["Sharma", "Verma", "Patil", "Nair", "Iyer", "Khan", "Das", "Reddy", "Joshi", "Singh"]

OPTIONS = {
    "face_shape": ["oval", "round", "square", "heart", "long"],
    "eye_shape": ["round", "almond", "narrow", "hooded"],
    "eye_colour": ["brown", "black", "hazel", "green"],
    "eyebrow_type": ["thick", "thin", "arched", "straight"],
    "nose_shape": ["straight", "broad", "pointed", "aquiline"],
    "lip_shape": ["thin", "full", "wide", "heart-shaped"],
    "hair_colour": ["black", "brown", "grey", "blonde"],
    "hair_style": ["short", "long", "curly", "bald", "wavy"],
    "facial_hair": ["none", "beard", "moustache", "stubble"],
    "skin_tone": ["fair", "medium", "olive", "dark"],
}
MARKS = [None, None, "small mole on left cheek (fictional)", "scar above right eyebrow (fictional)"]
CASE_CATEGORIES = ["Fictional theft case", "Fictional fraud case", "Fictional missing-person case",
                   "Fictional vandalism case", "Fictional cyber case"]


def seed(reset=False):
    with app.app_context():
        if reset:
            db.drop_all()
        db.create_all()

        if Profile.query.first():
            print("Data already exists. Use --reset to wipe and reseed.")
            return

        for name, pw, role in [("admin", "admin123", "admin"),
                               ("investigator", "invest123", "investigator"),
                               ("viewer", "viewer123", "viewer")]:
            u = User(username=name, role=role)
            u.set_password(pw)
            db.session.add(u)

        random.seed(42)
        profiles = []
        for i in range(1, 19):
            p = Profile(
                profile_code=f"FQ{i:03d}",
                name=f"{random.choice(FIRST)} {random.choice(LAST)} (fictional)",
                age=random.randint(20, 60),
                gender=random.choice(["Male", "Female"]),
                height=f"{random.randint(5, 6)}'{random.randint(0, 11)}\"",
                created_by="seed", updated_by="seed",
            )
            p.features = PhysicalFeature(
                **{k: random.choice(v) for k, v in OPTIONS.items()},
                marks=random.choice(MARKS),
            )
            profiles.append(p)
            db.session.add(p)
        db.session.flush()

        for i, cat in enumerate(CASE_CATEGORIES, start=1):
            c = Case(case_code=f"CS{i:03d}", category=cat, status=random.choice(["open", "closed"]),
                     created_by="seed")
            db.session.add(c)
            db.session.flush()
            c.reference_no = f"REF-2026-{c.id:03d}"
            c.profiles = random.sample(profiles, k=random.randint(1, 3))

        db.session.commit()
        print("Seeded 18 fictional profiles, 5 cases and 3 users.")
        print("Logins:  admin/admin123   investigator/invest123   viewer/viewer123")
        print("Add photos with POST /api/profiles/<code>/images (use AI-generated or stock faces only).")


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
