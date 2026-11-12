
"""
Plugs the Criminal Database and NLP modules into the existing Flask app.
Usage in app.py: from forensiq_db import init_db ; init_db(app)
"""

import os

from extensions import db, jwt


def init_db(app):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    upload_dir = os.path.join(base_dir, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # SQLite by default. For PostgreSQL set DATABASE_URL.
    app.config.setdefault(
        "SQLALCHEMY_DATABASE_URI",
        os.environ.get(
            "DATABASE_URL",
            "sqlite:///" + os.path.join(base_dir, "forensiq.db")
        ),
    )

    app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

    app.config.setdefault(
        "JWT_SECRET_KEY",
        os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")
    )

    app.config["UPLOAD_DIR"] = upload_dir

    # Initialize database and JWT
    db.init_app(app)
    jwt.init_app(app)

    # Register database models and API routes
    import models  # noqa: F401

    from routes import api
    from nlp_routes import nlp_api

    app.register_blueprint(api)
    app.register_blueprint(nlp_api)

    # Create tables if they do not already exist
    with app.app_context():
        db.create_all()
