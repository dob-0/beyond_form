# AGENTS — beyond_form

Routing guide for AI agents working in `beyond_form`.

## What this is

Open-call landing page for **Beyond Form**, a three-day workshop within
Gyumri Art Week (03.08–05.08, Gyumri). Theme: "City and Time".
Vite + React + React Three Fiber (versions matched to di.iiii: react 18.3,
three 0.166, @react-three/fiber 8, drei 9). Sibling of the di.iiii platform,
linked in as space `beyond_form` via `di-space.json` + `scripts/sync-space.mjs`.

`scripts/sync-space.mjs` is a **vendored copy** of di.iiii's `scripts/space-sync.mjs`
— never edit it here. Change it upstream, then `npm run space:sync:release` in
di.iiii (writes here, bumps `di-space.space.json`'s `minEngine` to match, commits,
pushes — see `docs/ai/space-sync-vendoring.md` there). `scripts/sync-space-check.mjs`
+ `.github/workflows/vendor-check.yml` (also vendored) verify this repo hasn't
drifted, on every push and weekly — a fresh HTTPS fetch of di.iiii's public repo,
no token needed. If it goes red, the fix is always `npm run space:sync:release`
in di.iiii.

## Rules

- **Read `CURRENT.md` before the first edit of a session.**
- Open-call text is canonical: `references/open_call.txt`. Never paraphrase
  or "improve" it on the page — both Armenian and English must stay verbatim.
- Aesthetic is locked: black & white only, brutalist editorial typography.
  Design references live in `references/photos/` and are documented in
  `docs/PROJECT.md`. No color, no decorative chrome, no frameworks.
- Build is single-file: `npm run build` inlines everything (JS, CSS, font
  JSON, images) into `dist/index.html` via vite-plugin-singlefile — that file
  is what sync-space uploads (`di-space.json` entry). Rebuild before syncing;
  `dist/` is committed.
- 3D scenes: `src/HeroScene.jsx` (tumbling extruded letters, mouse parallax),
  `src/StrokeField.jsx` (theme-section stroke scatter, hidden ≤800px so it
  never overlaps text). Both respect `prefers-reduced-motion`.
- Assets in `assets/` are derived from `references/` — regenerate, don't
  hand-edit.

## Ecosystem

```
di.iiii (dob-0/di.iiii)      ← platform, hosting, serverXR, auth
├── br_id_ge                  ← sibling: tele-symbiotic XR performance
└── beyond_form (this repo)   ← sibling: Gyumri Art Week open call
```
