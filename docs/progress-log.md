# Progress log

## P2 — Real URL scanning (axe-core + Playwright)
- Status: Tested.
- Files: `src/lib/scan/types.ts`, `src/lib/scan/url-validator.ts`, `src/lib/scan/axe-runner.ts`, `src/app/api/accesslens/scan/route.ts`, `src/components/modules/url-scan-panel.tsx`, `src/components/modules/accesslens-workspace.tsx`.
- Commands: `npx tsc --noEmit` pass, `npm run lint` pass, `npm run build` pass.
- Tests: validator rejects javascript:/localhost/metadata/private-IP/non-URL, accepts https://example.com. Live axe run on https://example.com returned 3 violations (landmark-one-main, page-has-heading-one, region; all moderate), 1 incomplete, 10 passes.
- Limitations: browser engine required on host; Vercel serverless cannot run Playwright — route returns 503 there. Best-practice rules carry no WCAG tag; UI shows that honestly. AI explanations still pending (P4).

## Scan route bundling fix (2026-11-01)
- Status: Tested.
- Root cause: Next bundled `@axe-core/playwright` into the route bundle, breaking its `page.evaluate` axe injection (`ReferenceError: t is not defined`). Every URL scan returned generic 502.
- Fix: `serverExternalPackages: ["playwright", "playwright-core", "@axe-core/playwright", "axe-core"]` in `next.config.ts`, plus server-side error logging in the scan route (message only, never secrets).
- Verified end-to-end via production `next start`: `https://example.com` → 3 violations; `https://partners.epyra.agency/` → 3 violations (`color-contrast` serious ×12, `label-content-name-mismatch` serious ×3, `region` moderate), 3 incomplete, 52 passes.
