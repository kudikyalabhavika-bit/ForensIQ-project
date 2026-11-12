from functools import wraps

from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

from extensions import db
from models import AuditLog

ADMIN = ("admin",)
EDIT = ("admin", "investigator")
ALL = ("admin", "investigator", "viewer")


def role_required(*roles):
    """Require a valid JWT whose 'role' claim is in `roles`."""
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            if get_jwt().get("role") not in roles:
                return jsonify({"error": "forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return deco


def current_username():
    return get_jwt().get("username", "system")


def current_user_id():
    return int(get_jwt()["sub"])


def log_action(action, table_name, record_id, username=None):
    """Add an audit row. The caller commits."""
    db.session.add(AuditLog(
        username=username or current_username(),
        action=action,
        table_name=table_name,
        record_id=str(record_id),
    ))
