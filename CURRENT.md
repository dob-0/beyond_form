# CURRENT — beyond_form

## Last session (2026-07-10, evening)

- Merged Suzi's fork (`ginsyuz/beyond_form`, commit `f20a2f9`, fast-forward): academy name corrected in hy+en ("Gyumri Branch of the State Academy of Fine Arts of Armenia"), scattered OPEN CALL GYUMRI hero letters removed, `.af-choices-required` scoped to `input[type="text"]` (mobile overflow fix).
- Synced to staging and prod via `scripts/sync-space.mjs`; both verified serving the new content. Prod open-call applications confirmed intact (10).
- Git clean at `f20a2f9`, pushed to `dob-0/beyond_form` main.

## Previous session (2026-07-10)

- Merged collaborators' forks: `ginsyuz` (content + footer logos) and `emilyanikoghosyan`/Emilia (bilingual form, WCC/G.URBAN logo, glass Open Call text, footer model, thank-you flow) — clean fast-forward; briefly grafted per-house breathing onto her HousesModel then reverted so **Emilia's `14df815` is authoritative**.
- Mobile fixes shipped to prod (**https://di-studio.xyz/beyond_form**, first prod deploy — provisioned space `beyond-form`): hero horizontal-overflow guard (`html/body overflow-x:hidden` — killed the right-edge paper strip), centred/normalised footer partner-logo band, mobile dpr cap, restored "City and Time" scroll-assembly on mobile as a dimmed backdrop.
- ApplyForm Yes/No radios: replaced native `accent-color:paper` (invisible-when-selected on dark) with a custom target that fills paper when checked.
- **Lesson (do not repeat):** off-screen canvas pausing via IntersectionObserver (`frameloop:demand`) breaks inside di.iiii's sandboxed srcdoc iframe — below-fold models never render. Kept all canvases `frameloop:always`; `src/mobile.js` now only exports `IS_MOBILE`.
- Staging and prod in parity; git clean at `f0c1556`.

## Previous session (2026-07-09, continued)

- Apply-first interactivity shipped: hero Apply CTA, two marquee bands funneling to #apply, floating Apply pill (hero→form gap), cursor-repelled 3D hero letters, scroll-reveal sections, difference-blend scroll-progress hairline — all reduced-motion-safe.
- Logos composited: houses mark + partner strip now transparent PNGs on paper (no white boxes); houses mark added to hero (inverted) and as favicon.
- User's 3D logo model (Tripo3D `result.glb`, 41.6MB/1.46M tris; print file `reduced_color.3mf` stays on Desktop) crushed to 661KB via gltf-transform and mounted in the footer as an interactive scene (sway + cursor parallax, static-image fallback), served as a space asset via sync-space basename rewrite.
- Platform fix in di.iiii (`7bfb260`, deployed): fetch()-based loaders in sandboxed iframes were CORS-blocked — `PUBLIC_CORS_ROUTES` now covers project asset GETs alongside open-call submits, with contract tests.
- Three durable methods codified in di.iiii golden rules: human-style verification anywhere, heavy-3D crush-serve-fallback pipeline, open-call cycle as reusable platform capability.

## Earlier today

- Project created from Drive folder → B/W brutalist R3F landing, live at https://staging.di-studio.xyz/beyond_form; in-design bilingual apply form dual-writing to organizers' Google Form (canonical) + serverXR; `/admin → Open Call` review board (statuses, notes, filters, CSV); user verified the full pipeline end-to-end on staging; srcdoc `#anchor` navigation bug fixed page-side and platform-side.

## Open

- [ ] Academy of Fine Arts (Gyumri) footer logo is a light-gray asset — reads faint on the paper footer; needs a darker version or leave as brand intends.
- [ ] Footer 3D village showed the static fallback (not the rotating model) on user's phone — likely WebGL context limit with several canvases on the page; revisit if it matters.
- [ ] Promote di.iiii `dev → main` for production (di.iiii CURRENT: one manual OAuth click-through on staging first).
- [ ] Organizer content still missing: application deadline, mentor names, day-by-day program.
- [ ] Stage 3 (optional): applicant confirmation/decision emails — needs SMTP/provider decision.
- [ ] Post-workshop: created works become di.iiii spaces linked from this page (exhibition gallery).
- [ ] Housekeeping: declined "TEST — deploy probe" row sits in the staging board; local dev DB has a "probe" row.
