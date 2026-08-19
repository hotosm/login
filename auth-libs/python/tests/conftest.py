"""Shared pytest configuration for auth-libs tests."""

import os

# Configure Django settings ONCE before any Django imports
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tests.django_test_settings")

# Only configure if Django is available
try:
    import django
    from django.conf import settings

    if not settings.configured:
        settings.configure(
            DEBUG=True,
            DATABASES={
                "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}
            },
            INSTALLED_APPS=[
                "django.contrib.contenttypes",
                "django.contrib.auth",
                "rest_framework",
            ],
            ROOT_URLCONF="hotosm_auth_django.osm_views",
            SECRET_KEY="test-secret-key-for-tests",
            USE_TZ=True,
        )
        django.setup()
except ImportError:
    # Django not installed - skip Django setup
    pass
