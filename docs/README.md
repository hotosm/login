# Auth Documentation

Documentation for HOTOSM authentication libraries (auth-libs).

## Quick Start

```bash
# Install dependencies
pip install mkdocs mkdocs-material pymdown-extensions

# Run local server with hot reload
mkdocs serve

# Open http://127.0.0.1:8000/
```

## Local Development

### Prerequisites

- Python 3.10+
- pip

### Install dependencies

```bash
pip install mkdocs mkdocs-material pymdown-extensions
```

Or with all optional plugins:

```bash
pip install mkdocs mkdocs-material pymdown-extensions mkdocs-offline
```

### Run dev server

```bash
mkdocs serve
```

- Opens at http://127.0.0.1:8000/
- Auto-reloads on file changes
- Use `mkdocs serve -a 0.0.0.0:8080` for different port/host

### Build static site

```bash
mkdocs build
```

Output goes to `site/` folder (gitignored).

## Editing Documentation

1. Edit `.md` files in `docs/`
2. Browser auto-refreshes
3. Commit and push to deploy

### Markdown Features

- Standard Markdown
- [Mermaid diagrams](https://mermaid.js.org/) with ` ```mermaid `
- Code blocks with syntax highlighting
- Admonitions with `!!! note` / `!!! warning`
- Tables

### Adding a new page

1. Create `docs/new-page.md`
2. Add to `mkdocs.yml` nav section:
   ```yaml
   nav:
     - New Page: new-page.md
   ```

## Structure

```
login/
├── mkdocs.yml            # MkDocs configuration
└── docs/
    ├── README.md         # This file
    ├── index.md          # Home page
    ├── overview.md       # Architecture overview
    ├── python-libs.md    # Python libraries reference
    ├── web-component.md  # <hotosm-auth> web component
    ├── integration-guide.md
    └── projects/
        ├── portal.md
        ├── drone-tm.md
        ├── fair.md
        └── oam.md
```

## Deployment

Docs deploy automatically to GitHub Pages on push to `develop`.

Live site: https://hotosm.github.io/login/
