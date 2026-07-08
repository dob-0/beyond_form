# CURRENT — beyond_form

## Last session (2026-07-09)

- Created the project from the Drive folder `open_call`: repo scaffolded, pushed to `dob-0/beyond_form` (public, HTTPS remote).
- Mirrored all source material into `references/` — verbatim AM/EN open-call text, logos.pdf, 5 B/W design reference photos — and extracted web assets (partner logo strip, GAW houses mark).
- Built the landing page: B/W brutalist per the references — tumbling hero letters, AM/EN split about, "City and Time" theme block, 01/02/03 panels, apply CTA → Google Form, partner footer.
- Rebuilt it as Vite + React + R3F on user request (versions matched to di.iiii): hero letters are extruded Text3D with per-letter spin + mouse parallax, theme strokes are a 3D scatter (hidden ≤800px).
- Single-file build (`npm run build` → `dist/index.html`, ~1.1MB all inlined); `di-space.json` entry points at it; verified via playwright screenshots at desktop + mobile.

## Staging (live)

https://staging.di-studio.xyz/beyond_form — space `beyond-form`, project
`open-call` (server normalizes slugs to dashes; di-space.json must use the
canonical `open-call` id or re-sync 409s). User set isPublic manually.
In-design apply form ships submissions to the organizers' Google Form in
the background (entry IDs validated via prefill URL, no test submission made).

## Stage 2 (2026-07-09, late)

Full application cycle: the form now dual-writes — Google Form (canonical,
background POST) + di.iiii serverXR (`POST /api/open-calls/beyond_form/applications`).
Review board lives at di.iiii `/admin` → Open Call tab (status chips, notes,
filters, CSV export). di.iiii commit `e9a86d9` on dev — **not deployed yet**;
until dev→staging deploy, the serverXR write 404s and the form silently
falls back to Google-only (by design).

## Open

- [ ] End-to-end form test: submit one entry marked "TEST", check it lands
      in the Google Form responses, delete it (left to user — didn't want
      to write into the organizers' spreadsheet unasked).
- [ ] User reported staging "not work full" — scroll/render/images all pass
      headless checks; needs specifics if it still reproduces.
- [ ] Application deadline not stated in the source doc — confirm and add.
- [ ] Mentor names / program schedule not yet available.
- [ ] Production sync after staging review.
