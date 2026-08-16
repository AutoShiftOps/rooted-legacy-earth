# Phase 4 — Community & Virality

## Planned Features
- **Public memorial walls** — opt-in shareable tribute pages per deceased
  Person, with a public URL slug, guestbook-style comments, and the same
  cinematic globe pin styling as the main app.
- **GEDCOM import/export** — the industry-standard genealogy file format.
  Import lets users migrate existing Ancestry/MyHeritage/FamilySearch trees
  into Rooted instead of starting from zero; export protects users from
  lock-in (a trust signal, especially important for an emotionally sensitive
  product).
- **Shareable tree snapshots** — generate a static image/link of a subtree
  for sharing on social media.

## Suggested File Additions
```
phase4-community/
├── gedcomImporter.js     # parses .ged files into Person/relationship graph mutations
├── gedcomExporter.js     # serializes a user's tree back to GEDCOM 5.5.1
├── memorialWallRoutes.js # public, read-only routes for opted-in memorial pages
└── snapshotGenerator.js  # server-side canvas/SVG render of a subtree for sharing
```

## Privacy Note
Public memorial walls must respect the same `public_globe_display` consent
scope — a memorial page for a deceased person is only publicly reachable if
the managing relative has explicitly opted that Person into public display.
