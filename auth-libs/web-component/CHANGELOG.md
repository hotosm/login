# Changelog

## [0.5.1] - 2026-03-06

### Added

- Added centralized Hanko translation setup in hanko-translations.ts with English text overrides, and refactored main.tsx and hanko-auth.ts to use getTranslations().
- Inject subtitles to h1 in forms.

### Fixed

- Fix collapsed spinner when connecting to OSM account.
- Fix links styles by adding `exportparts="link"` so that css can reach them.

## [0.5.0] - 2026-03-5

### Changed

- Hanko elements version.

## [0.4.10] - 2026-03-02

### Changed

- Clean up internal debug log messages to use consistent technical wording.
- Improve internal comments in authentication and login URL flow sections.

### Fixed

- Fix stale avatar URL persisting in `localStorage` after user changes their profile picture.
- Fix stale logged-in state after cross-app logout.
- Remove unused internal code paths and helpers (`oldHandleDropdownSelect`, `handleSkipOSM`, `addTrailingSlash`, `warn`, `_trailingSlashCache`).
- Remove unused `css` import from `lit`.
- Remove legacy commented render block for old login link variant.

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
