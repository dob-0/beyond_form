# AGENTS — beyond_form

Routing guide for AI agents working in `beyond_form`.

## What this is

Open-call landing page for **Beyond Form**, a three-day workshop within
Gyumri Art Week (03.08–05.08, Gyumri). Theme: "City and Time". Static,
dependency-free `index.html`; sibling of the di.iiii platform, linked in as
space `beyond_form` via `di-space.json` + `scripts/sync-space.mjs`.

## Rules

- **Read `CURRENT.md` before the first edit of a session.**
- Open-call text is canonical: `references/open_call.txt`. Never paraphrase
  or "improve" it on the page — both Armenian and English must stay verbatim.
- Aesthetic is locked: black & white only, brutalist editorial typography.
  Design references live in `references/photos/` and are documented in
  `docs/PROJECT.md`. No color, no decorative chrome, no frameworks.
- `index.html` stays self-contained (inline CSS, no build step).
- Assets in `assets/` are derived from `references/` — regenerate, don't
  hand-edit.

## Ecosystem

```
di.iiii (dob-0/di.iiii)      ← platform, hosting, serverXR, auth
├── br_id_ge                  ← sibling: tele-symbiotic XR performance
└── beyond_form (this repo)   ← sibling: Gyumri Art Week open call
```
