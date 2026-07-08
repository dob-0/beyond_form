# CURRENT — beyond_form

## Last session (2026-07-09)

- Created the project from the Drive folder `open_call`: repo scaffolded, pushed to `dob-0/beyond_form` (public, HTTPS remote).
- Mirrored all source material into `references/` — verbatim AM/EN open-call text, logos.pdf, 5 B/W design reference photos — and extracted web assets (partner logo strip, GAW houses mark).
- Built the landing page: B/W brutalist per the references — tumbling hero letters, AM/EN split about, "City and Time" theme block, 01/02/03 panels, apply CTA → Google Form, partner footer.
- Rebuilt it as Vite + React + R3F on user request (versions matched to di.iiii): hero letters are extruded Text3D with per-letter spin + mouse parallax, theme strokes are a 3D scatter (hidden ≤800px).
- Single-file build (`npm run build` → `dist/index.html`, ~1.1MB all inlined); `di-space.json` entry points at it; verified via playwright screenshots at desktop + mobile.

## Open

- [ ] Push to staging — needs user approval/run:
      `LIVE_API_TOKEN=$(grep ^LIVE_API_TOKEN= ~/di.iiii/.env.local | cut -d= -f2) node scripts/sync-space.mjs --repo . --to https://staging.di-studio.xyz/serverXR`
      (dry-run already passes; auto-mode classifier blocks the live push)
- [ ] Application deadline not stated in the source doc — confirm and add.
- [ ] Mentor names / program schedule not yet available.
- [ ] Possible next: GH Pages deploy like br_id_ge; production sync after staging review.
