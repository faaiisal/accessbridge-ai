# AccessBridge AI

AccessBridge AI is a local-first accessibility workspace for developers. Its
primary tool, **AccessLens AI**, runs a small set of deterministic checks on
HTML and React / JSX snippets, shows review guidance, and creates optional
starter suggestions without changing the original input.

The project is a hackathon prototype. Automated checks are limited and do not
prove WCAG conformance or replace assistive-technology and human testing.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No AI API key or `.env` file is needed to run the current app. `.env.example`
documents a future optional server-side configuration; no model requests are
made in this version.

## AccessLens workflow

1. Choose HTML or React / JSX and enter a snippet (up to 40,000 characters).
2. Select **Analyze code** to run local checks in the browser.
3. Review findings, affected elements, descriptions, and recommendations.
4. Optionally create starter suggestions. They use explicit placeholders and
   never overwrite the original input.
5. Review and copy the suggested snippet, then re-run the supported checks.
6. Complete the manual keyboard and assistive-technology checklist.

### Supported checks

- Images with no `alt` attribute.
- Buttons without detected text or a supported naming attribute.
- Links with an `href` but no detected text or supported naming attribute.
- Common form controls without a detected label or supported naming attribute.
- Heading levels that skip a step.
- Missing `lang` on an `html` element when a full document is supplied.

Findings use application-specific rule names, not WCAG success criterion IDs.
The source scanner does not execute submitted code. JSX analysis is
best-effort: it only inspects literal HTML elements and cannot resolve custom
components, computed properties, or dynamic content. A clean result means only
that these specific patterns were not detected.

### Suggested code and verification

Starter suggestions insert unmistakable placeholder text or attributes. For
example, `alt="Describe this image"` does not describe the actual image; replace
it with meaningful text or confirm that an empty alternative is appropriate
for a decorative image. Verification re-runs the same local checks on the
suggested text. It cannot evaluate whether placeholder content is accurate,
prove accessibility, or replace the manual checklist.

## Other modules

- **SkillBridge AI** is a local bilingual sample plan. Its lesson and exercise
  content is fixed sample content, not AI-generated or personalized
  instruction. Completion state is stored in this browser only.
- **SupportPilot AI** searches a small, visible sample knowledge base. It
  presents the matching source, does not invent an answer when there is no
  match, and recommends human support for unresolved questions.

## AI integration status

AI explanations and model-generated repairs are not connected in this build.
The app does not load a model key, contact Meta, or display generated content
as if it came from an AI provider. A future integration should be server-side,
use a shared provider interface, validate outputs, and keep secrets out of
client code. The optional key name is `MODEL_API_KEY`; it is not required now.

## Project structure

```text
src/
  app/                 App Router pages and global styles
  components/
    modules/           AccessLens and supporting local demos
    workspace-shell.tsx
  lib/
    accessibility/     Deterministic source checks and starter edits
    ai/                Provider-independent integration contract
```

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The project currently has no dedicated automated test runner. Test the AccessLens
workflow with empty input, malformed and oversized snippets, HTML and JSX
examples, suggested code, and verification. Also check keyboard-only use,
mobile layouts, screen-reader output, and the original-versus-suggested
comparison manually.
