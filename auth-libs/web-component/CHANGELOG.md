# Changelog

## [0.4.9] - 2026-02-26

### Added

- Add `prepublishOnly` script to ensure build before publish.
- Flash prevention via `localStorage` cache: on remount, the component reads `hotosm-auth-user` from `localStorage` to skip the loading spinner if the user is already known.

### Fixed

- Fix collapsing user avatar in header and in `show-profile` variant.
- Truncate long emails with ellipsis in profile dropdown and in `show-profile` variant.
- Fix loaders styles.

## [0.4.8] - 2026-02-24

### Added

- User avatar in dropdown menu.
- CSS properties for custom styling: `--font-family` | `--font-weight`

### Changed

- Renamed back button labels.
- Removed unnecessary title in Profile Page.
- Link styling in Login Page.
