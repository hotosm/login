"""CORS allowlist: parsing CORS_ORIGINS."""

from app.core.config import DEFAULT_CORS_ORIGINS, Settings


def test_cors_origins_env_replaces_default():
    settings = Settings(cors_origins=" https://a.hotosm.org, https://b.hotosm.org/ ,")
    assert settings.cors_origin_list == ["https://a.hotosm.org", "https://b.hotosm.org"]


def test_cors_origins_unset_uses_default():
    assert Settings(cors_origins="").cors_origin_list == DEFAULT_CORS_ORIGINS
