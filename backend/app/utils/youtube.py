"""YouTube video links, as accepted for a group's video_url.

The frontend mirrors this rule in frontend/src/utils/youtube.ts; keep both in
step.
"""

import re
from urllib.parse import parse_qs, urlsplit

_VIDEO_ID = re.compile(r"[A-Za-z0-9_-]{11}")
_YOUTUBE_HOSTS = frozenset({"youtube.com", "www.youtube.com", "m.youtube.com"})
# Path prefixes on the YouTube hosts that carry the video id right after them.
_ID_PATH_PREFIXES = ("/shorts/", "/embed/")

INVALID_YOUTUBE_URL = "Must be a YouTube video link"


def _video_id(value: str) -> str | None:
    parts = urlsplit(value)
    if parts.scheme not in ("http", "https") or parts.port or parts.username:
        return None
    host = parts.hostname or ""
    if host == "youtu.be":
        return parts.path.removeprefix("/")
    if host not in _YOUTUBE_HOSTS:
        return None
    if parts.path == "/watch":
        return parse_qs(parts.query).get("v", [None])[0]
    for prefix in _ID_PATH_PREFIXES:
        if parts.path.startswith(prefix):
            return parts.path.removeprefix(prefix)
    return None


def normalize_youtube_url(value: str | None) -> str | None:
    """Return the canonical watch URL for a YouTube video link.

    Accepts http(s) links on youtube.com, www.youtube.com, m.youtube.com and
    youtu.be, as ``watch?v=ID``, ``youtu.be/ID``, ``shorts/ID`` or
    ``embed/ID``. Anything else in the URL (timestamps, playlists, tracking)
    is dropped. Empty means no video. Raises ValueError for anything else.
    """
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(INVALID_YOUTUBE_URL)
    value = value.strip()
    if not value:
        return None
    try:
        video_id = _video_id(value)
    except ValueError:  # malformed URL, e.g. a non-numeric port
        video_id = None
    if video_id is None or not _VIDEO_ID.fullmatch(video_id):
        raise ValueError(INVALID_YOUTUBE_URL)
    return f"https://www.youtube.com/watch?v={video_id}"
