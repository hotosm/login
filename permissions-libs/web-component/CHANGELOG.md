# Changelog

## [Unreleased]

### Added

- `<hotosm-share-dialog>`: the share dialog for HOT tools, built on the
  `hotosm-permissions` REST contract. Search for people (by email), teams and
  organizations (the caller's groups and public ones from Login), change or
  remove each grant's role, "anyone with the link", and the "By"
  (attribution). Every change applies immediately. Attributes `access-url`,
  `login-url`, `share-url`, `lang` (`en|es|fr|pt`) and `open`; events
  `hotosm-access-change` and `hotosm-share-close`. Lit and Web Awesome
  (`3.11.0`) are not bundled.
