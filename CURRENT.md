# CURRENT — beyond_form

## Last session (2026-07-09, continued)

- Apply-first interactivity shipped: hero Apply CTA, two marquee bands funneling to #apply, floating Apply pill (hero→form gap), cursor-repelled 3D hero letters, scroll-reveal sections, difference-blend scroll-progress hairline — all reduced-motion-safe.
- Logos composited: houses mark + partner strip now transparent PNGs on paper (no white boxes); houses mark added to hero (inverted) and as favicon.
- User's 3D logo model (Tripo3D `result.glb`, 41.6MB/1.46M tris; print file `reduced_color.3mf` stays on Desktop) crushed to 661KB via gltf-transform and mounted in the footer as an interactive scene (sway + cursor parallax, static-image fallback), served as a space asset via sync-space basename rewrite.
- Platform fix in di.iiii (`7bfb260`, deployed): fetch()-based loaders in sandboxed iframes were CORS-blocked — `PUBLIC_CORS_ROUTES` now covers project asset GETs alongside open-call submits, with contract tests.
- Three durable methods codified in di.iiii golden rules: human-style verification anywhere, heavy-3D crush-serve-fallback pipeline, open-call cycle as reusable platform capability.

## Earlier today

- Project created from Drive folder → B/W brutalist R3F landing, live at https://staging.di-studio.xyz/beyond_form; in-design bilingual apply form dual-writing to organizers' Google Form (canonical) + serverXR; `/admin → Open Call` review board (statuses, notes, filters, CSV); user verified the full pipeline end-to-end on staging; srcdoc `#anchor` navigation bug fixed page-side and platform-side.

## Open

- [ ] Promote di.iiii `dev → main` for production (di.iiii CURRENT: one manual OAuth click-through on staging first).
- [ ] Organizer content still missing: application deadline, mentor names, day-by-day program.
- [ ] Stage 3 (optional): applicant confirmation/decision emails — needs SMTP/provider decision.
- [ ] Post-workshop: created works become di.iiii spaces linked from this page (exhibition gallery).
- [ ] Housekeeping: declined "TEST — deploy probe" row sits in the staging board; local dev DB has a "probe" row.
