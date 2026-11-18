# Changelog

## [Unreleased]

### Added

- `hotosm_permissions` core: standard roles (`viewer < contributor < editor <
  owner`) with default display texts in en/es/fr/pt, the permission catalog
  (`tool:resource.action`) for Portal, ChatMap and OAM, `ToolRoles` for each
  tool to enable roles and override their display, `PermissionContext` built
  from Login group memberships, `effective_role`/`can`, and the shared REST
  contract schemas for the share dialog (`ItemAccess` and request bodies).
