# Changelog

## [Unreleased]

### Added

- `hotosm_permissions` core: standard roles (`viewer < contributor < editor <
  owner`) with default display texts in en/es/fr/pt, the permission catalog
  (`tool:resource.action`) for Portal, ChatMap and OAM, `ToolRoles` for each
  tool to enable roles and override their display, `PermissionContext` built
  from Login group memberships, `effective_role`/`can`, and the shared REST
  contract schemas for the share dialog (`ItemAccess` and request bodies).
- `LoginClient` for Login's `/api/groups` (cached per user),
  `/api/users/lookup` and `/api/public/groups`, raising `LoginUnavailable` on
  any failure; `PermissionContext.from_login_groups`. New dependency:
  `httpx>=0.25.0`.
- `ItemAccess.link_roles` (roles a link may carry; empty = no link sharing)
  and `ItemAccess.attribution_enabled` (whether the tool offers the "By").
- REST contract: every `/access…` and `/attribution` route accepts
  `?locale=` (`en|es|fr|pt`, default `en`) for `available_roles`.
- `LoginClient.list_public_groups(ids=...)` to resolve public groups by id.

### Changed

- REST contract: `GET /access` is owner only (the `*.share` permission); a
  non-owner gets 403.
- REST contract: team and organization grants accept any group the owner
  belongs to or any public group (public and approved, for organizations).
