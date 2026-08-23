# Rooted — Full Product Roadmap & Scope

This document is the single source of truth for what's built, what's pending,
and what's been added to scope from later discussion. Update this file
whenever scope changes so nothing gets lost between sessions.

## Status Legend
🟢 Built and working &nbsp;|&nbsp; 🟡 Partially built (skeleton/isolated files) &nbsp;|&nbsp; ⚪ Not started

---

## Phase 1 — Core Loop
🟢 **Complete.**
- Auth (register/login, JWT)
- Person + relationship CRUD (Neo4j)
- Granular consent engine (store_data, public_globe_display, match_engine_participation, contact_reveal_on_match)
- Next-of-kin attestation + dispute flow for deceased/minor records
- Cinematic globe (react-globe.gl) with living/deceased pin coloring
- Family tree panel (family-chart / D3)
- Docker Compose local dev, Vercel/Render deploy configs, GitHub Actions CI

## Phase 2 — Cinematic Polish
🟡 Partially built — `TimelineScrubber.jsx` and `useFlyToChoreography.js` exist
as isolated files but are **not wired into** `CinematicGlobe.jsx` or `Dashboard.jsx` yet.

### Pending
- ⚪ Wire `useFlyToChoreography` into `CinematicGlobe.jsx` for multi-stage fly-to on pin click
- ⚪ Wire `TimelineScrubber` into `Dashboard.jsx` / `LandingGlobe.jsx` to filter pins/arcs by year
- ⚪ Ambient audio layer (Howler.js-based, volume tied to zoom level)
- ⚪ Day/night terminator shader on the globe texture
- ⚪ Particle "remembrance" effect for deceased pins (Three.js Points system)

## Phase 3 — Reconnection Engine
🟡 Partially built — Cypher candidate query, match scoring function, and merge
status machine exist as **pure functions with no API route, no job runner,
and no frontend UI.** This is the app's core motto and the biggest functional gap.

### Pending
- ⚪ `POST /api/matches/scan` — API route that runs candidateQuery + scoreMatch for a user's opted-in persons
- ⚪ `matchQueue.js` — background job (node-cron or similar) that runs matching nightly for all opted-in trees
- ⚪ `Match` node schema in Neo4j + `GET /api/matches` to list a user's pending candidate matches
- ⚪ `POST /api/matches/:id/confirm` and `POST /api/matches/:id/reject` routes wired to `mergeRequestFlow.js`
- ⚪ Frontend "Possible Connection" card component + a `/matches` page
- ⚪ Notification trigger on mutual confirmation (see Notifications below)

## Phase 4 — Community & Virality
🟡 Partially built — only `gedcomImporter.js` (line parser) exists.

### Pending
- ⚪ `gedcomExporter.js` — serialize a user's tree back to GEDCOM 5.5.1
- ⚪ `memorialWallRoutes.js` — public read-only routes for opted-in memorial pages, respecting `public_globe_display` consent
- ⚪ `snapshotGenerator.js` — server-side subtree image/link generator for social sharing
- ⚪ Frontend GEDCOM upload UI + import review screen (map parsed records to confirm/edit before committing)
- ⚪ Public memorial wall page template (frontend)

---

## Foundational Gaps (not in original phase list, blocking real usage)

- ⚪ **Photo/media upload** — `photoUrl` is a field everywhere but there's no upload endpoint. Needs object storage integration (Supabase Storage recommended — matches existing stack).
- ⚪ **Email verification** — registration works but emails aren't verified.
- ⚪ **Password reset** — no recovery flow exists.
- ⚪ **Notifications** — no email/push system; required for match confirmations and "on this day" resurfacing.
- ⚪ **Attestation abuse rate-limiting** — general API rate limiting exists, but nothing specifically throttles mass creation of deceased/minor records.
- ⚪ **Guardian account linking flow** — `GUARDIAN_OF` relationship type exists in schema but there's no UI/API flow for a parent account to claim/link a minor's record.

---

## New Scope Additions (added 2026-08-23)

These extend the emotional core of the product beyond the original 4 phases.
Tagged **Phase 5 — Emotional Depth & Retention** for planning purposes.

- ⚪ **Voice/video memory capsules** — attach a short voice note or video to a
  deceased person's profile so visiting feels like hearing them, not just
  reading about them. Requires media upload (see Foundational Gaps) plus a
  new `MemoryCapsule` node type linked to `Person`.
- ⚪ **"On this day" resurfacing** — gentle notification on a birthday or
  anniversary of passing that resurfaces that person's pin/memories.
  Grief-sensitive by design (opt-in, not algorithmic-engagement-driven).
  Requires the Notifications system above.
- ⚪ **Collaborative tree editing with version history** — lightweight
  "who changed what, when" log beyond attestation, so multiple relatives
  editing a shared ancestor don't silently overwrite each other.
- ⚪ **Multi-language support (i18n)** — UI translation layer, prioritizing
  French given the user's own language goals and likely diaspora user base
  where family history crosses language lines.
- ⚪ **Offline/PDF export of a tree branch** — printable family tree poster
  or PDF for a reunion or memorial service. Distinct from GEDCOM export
  (which is data portability, not a physical keepsake) — this is a natural
  monetizable feature (e.g., pay-to-print, or a premium PDF template tier).

---

## Suggested Build Order (this session)

1. Wire Phase 2 stubs into the live globe/dashboard (low risk, high visual payoff)
2. Build Phase 3 reconnection engine end-to-end (API routes, job, Match schema, frontend card) — highest priority, core motto
3. Build Phase 4 GEDCOM export + memorial wall routes
4. Document Phase 5 additions in schema/architecture docs for future build sessions (code to follow in later commits given scope size)
