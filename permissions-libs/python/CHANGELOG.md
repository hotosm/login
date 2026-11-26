# Changelog

## [Unreleased]

### Added

- `hotosm_permissions` core: standard roles (`viewer < contributor < editor <
  owner`) with default display texts in en/es/fr/pt, the permission catalog
  (`tool:resource.action`) mechanism (`ToolCatalog`), `ToolRoles` for each
  tool to enable roles and override their display, `PermissionContext` built
  from Login group memberships, `effective_role`/`can`, and the shared REST
  contract schemas for the share dialog (`ItemAccess` and request bodies).
- `LoginClient` for Login's `/api/groups` (cached per user),
  `/api/users/lookup` and `/api/public/groups`, raising `LoginUnavailable` on
  any failure; `PermissionContext.from_login_groups`. New dependency:
  `httpx>=0.25.0`.
- `ItemAccess.link_roles` (roles a link may carry; empty = no link sharing).
- REST contract: every `/access…` route accepts
  `?locale=` (`en|es|fr|pt`, default `en`) for `available_roles`.
- `LoginClient.list_public_groups(ids=...)` to resolve public groups by id.
- REST contract: `POST /access/user` answers 404 when no account has that
  email and 409 when that person already owns the item.

### Changed

- Attribution (showing an item "by" an organization) removed from the REST
  contract: no more `PUT /attribution`, `AttributionUpdate`,
  `AccessAttribution`, `ItemAccess.attribution` or
  `ItemAccess.attribution_enabled`. It is not access; tools that need it
  implement it themselves.
- Each tool defines its own `ToolCatalog` and passes it to
  `ToolRoles(catalog, display=None)`; the enabled roles are the catalog's
  `available_roles`. Removed the Portal, ChatMap and OAM catalogs, `CATALOGS`
  and `get_catalog`. Added `ToolRoles.permissions_for(role)`, returned by tools
  as `my_permissions`.
- REST contract: `GET /access` is owner only (the `*.share` permission); a
  non-owner gets 403.
- REST contract: team and organization grants accept any group the owner
  belongs to or any public group (public and approved, for organizations).
