"""
ForensIQ - Asset Folder Setup

This script creates the required asset folders.
It does NOT generate or overwrite any PNG files.

Add your own PNG images manually to the folders.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

CATEGORIES = [
    "face",
    "hair",
    "eyes",
    "eyebrows",
    "nose",
    "mouth",
    "ears",
    "beard",
    "mustache",
    "other",
]


def main():
    print("=" * 55)
    print("       ForensIQ - Asset Folder Setup")
    print("=" * 55)
    print()

    for category in CATEGORIES:
        folder = os.path.join(ASSETS_DIR, category)

        # Create folder if it doesn't exist
        os.makedirs(folder, exist_ok=True)

        print(f"✓ Ready: assets/{category}/")

    print()
    print("Asset folders are ready.")
    print()
    print("Now add your own PNG files manually.")
    print("This script does NOT create or overwrite PNG images.")
    print()
    print(f"Assets location: {ASSETS_DIR}")
    print("=" * 55)


if __name__ == "__main__":
    main()