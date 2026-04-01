# UI Mockup Export

This folder stores UI screenshots exported from the app routes.

## Output Folder

- `mockups/ui-pages/*.png`

## Run

```bash
npm run export:ui:serve
```

In another terminal:

```bash
npm run export:ui
```

The command will:

1. Use your running server at `http://localhost:4000`.
2. Log in with `E2E_USERNAME` / `E2E_PASSWORD` (defaults: `EMP-0037` / `123456aA@`).
3. Capture full-page screenshots for all routes in `e2e/ui-export.spec.ts`.
