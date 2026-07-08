# CURRENT — beyond_form

## Last session (2026-07-09)

- Created the whole project: repo `dob-0/beyond_form`, B/W brutalist landing from the Drive references, rebuilt as Vite + React + R3F (3D tumbling hero letters, stroke field), single-file build synced as di.iiii space — live at https://staging.di-studio.xyz/beyond_form (user set isPublic).
- Built the in-design application form: AM labels verbatim + EN hints; Google Form entry IDs extracted and validated via prefill.
- Fixed the "blank page after clicking nav" bug: srcdoc iframes inherit the shell's base URL, so `#anchor` clicks navigated the sandboxed iframe to the shell — fragment clicks now intercepted here AND in di.iiii's preview bootstrap (platform fix `d377dda`, known-fixes entry + regression test).
- Stage 2 shipped in di.iiii (`e9a86d9`, deployed to staging): `open_call_applications` table + public rate-limited POST `/api/open-calls/:callId/applications` (permissive CORS for Origin:null iframes) + admin GET/PATCH; Ops Graph → **Open Call** review board (status chips, notes, filters, CSV) in the preferences design system; wiki article; store + contract tests.
- Form now dual-writes: Google Form (canonical) + serverXR copy for the board. **User tested the full pipeline end-to-end on staging — confirmed working.**
- A declined probe row ("TEST — deploy probe") sits in the staging board as deploy evidence.

## Open

- [ ] Promote di.iiii `dev → main` to get the cycle on production (per di.iiii CURRENT: one manual OAuth click-through on staging first).
- [ ] Stage 1 content still missing from organizers: application deadline, mentor names, day-by-day program — add sections when provided.
- [ ] Stage 3 (optional): applicant confirmation/decision emails — needs an SMTP/provider decision; serverXR has no mailer.
- [ ] Post-workshop: created works become di.iiii spaces linked from this page (exhibition gallery).
