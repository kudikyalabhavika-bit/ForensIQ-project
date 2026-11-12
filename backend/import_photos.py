"""
Bulk-attach photos to profiles.

1. Put your images in  backend/photos/  named by profile code:
       FQ001.jpg   FQ002.png   FQ003.jpeg ...
2. From the backend folder (venv active) run:
       python import_photos.py
   (or  python import_photos.py "C:\\path\\to\\folder"  for another folder)

Each photo is resized to 256x256 like normal uploads and becomes the profile's
photo. The cartoon face made by make_faces.py for that profile is replaced.
Use AI-generated / synthetic faces only, never photos of real people.
"""
import os
import sys
from uuid import uuid4

from PIL import Image, ImageOps

from app import app
from extensions import db
from models import Profile, ProfileImage

HERE = os.path.dirname(os.path.abspath(__file__))
FOLDER = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "photos")
ALLOWED = {"jpg", "jpeg", "png"}


def main():
    if not os.path.isdir(FOLDER):
        print(f"Folder not found: {FOLDER}")
        print("Create it and put files like FQ001.jpg inside.")
        return

    with app.app_context():
        upload_dir = app.config["UPLOAD_DIR"]
        done = 0
        for name in sorted(os.listdir(FOLDER)):
            stem, _, ext = name.rpartition(".")
            ext = ext.lower()
            if ext not in ALLOWED:
                continue

            code = stem.replace("-", "_").split("_")[0].upper()  # FQ001_front -> FQ001
            p = Profile.query.filter_by(profile_code=code).first()
            if not p:
                print(f"Skipped {name}: no profile with code {code}")
                continue

            try:
                img = Image.open(os.path.join(FOLDER, name))
                img = ImageOps.exif_transpose(img).convert("RGB")
                img = ImageOps.fit(img, (256, 256))
            except Exception:
                print(f"Skipped {name}: not a valid image")
                continue

            for old in list(p.images):
                if old.uploaded_by == "make_faces":
                    path = os.path.join(upload_dir, old.filename)
                    if os.path.exists(path):
                        os.remove(path)
                    db.session.delete(old)

            tag = uuid4().hex[:8]
            filename = f"{code}_{tag}.{ext}"
            img.save(os.path.join(upload_dir, filename))
            db.session.add(ProfileImage(
                image_code=f"IMG-{code}-{tag}",
                profile_id=p.id,
                filename=filename,
                image_type="profile",
                format=ext,
                uploaded_by="import_photos",
            ))
            done += 1
            print(f"Attached {name} -> {code}")

        db.session.commit()
        print(f"Done. {done} photo(s) imported.")


if __name__ == "__main__":
    main()
