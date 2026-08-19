"""Unit tests for slug generation."""

import pytest

from app.db.models import Group
from app.services import groups_service


def test_slugify_basic():
    assert groups_service.slugify("ADF Haiti") == "adf-haiti"
    assert groups_service.slugify("  Hello  World  ") == "hello-world"
    assert groups_service.slugify("Foo!!!Bar??") == "foo-bar"
    assert groups_service.slugify("café münchen") == "caf-m-nchen"


async def test_unique_slug_no_collision(db):
    slug = await groups_service.generate_unique_slug(db, "team", "Mappers")
    assert slug == "mappers"


async def test_unique_slug_collision_suffixes(db):
    db.add(Group(type="team", name="Mappers", slug="mappers", created_by="u"))
    await db.commit()
    slug = await groups_service.generate_unique_slug(db, "team", "Mappers")
    assert slug == "mappers-2"


async def test_same_slug_allowed_across_types(db):
    db.add(Group(type="team", name="Acme", slug="acme", created_by="u"))
    await db.commit()
    # An organization may reuse a slug held by a team (separate namespace).
    slug = await groups_service.generate_unique_slug(db, "organization", "Acme")
    assert slug == "acme"


async def test_reserved_slug_gets_fallback(db):
    slug = await groups_service.generate_unique_slug(db, "team", "admin")
    assert slug != "admin"
    assert slug.startswith("team-")


@pytest.mark.parametrize(
    ("role", "rank"),
    [("owner", 3), ("manager", 2), ("member", 1), (None, 0), ("bogus", 0)],
)
def test_role_rank(role, rank):
    assert groups_service.role_rank(role) == rank
