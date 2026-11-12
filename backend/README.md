# ForensIQ Flask Backend

AI Forensic Investigation System — Sketch Generation API

## Setup

```bash
cd backend
pip install -r requirements.txt
python generate_assets.py   # creates transparent placeholder PNGs
python app.py               # starts server on http://127.0.0.1:5000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/features/<type>` | Returns JSON list of PNG filenames for a category |
| GET | `/assets/<type>/<filename>` | Serves a transparent PNG asset |
| POST | `/generate-sketch` | Composites all feature layers into one PNG |
| GET | `/output/<filename>` | Serves a generated sketch |

## Adding Your Own Assets

Place transparent PNG files into the category folders under `assets/`:

```
assets/
├── face/      face1.png, face2.png, ...
├── hair/      hair1.png, hair2.png, ...
├── eyes/      eyes1.png, eyes2.png, ...
├── eyebrows/  eyebrows1.png, ...
├── nose/      nose1.png, ...
├── mouth/     mouth1.png, ...
├── ears/      ears1.png, ...
├── beard/     beard1.png, ...
├── mustache/  mustache1.png, ...
└── other/     other1.png, ...
```

New files appear automatically in the frontend sidebar — no code changes needed.

## generate-sketch Request

```json
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
    }
  ]
}
```

## generate-sketch Response

```json
{
  "success": true,
  "filename": "sketch_20260922_143022.png",
  "path": "/output/sketch_20260922_143022.png",
  "url": "http://127.0.0.1:5000/output/sketch_20260922_143022.png",
  "features_composited": 6,
  "errors": []
}
```

Generated sketches are saved in `output/`.
