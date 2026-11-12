"""
Writes one text prompt per profile into face_prompts.txt.
Paste each prompt into an AI image generator (Gemini, Copilot, etc.) to get a
realistic, fully synthetic face that matches the profile's features.

Run from the backend folder (venv active):   python make_prompts.py
"""
import os

from app import app
from models import Profile

SKIN_WORDS = {"fair": "fair skin", "medium": "medium wheatish skin",
              "olive": "olive skin", "dark": "dark brown skin"}


def build_prompt(p):
    f = p.features.to_dict() if p.features else {}
    who = "woman" if (p.gender or "").lower().startswith("f") else "man"
    age = f"{p.age}-year-old " if p.age else ""

    hair_style = f.get("hair_style")
    if hair_style == "bald":
        hair = "a completely bald head"
    else:
        hair = f"{hair_style or 'short'} {f.get('hair_colour') or 'brown'} hair"

    fh = f.get("facial_hair")
    facial = {
        "beard": "a full beard", "moustache": "a moustache and no beard",
        "stubble": "light stubble", "none": "clean-shaven",
    }.get(fh, "clean-shaven")

    parts = [
        f"Realistic front-facing passport-style studio portrait photo of a fictional {age}{who}",
        f"{f.get('face_shape') or 'oval'} face shape",
        f"{f.get('eye_shape') or 'almond'} {f.get('eye_colour') or 'brown'} eyes",
        f"{f.get('eyebrow_type') or 'straight'} eyebrows",
        f"{f.get('nose_shape') or 'straight'} nose",
        f"{f.get('lip_shape') or 'full'} lips",
        hair,
        facial,
        SKIN_WORDS.get(f.get("skin_tone"), "medium skin"),
    ]
    marks = (f.get("marks") or "").replace("(fictional)", "").strip()
    if marks:
        parts.append(marks)
    parts.append("neutral expression, looking straight at the camera, head and shoulders, "
                 "plain light grey background, even soft lighting, sharp focus, photorealistic. "
                 "AI-generated person, not based on any real individual")
    return ", ".join(parts)


def main():
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "face_prompts.txt")
    with app.app_context():
        profiles = Profile.query.filter_by(status="active").order_by(Profile.id).all()
        with open(out, "w", encoding="utf-8") as fh:
            for p in profiles:
                fh.write(f"{p.profile_code}  ({p.name})\n{build_prompt(p)}\n\n")
        print(f"Wrote {len(profiles)} prompts to {out}")


if __name__ == "__main__":
    main()
