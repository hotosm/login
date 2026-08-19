"""S3/MinIO storage for group avatar/banner images (synchronous boto3).

Mirrors portal's ``s3_service`` with a local-filesystem fallback so dev works
without object storage. Image keys are namespaced by group and kind
(``avatar`` | ``banner``).
"""

import uuid
from pathlib import Path

import boto3

from app.core.config import settings

_LOCAL_UPLOADS_DIR = Path("/app/uploads")
_CONTENT_TYPE_BY_EXT = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}


def is_s3_configured() -> bool:
    """Return True when object storage is configured."""
    return bool(settings.s3_endpoint_url and settings.s3_bucket_name)


def is_local_key(key: str) -> bool:
    """Return True when the key points at the local-filesystem fallback."""
    return key.startswith("local/")


def _local_path(key: str) -> Path:
    return _LOCAL_UPLOADS_DIR / key[len("local/") :]


def _get_s3_client():
    kwargs: dict = {"endpoint_url": settings.s3_endpoint_url}
    if settings.s3_access_key:
        kwargs["aws_access_key_id"] = settings.s3_access_key
    if settings.s3_secret_key:
        kwargs["aws_secret_access_key"] = settings.s3_secret_key
    return boto3.client("s3", **kwargs)


def upload_group_image_local(data: bytes, group_id: str, kind: str, ext: str) -> str:
    """Store image bytes on the local filesystem. Returns storage key."""
    key = f"local/groups/{group_id}/{kind}/{uuid.uuid4()}{ext}"
    path = _local_path(key)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return key


def get_group_image_local(key: str) -> tuple[bytes, str]:
    """Fetch image bytes and content-type from the local filesystem."""
    path = _local_path(key)
    ext = path.suffix.lower()
    return path.read_bytes(), _CONTENT_TYPE_BY_EXT.get(ext, "application/octet-stream")


def delete_group_image_local(key: str) -> None:
    """Delete a locally-stored image (no-op if missing)."""
    _local_path(key).unlink(missing_ok=True)


def upload_group_image(
    data: bytes, content_type: str, group_id: str, kind: str, ext: str
) -> str:
    """Upload image bytes to S3. Returns the storage key."""
    key = f"groups/{group_id}/{kind}/{uuid.uuid4()}{ext}"
    _get_s3_client().put_object(
        Bucket=settings.s3_bucket_name,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    return key


def get_group_image(key: str) -> tuple[bytes, str]:
    """Fetch image bytes and content-type from S3."""
    response = _get_s3_client().get_object(Bucket=settings.s3_bucket_name, Key=key)
    data = response["Body"].read()
    content_type = response.get("ContentType", "application/octet-stream")
    return data, content_type


def delete_group_image(key: str) -> None:
    """Delete an image from S3."""
    _get_s3_client().delete_object(Bucket=settings.s3_bucket_name, Key=key)


def store_image(
    data: bytes, group_id: str, kind: str, ext: str, content_type: str
) -> str:
    """Store an image via S3 or the local fallback, returning the key."""
    if is_s3_configured():
        return upload_group_image(data, content_type, group_id, kind, ext)
    return upload_group_image_local(data, group_id, kind, ext)


def load_image(key: str) -> tuple[bytes, str]:
    """Load an image by key from wherever it is stored."""
    if is_local_key(key):
        return get_group_image_local(key)
    return get_group_image(key)


def remove_image(key: str) -> None:
    """Remove an image by key from wherever it is stored."""
    if is_local_key(key):
        delete_group_image_local(key)
    else:
        delete_group_image(key)
