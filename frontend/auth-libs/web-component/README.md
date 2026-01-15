# @hotosm/hanko-auth

Header authentication widget for HOTOSM applications. Displays login/logout state and user profile dropdown.

**Note:** This package provides only the header widget. The actual login form and profile pages are hosted at the [HOTOSM Login service](https://login.hotosm.org). Users will be redirected there for authentication.

## Installation

Install the package and its peer dependency:

```bash
# npm
npm install @hotosm/hanko-auth @awesome.me/webawesome

# yarn
yarn add @hotosm/hanko-auth @awesome.me/webawesome

# pnpm
pnpm add @hotosm/hanko-auth @awesome.me/webawesome
```

## Usage

### Basic Setup

```javascript
import '@awesome.me/webawesome';
import '@hotosm/hanko-auth';
```

### React/Preact

```jsx
import '@awesome.me/webawesome';
import '@hotosm/hanko-auth';

function Header() {
  return (
    <nav>
      <hotosm-auth hanko-url="https://login.hotosm.org" />
    </nav>
  );
}
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="hanko-url" content="https://login.hotosm.org">
</head>
<body>
  <script type="module">
    import '@awesome.me/webawesome';
    import '@hotosm/hanko-auth';
  </script>
  
  <!-- Header auth widget -->
  <nav>
    <hotosm-auth></hotosm-auth>
  </nav>
</body>
</html>
```

## Component API

### Attributes/Properties

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `hanko-url` | `string` | `window.location.origin` | Hanko API URL (e.g., `https://login.hotosm.org`) |
| `redirect-after-login` | `string` | Current page | Redirect URL after successful login |
| `redirect-after-logout` | `string` | `""` | Redirect URL after logout |
| `display-name` | `string` | `""` | Override user display name |
| `osm-required` | `boolean` | `false` | Show OSM connection requirement indicator |
| `base-path` | `string` | `""` | Base path for API calls |
| `auth-path` | `string` | `"/api/auth/osm"` | OSM connection check endpoint |

### Events

The component dispatches custom events:

```javascript
document.addEventListener('hanko-login', (event) => {
  console.log('User logged in:', event.detail.user);
});

document.addEventListener('hanko-logout', () => {
  console.log('User logged out');
});

document.addEventListener('osm-connected', (event) => {
  console.log('OSM connected:', event.detail.osmData);
});
```

## Examples

### Basic Header Widget

```html
<hotosm-auth
  hanko-url="https://login.hotosm.org"
></hotosm-auth>
```

### With Return URL

Redirect users back to a specific page after login:

```html
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  redirect-after-login="/dashboard"
></hotosm-auth>
```

### Check OSM Connection Status

Show indicator if OSM connection is required:

```html
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  osm-required
  auth-path="/api/auth/osm"
></hotosm-auth>
```

### Custom Display Name

Override the displayed user name:

```html
<hotosm-auth
  hanko-url="https://login.hotosm.org"
  display-name="Custom Name"
></hotosm-auth>
```

## Styling

The component uses the HOT design system with CSS custom properties injected from CDN:

- `hotosm-ui-design/dist/hot.css` - Color, typography, spacing variables
- `hotosm-ui-design/dist/hot-font-face.css` - Font definitions
- `hotosm-ui-design/dist/hot-wa.css` - WebAwesome theme overrides

You can override styles by setting CSS custom properties:

```css
hotosm-auth {
  --hot-color-gray-800: #1a1a1a;
  --hot-font-sans: 'Your Font', sans-serif;
}
```

## Features

- 🔐 **Authentication State** - Shows login/logout status and user info
- 👤 **Profile Dropdown** - Quick access to profile and logout
- 🗺️ **OSM Status Indicator** - Shows OpenStreetMap connection status
- 🎨 **HOT Design System** - Consistent styling with HOT branding
- 📱 **Responsive** - Works on desktop and mobile
- ⚡ **Lightweight** - Built with Lit web components
- 🔄 **Cross-App Sessions** - Shared authentication across HOT tools
- 🎯 **Framework Agnostic** - Works with React, Vue, vanilla JS, etc.

## How It Works

1. **Logged Out**: Displays a "Log in" button
2. **Click Login**: Redirects to `https://login.hotosm.org` for authentication
3. **After Login**: User returns to your app (or `redirect-after-login` URL)
4. **Logged In**: Shows user avatar with dropdown menu:
   - My Profile (redirects to login service)
   - OSM connection status
   - Sign Out

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development with hot reload
pnpm dev
```

## License

AGPL-3.0

## Links

- [Documentation](https://hotosm.github.io/auth-docs)
- [GitHub Repository](https://github.com/hotosm/login)
- [Issues](https://github.com/hotosm/login/issues)
- [HOTOSM Website](https://www.hotosm.org)
