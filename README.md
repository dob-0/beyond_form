# beyond_form

Landing page and project space for **Beyond Form** — a three-day creative
workshop (open call) within **Gyumri Art Week**, in cooperation with the
Institute of Contemporary Art, Gyumri Academy of Fine Arts and
G.Urban Platform.

- **Dates:** 03.08 – 05.08 · Gyumri, Armenia
- **Theme:** "City and Time" / «Քաղաքը և ժամանակը»
- **Apply:** [application form](https://docs.google.com/forms/d/e/1FAIpQLScV1g-mu1jVS96-NgacscmwMExVktXWw6QfEtw2YeoBp2IoUA/viewform)

## Structure

| Path | Role |
|------|------|
| `index.html` | Self-contained landing page (no build step, no dependencies) |
| `assets/` | Web images (partner logo strip, Gyumri Art Week houses mark) |
| `references/` | Source material from the shared Drive folder: open call text, logos.pdf, design reference photos |
| `docs/PROJECT.md` | Project brief, design direction, ecosystem notes |
| `di-space.json` | Linked-space manifest for di.iiii |
| `scripts/sync-space.mjs` | Pushes this repo into a di.iiii space (same engine as br_id_ge) |

## Ecosystem

Sibling project of [di.iiii](https://github.com/dob-0/di.iiii)
(di-studio.xyz), following the `br_id_ge` linked-space pattern:

```bash
node scripts/sync-space.mjs --repo . --dry-run   # preview
node scripts/sync-space.mjs --repo .             # create/update space "beyond_form"
```

## Preview locally

```bash
python3 -m http.server 8090   # then open http://localhost:8090
```
