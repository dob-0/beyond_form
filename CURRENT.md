# CURRENT — beyond_form

## State (2026-07-09)

Rebuilt as Vite + React + React Three Fiber (user approved the static
design, asked for "more threejs and react fiber"). Versions match di.iiii
(react 18.3, three 0.166.1, fiber 8, drei 9).

- `src/HeroScene.jsx` — hero: 8 extruded Text3D letters (helvetiker_bold),
  tumbling composition from the static draft, slow per-letter spin +
  mouse parallax, monochrome standard material
- `src/StrokeField.jsx` — theme section: 3D stroke scatter, upper-right
  only (must not overlap text), hidden ≤800px
- Both scenes respect prefers-reduced-motion; HTML overlays keep the
  mix-blend-mode: difference legibility trick
- `npm run build` → single-file `dist/index.html` (~1.1MB, all inlined)
  via vite-plugin-singlefile; `di-space.json` entry points at it
- `references/`, `assets/`, docs as before; open-call text verbatim
- Verified via playwright screenshots (desktop hero/full + mobile)

## Open

- [ ] Push to staging: user must approve/run
      `LIVE_API_TOKEN=... node scripts/sync-space.mjs --repo . --to https://staging.di-studio.xyz/serverXR`
      (auto-mode classifier blocks the live push from bg sessions)
- [ ] Application deadline not stated in the doc — confirm and add if needed
- [ ] Mentor names / program schedule not yet available
