# Web Component: `<hotosm-auth>`

Lit-based web component for HOTOSM SSO authentication with Hanko and OpenStreetMap integration.

## Installation

```bash
# npm
npm install @hotosm/hanko-auth

# pnpm
pnpm add @hotosm/hanko-auth

# yarn
yarn add @hotosm/hanko-auth
```

## Quick Start

### Import the component

```js
import "@hotosm/hanko-auth";
```

### Use in HTML

```html
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  show-profile="true"
></hotosm-auth>
```

### React Example

```tsx
import { useEffect, useRef } from "react";
import "@hotosm/hanko-auth";

export function AuthButton({ hankoUrl, onLogin }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const handler = (e: CustomEvent) => onLogin(e.detail.user);
    el?.addEventListener("hanko-login", handler);
    return () => el?.removeEventListener("hanko-login", handler);
  }, [onLogin]);

  return <hotosm-auth ref={ref} hanko-url={hankoUrl} osm-required />;
}
```

## Attributes

### Core

| Attribute   | Type   | Default                  | Description                                |
| ----------- | ------ | ------------------------ | ------------------------------------------ |
| `hanko-url` | string | `window.location.origin` | Login service URL for Hanko authentication |
| `base-path` | string | `""`                     | Base URL for OSM OAuth endpoints           |
| `auth-path` | string | `/api/auth/osm`          | OSM auth endpoints path                    |

### Behavior

| Attribute        | Type    | Default        | Description                |
| ---------------- | ------- | -------------- | -------------------------- |
| `osm-required`   | boolean | `false`        | Require OSM connection     |
| `osm-scopes`     | string  | `"read_prefs"` | Space-separated OSM scopes |
| `auto-connect`   | boolean | `false`        | Auto-redirect to OSM OAuth |
| `verify-session` | boolean | `false`        | Verify session on return   |

### Display

| Attribute        | Type    | Default    | Description                                                       |
| ---------------- | ------- | ---------- | ----------------------------------------------------------------- |
| `show-profile`   | boolean | `false`    | Show full profile (vs header button)                              |
| `display-name`   | string  | `""`       | Override display name                                             |
| `lang`           | string  | `"en"`     | Language/locale code (e.g., "en", "es", "fr"). Enlish as fallback |
| `button-variant` | string  | `"filled"` | Button style: `filled`, `outline`, or `plain`                     |
| `button-color`   | string  | `"primary"`| Button color: `primary`, `neutral`, or `danger`                   |

### Redirects

| Attribute               | Type   | Default | Description                |
| ----------------------- | ------ | ------- | -------------------------- |
| `redirect-after-login`  | string | `""`    | URL after successful login |
| `redirect-after-logout` | string | `""`    | URL after logout           |

### Cross-app

| Attribute           | Type   | Default | Description                   |
| ------------------- | ------ | ------- | ----------------------------- |
| `mapping-check-url` | string | `""`    | URL to check user mapping     |
| `app-id`            | string | `""`    | App identifier for onboarding |

## Events

The component dispatches the following custom events:

| Event           | Detail                 | When                        |
| --------------- | ---------------------- | --------------------------- |
| `hanko-login`   | `{ user: HankoUser }`  | User logged in              |
| `osm-connected` | `{ osmData: OSMData }` | OSM account linked          |
| `osm-skipped`   | `{}`                   | User skipped OSM connection |
| `auth-complete` | `{}`                   | Auth flow complete          |
| `logout`        | `{}`                   | User logged out             |

### Event Handling Example

```js
const auth = document.querySelector("hotosm-auth");

auth.addEventListener("hanko-login", (e) => {
  console.log("Logged in:", e.detail.user.email);
});

auth.addEventListener("osm-connected", (e) => {
  console.log("OSM connected:", e.detail.osmData.osm_username);
});

auth.addEventListener("logout", () => {
  console.log("User logged out");
  window.location.href = "/";
});
```

## Usage Modes

### Header Mode (default)

Shows a compact login button in the header:

```html
<header>
  <hotosm-auth
    hanko-url="https://login.hotosm.org"
    redirect-after-login="/"
  ></hotosm-auth>
</header>
```

#### Button Styling

Customize the login button appearance with `button-variant` and `button-color`:

```html
<!-- Filled primary button (default) -->
<hotosm-auth hanko-url="https://login.hotosm.org"></hotosm-auth>

<!-- Outline button -->
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  button-variant="outline"
  button-color="primary"
></hotosm-auth>

<!-- Plain text button -->
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  button-variant="plain"
  button-color="neutral"
></hotosm-auth>

<!-- Filled danger button -->
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  button-variant="filled"
  button-color="danger"
></hotosm-auth>
```

### Profile Mode

Shows full authentication form (for login pages):

```html
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  show-profile
  osm-required
  auto-connect
  redirect-after-login="https://portal.hotosm.org"
></hotosm-auth>
```

## Configuration

### Hanko URL Detection

The component detects the Hanko URL in the following priority order:

1. `hanko-url` attribute
2. `<meta name="hanko-url" content="...">` tag
3. `window.HANKO_URL` global variable
4. `window.location.origin` (fallback)

```html
<!-- Option 1: Attribute -->
<hotosm-auth hanko-url="https://login.hotosm.org"></hotosm-auth>

<!-- Option 2: Meta tag -->
<meta name="hanko-url" content="https://login.hotosm.org" />
<hotosm-auth></hotosm-auth>

<!-- Option 3: JavaScript -->
<script>
  window.HANKO_URL = "https://login.hotosm.org";
</script>
<hotosm-auth></hotosm-auth>
```
