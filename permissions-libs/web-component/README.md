# Web Component: `<hotosm-share-dialog>`

Lit-based share dialog for HOT tools. It talks to the tool's
[hotosm-permissions REST contract](../python/README.md#rest-contract) and to
Login for group search, so every tool gets the same dialog with no
tool-specific config: the roles and link sharing come from the tool's
`ItemAccess`.

## Installation

```bash
pnpm add @hotosm/permissions @awesome.me/webawesome@3.11.0
```

`lit` and `@awesome.me/webawesome` are not bundled: your bundler resolves them
to your own copies. The component imports the Web Awesome components it uses,
but **your tool loads Web Awesome's base CSS and theme**, e.g.
`@awesome.me/webawesome/dist/styles/webawesome.css`.

## Attributes

| Attribute    | Type    | Default | Description                                                                 |
| ------------ | ------- | ------- | --------------------------------------------------------------------------- |
| `access-url` | string  | `""`    | The item's base URL; the dialog adds `/access…`                             |
| `login-url`  | string  | `""`    | Login's URL, for `/api/groups` and `/api/public/groups`                       |
| `share-url`  | string  | `""`    | The item's URL, for "Copy link"                                             |
| `lang`       | string  | `en`    | `en`, `es`, `fr` or `pt`; sent as `?locale=` on every request to the tool    |
| `open`       | boolean | `false` | Shows the dialog; loads the access state each time it opens                  |

## Events

Both bubble and are composed.

| Event                  | `detail`     | When                                     |
| ---------------------- | ------------ | ---------------------------------------- |
| `hotosm-access-change` | `ItemAccess` | After every successful change            |
| `hotosm-share-close`   |              | The dialog closed (`open` is now `false`) |

## What the tool's backend must implement

The routes in the [REST contract](../python/README.md#rest-contract), under
`access-url`, using the cookie session (`credentials: "include"`):

- `GET /access` (owner only). On 403 or 404 the dialog only shows a short
  message, so open it only for the item's owner.
- `PUT|DELETE /access/link`, `POST /access/user` (404: no account with that
  email; 409: that person already owns the item),
  and `PUT|DELETE /access/{subject_type}/{subject_id}`.

Login must allow the tool's origin in CORS, with credentials, for
`/api/groups`.

## Usage

### HTML

```html
<script type="module">
  import "@awesome.me/webawesome/dist/styles/webawesome.css";
  import "@hotosm/permissions";
</script>

<hotosm-share-dialog
  access-url="/api/plans/123"
  login-url="https://login.hotosm.org"
  share-url="https://portal.hotosm.org/es/plan/123"
  lang="es"
  open
></hotosm-share-dialog>
```

### React 19

```tsx
import { useEffect, useRef } from "react";
import "@hotosm/permissions";

export function ShareDialog({ planId, open, onClose }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    el?.addEventListener("hotosm-share-close", onClose);
    return () => el?.removeEventListener("hotosm-share-close", onClose);
  }, [onClose]);

  return (
    <hotosm-share-dialog
      ref={ref}
      access-url={`/api/plans/${planId}`}
      login-url="https://login.hotosm.org"
      share-url={`${window.location.origin}/plan/${planId}`}
      lang="en"
      open={open || undefined}
    />
  );
}
```

## Development

```bash
pnpm install
pnpm build   # dist/hotosm-share-dialog.js + .d.ts
```
