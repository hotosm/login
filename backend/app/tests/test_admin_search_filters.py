"""Unit tests for the admin user-search WHERE builder."""

import uuid

from app.api.routes.admin import _build_search_filters, _looks_like_user_id


def _where(email: str | None) -> str:
    conditions, _, _ = _build_search_filters(
        email=email, date_from=None, date_to=None, verified=None
    )
    return " AND ".join(conditions)


def test_email_fragment_does_not_search_ids():
    """Short hex fragments must not reach the id branch.

    "a" is in ~89% of UUIDs and "ab" in ~11%, so matching ids on such a
    fragment would bury the email results the admin is looking for.
    """
    assert "u.id::text" not in _where("a")
    assert "u.id::text" not in _where("de")
    assert "u.id::text" not in _where("abc")
    assert "e.address ILIKE $1" in _where("a")


def test_name_fragment_does_not_search_ids():
    """A UUID holds only hex and dashes, so these could never match one."""
    assert "u.id::text" not in _where("ana")
    assert "u.id::text" not in _where("mariana@example.org")


def test_full_user_id_searches_ids():
    user_id = str(uuid.uuid4())
    where = _where(user_id)
    assert "u.id::text ILIKE $1" in where
    assert "e.address ILIKE $1" in where


def test_first_uuid_block_searches_ids():
    """The first block is what an admin pastes out of a log line."""
    assert "u.id::text ILIKE $1" in _where(str(uuid.uuid4())[:8])


def test_one_param_is_shared_by_both_branches():
    _, params, param_idx = _build_search_filters(
        email="deadbeef", date_from=None, date_to=None, verified=None
    )
    assert params == ["%deadbeef%"]
    assert param_idx == 2


def test_looks_like_user_id():
    assert _looks_like_user_id("deadbeef")
    assert _looks_like_user_id("DEADBEEF")
    assert _looks_like_user_id("1d33ef9f-3cb6-4448-86d6-6951f44759c8")
    assert not _looks_like_user_id("deadbee")
    assert not _looks_like_user_id("deadbeeg")
    assert not _looks_like_user_id("")
