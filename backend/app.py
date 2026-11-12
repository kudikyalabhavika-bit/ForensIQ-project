"""
ForensIQ - Flask Backend
AI Forensic Investigation System - Sketch Generation API

Endpoints:
  GET  /features/<type>            → returns JSON list of PNG filenames for a category
  GET  /assets/<type>/<filename>   → serves a transparent PNG asset
  POST /generate-sketch             → composites all feature layers into one PNG
  GET  /health                      → health check

Run:
  cd backend
  pip install -r requirements.txt
  python app.py
    → runs on http://127.0.0.1:5000
"""

import os
import io
import json
from datetime import datetime

from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
from PIL import Image

# -------------------------------------------------------------------
# App setup
# -------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# All valid feature categories
CATEGORIES = [
    "face", "hair", "eyes", "eyebrows", "nose",
    "mouth", "ears", "beard", "mustache", "other",
]

app = Flask(__name__)
CORS(app)  # Allow requests from the Vite dev server (localhost:5173)
from forensiq_db import init_db
init_db(app)

# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def get_category_dir(category):
    """Return the absolute path to a category's asset folder."""
    return os.path.join(ASSETS_DIR, category)


def is_valid_category(category):
    """Check that the category is one we support."""
    return category in CATEGORIES


def list_png_files(folder):
    """Return a sorted list of .png filenames in a folder."""
    if not os.path.isdir(folder):
        return []
    files = [
        f for f in os.listdir(folder)
        if f.lower().endswith(".png") and os.path.isfile(os.path.join(folder, f))
    ]
    return sorted(files)


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@app.route("/health")
def health():
    """Simple health-check endpoint."""
    return jsonify({"status": "ok", "service": "ForensIQ Backend"})


@app.route("/features/<type>")
def features(type):
    """
    Return a JSON list of PNG filenames available for a feature category.

    Example:  GET /features/hair  →  ["hair1.png", "hair2.png", ...]
    """
    if not is_valid_category(type):
        return jsonify({"error": f"Unknown category: {type}"}), 400

    folder = get_category_dir(type)
    filenames = list_png_files(folder)
    return jsonify(filenames)


@app.route("/assets/<type>/<path:filename>")
def serve_asset(type, filename):
    """
    Serve a transparent PNG asset file from the assets folder.

    Example:  GET /assets/hair/hair1.png  →  image/png
    """
    if not is_valid_category(type):
        abort(400, description="Unknown category")

    file_path = os.path.join(get_category_dir(type), filename)

    # Prevent directory traversal
    if not os.path.abspath(file_path).startswith(os.path.abspath(ASSETS_DIR)):
        abort(403, description="Forbidden")

    if not os.path.isfile(file_path):
        abort(404, description="Asset not found")

    return send_file(file_path, mimetype="image/png")


@app.route("/generate-sketch", methods=["POST"])
def generate_sketch():
    """
    Composite all facial feature layers into a single transparent PNG.

    Expected JSON body:
    {
      "features": [
        {
          "type": "face",
          "image": "face1.png",
          "x": 300,
          "y": 300,
          "width": 300,
          "height": 400,
          "scaleX": 1.0,
          "scaleY": 1.0,
          "layer": 0
        },
        ...
      ]
    }

    The features are composited in layer order (0 = bottom).
    Each PNG's alpha channel is preserved so transparent areas don't
    cover features beneath them.

    Returns:
    {
      "success": true,
      "filename": "sketch_20260922_143022.png",
      "path": "/output/sketch_20260922_143022.png",
      "url": "http://127.0.0.1:5000/output/sketch_20260922_143022.png"
    }
    """
    data = request.get_json(silent=True)

    if not data or "features" not in data:
        return jsonify({"error": "Missing 'features' in request body"}), 400

    feature_list = data["features"]
    if not isinstance(feature_list, list) or len(feature_list) == 0:
        return jsonify({"error": "No features provided"}), 400

    # Sort by layer order (lowest = bottom of stack)
    feature_list.sort(key=lambda f: f.get("layer", 0))

    # Canvas dimensions — large enough to hold positioned features
    CANVAS_W = 600
    CANVAS_H = 600

    # Start with a transparent canvas (RGBA)
    composite = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 0))

    errors = []

    for feat in feature_list:
        ftype = feat.get("type", "other")
        fname = feat.get("image", "")
        x = int(feat.get("x", 0))
        y = int(feat.get("y", 0))
        width = int(feat.get("width", 100))
        height = int(feat.get("height", 100))
        scale_x = float(feat.get("scaleX", 1.0))
        scale_y = float(feat.get("scaleY", 1.0))

        # Build path to the asset PNG
        asset_path = os.path.join(get_category_dir(ftype), fname)

        if not os.path.isfile(asset_path):
            errors.append(f"Asset not found: {ftype}/{fname}")
            continue

        try:
            layer_img = Image.open(asset_path).convert("RGBA")

            # Resize to the target dimensions (respecting scale)
            target_w = max(1, int(width))
            target_h = max(1, int(height))
            layer_img = layer_img.resize((target_w, target_h), Image.LANCZOS)

            # Calculate paste position (center-origin like Fabric.js)
            paste_x = x - target_w // 2
            paste_y = y - target_h // 2

            # Composite this layer onto the canvas (preserves alpha)
            composite.paste(layer_img, (paste_x, paste_y), layer_img)

        except Exception as e:
            errors.append(f"Error processing {ftype}/{fname}: {str(e)}")

    # Generate output filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_filename = f"sketch_{timestamp}.png"
    out_path = os.path.join(OUTPUT_DIR, out_filename)

    # Save the final composited image
    composite.save(out_path, "PNG")

    return jsonify({
        "success": True,
        "filename": out_filename,
        "path": f"/output/{out_filename}",
        "url": f"http://127.0.0.1:5000/output/{out_filename}",
        "features_composited": len(feature_list) - len(errors),
        "errors": errors,
    })


@app.route("/output/<path:filename>")
def serve_output(filename):
    """Serve a generated sketch from the output folder."""
    file_path = os.path.join(OUTPUT_DIR, filename)

    if not os.path.abspath(file_path).startswith(os.path.abspath(OUTPUT_DIR)):
        abort(403, description="Forbidden")

    if not os.path.isfile(file_path):
        abort(404, description="Sketch not found")

    return send_file(file_path, mimetype="image/png")


# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 50)
    print("  ForensIQ Backend - AI Forensic Sketch API")
    print("=" * 50)
    print(f"  Assets dir:  {ASSETS_DIR}")
    print(f"  Output dir:  {OUTPUT_DIR}")
    print(f"  Categories:  {', '.join(CATEGORIES)}")
    print()
    print("  Endpoints:")
    print("    GET  /health")
    print("    GET  /features/<type>")
    print("    GET  /assets/<type>/<filename>")
    print("    POST /generate-sketch")
    print("    GET  /output/<filename>")
    print("=" * 50)
    print()

    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
