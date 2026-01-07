"""Database module for login backend."""

from app.db.database import Base, get_db
from app.db.models import UserProfile

__all__ = ["Base", "get_db", "UserProfile"]
