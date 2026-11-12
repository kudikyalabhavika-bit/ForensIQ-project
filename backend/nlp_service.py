
import re

from models import FEATURE_FIELDS


# Words and phrases that can identify physical attributes.
ATTRIBUTE_TERMS = {
    "face_shape": {
        "oval": ["oval"],
        "round": ["round"],
        "square": ["square"],
        "heart": ["heart-shaped", "heart shaped"],
        "diamond": ["diamond-shaped", "diamond shaped"],
        "oblong": ["oblong", "rectangular"],
    },
    "eye_shape": {
        "almond": ["almond", "almond-shaped"],
        "round": ["round eyes", "rounded eyes"],
        "hooded": ["hooded"],
        "upturned": ["upturned"],
        "downturned": ["downturned"],
    },
    "eye_colour": {
        "brown": ["brown eyes", "brown"],
        "black": ["black eyes", "black"],
        "blue": ["blue eyes", "blue"],
        "green": ["green eyes", "green"],
        "hazel": ["hazel eyes", "hazel"],
    },
    "eyebrow_type": {
        "thick": ["thick eyebrows", "thick brows"],
        "thin": ["thin eyebrows", "thin brows"],
        "arched": ["arched eyebrows", "arched brows"],
        "straight": ["straight eyebrows", "straight brows"],
        "curved": ["curved eyebrows", "curved brows"],
    },
    "nose_shape": {
        "straight": ["straight nose"],
        "broad": ["broad nose", "wide nose"],
        "pointed": ["pointed nose"],
        "button": ["button nose"],
        "aquiline": ["aquiline nose", "hooked nose"],
        "flat": ["flat nose"],
    },
    "lip_shape": {
        "full": ["full lips", "thick lips"],
        "thin": ["thin lips"],
        "wide": ["wide lips", "wide mouth"],
        "heart-shaped": ["heart-shaped lips", "heart shaped lips"],
    },
    "hair_colour": {
        "black": ["black hair"],
        "brown": ["brown hair"],
        "blonde": ["blonde hair", "blond hair"],
        "red": ["red hair", "ginger hair"],
        "grey": ["grey hair", "gray hair"],
        "white": ["white hair"],
    },
    "hair_style": {
        "short": ["short hair"],
        "long": ["long hair"],
        "curly": ["curly hair"],
        "wavy": ["wavy hair"],
        "straight": ["straight hair"],
        "bald": ["bald", "shaved head"],
        "ponytail": ["ponytail"],
        "bun": ["hair bun"],
    },
    "facial_hair": {
        "clean-shaven": ["clean-shaven", "clean shaven", "no beard"],
        "beard": ["beard"],
        "mustache": ["mustache", "moustache"],
        "stubble": ["stubble"],
        "goatee": ["goatee"],
    },
    "skin_tone": {
        "fair": ["fair skin", "light skin"],
        "medium": ["medium skin"],
        "olive": ["olive skin"],
        "brown": ["brown skin"],
        "dark": ["dark skin", "deep skin"],
    },
}


def extract_attributes(description):
    """Extract basic physical attributes from a written description."""

    text = description.lower().strip()
    extracted = {}

    # Age: examples - "25 years old", "age 30"
    age_match = re.search(
        r"\b(?:age[d]?\s*)?(\d{1,2})\s*(?:years?\s*old|yrs?\s*old)?\b",
        text,
    )
    if age_match:
        age = int(age_match.group(1))
        if 1 <= age <= 100:
            extracted["age"] = age

    # Gender
    if re.search(r"\b(man|male|boy|gentleman)\b", text):
        extracted["gender"] = "male"
    elif re.search(r"\b(woman|female|girl|lady)\b", text):
        extracted["gender"] = "female"

    # Physical features
    for field in FEATURE_FIELDS:
        if field not in ATTRIBUTE_TERMS:
            continue

        for value, phrases in ATTRIBUTE_TERMS[field].items():
            if any(phrase in text for phrase in phrases):
                extracted[field] = value
                break

    # Distinctive marks
    mark_terms = ["scar", "mole", "birthmark", "tattoo"]
    found_marks = [term for term in mark_terms if term in text]
    if found_marks:
        extracted["marks"] = ", ".join(found_marks)

    return extracted
