# Beyond Form — Open Call

Three-day creative workshop within **Gyumri Art Week**, in cooperation with the
Institute of Contemporary Art, Gyumri Academy of Fine Arts and G.Urban Platform.

- **Dates:** 03.08 – 05.08
- **Place:** Gyumri, Armenia
- **Theme:** "City and Time" / «Քաղաքը և ժամանակը»
- **Application form:** https://docs.google.com/forms/d/e/1FAIpQLScV1g-mu1jVS96-NgacscmwMExVktXWw6QfEtw2YeoBp2IoUA/viewform
- **Source material:** Google Drive folder `open_call` (mirrored in `references/`)

## Open call text (canonical, both languages)

See `references/open_call.txt` — verbatim export of the shared Google Doc
"Beyond Form". Do not paraphrase it on the landing page; use it as written.

Summary:

- Workshop for young artists, students, and anyone interested in contemporary
  art, new media, 3D modeling, 3D printing and visual projections.
- Participants develop ideas with mentors and create works based on the
  festival theme.
- Theme: the city as a space of intersection, coexistence and transformation
  of times — how cities carry memory, change over time, and what futures can
  be imagined for them. Gyumri itself is the living research environment.
- Works can be personal, research, or experimental interpretations of the
  theme using the technologies offered during the workshop.

## Partners / logos

`references/logos/logos.pdf` (web strip: `assets/partner-logos.png`):

1. Institute for Contemporary Art Yerevan (Ժամանակակից արվեստի ինստիտուտ)
2. ArtNexus / Konstnärsnämnden — The Swedish Arts Grants Committee
3. Sverige (Sweden)

Also shown separately in the footer, sized to match the other partner
logos:

- State Academy of Fine Arts of Armenia — Gyumri Branch
  (`assets/academy-gyumri-branch-hy.png`, trimmed/transparent from
  `references/logos/academy-gyumri-full-hy.png`)
- Gyumri Art Week International (`assets/gyumri-art-week-logo.png`,
  trimmed/transparent from `references/logos/gyumri-art-week-source-hires.png`,
  rasterized from the user-provided `logo Gyumri Art Week.pdf`)

Footer also credits: Gyumri Art Week, Gyumri Academy of Fine Arts,
G.Urban Platform. The four-houses stamp mark (`assets/gaw-houses.png`) is the
Gyumri Art Week identity mark.

## Design direction

The photos in `references/photos/` are **style references**, not content:

- black & white only, editorial/brutalist Swiss typography
- oversized letterforms, tumbling/rotated, cropped by the frame
  (`photo_2026-07-09_00-07-09.jpg` — narration festival poster)
- split white/black twin panels (`photo_2026-07-08_23-21-08.jpg`)
- scattered short black strokes as texture (`photo_2026-07-08_23-28-17.jpg`)
- huge text overlapping organic black shapes (`photo_2026-07-09_00-07-10.jpg`)

The React app implements this: black hero with 3D extruded tumbling
BEYOND FORM letters (R3F, `src/HeroScene.jsx`), AM/EN split about section,
giant "City and Time" theme block with a 3D stroke scatter
(`src/StrokeField.jsx`), numbered detail panels, full-width apply CTA.

## Ecosystem position

Sibling repo of the **di.iiii** platform (like `br_id_ge`), linked into
di.iiii as a space via `di-space.json` + `scripts/sync-space.mjs`:

```
node scripts/sync-space.mjs --repo . [--dry-run]
```

Target space: `beyond_form` on https://di-studio.xyz/serverXR.
