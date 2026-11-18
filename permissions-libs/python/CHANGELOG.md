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
