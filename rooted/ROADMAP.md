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
🟢 **Core wiring complete.**
- Multi-stage fly-to camera choreography fires on pin click (`useFlyToChoreography`,
  in `frontend/src/hooks/`)
- Timeline scrubber filters globe pins/arcs live by year (`TimelineScrubber`,
  in `frontend/src/components/`)

### Still Pending
- ⚪ Ambient audio layer (Howler.js-based, volume tied to zoom level)
- ⚪ Day/night terminator shader on the globe texture
- ⚪ Particle "remembrance" effect for deceased pins (Three.js Points system) —
  currently only a static glow-ring color/size treatment, not particles

## Phase 3 — Reconnection Engine
🟢 **End-to-end loop complete.** This is the app's core motto and now
actually functions, not just exists as pure functions.
- `POST /api/matches/scan` — on-demand candidate scan for the calling user
- `matchQueue.js` — nightly cron job scaffold (2:00 AM), wired into server startup
- `Match` Neo4j node type + `CANDIDATE_OF` edges linking candidate Person pairs
- `GET /api/matches`, `POST /api/matches/:id/confirm`, `POST /api/matches/:id/reject` — all live
- Frontend `/matches` page + `PossibleConnectionCard` — confirm/reject UI working
- Dashboard nav link added ("Possible connections")

### Still Pending
- ⚪ **matchQueue.js is a scaffold, not fully implemented** — the nightly job
  currently loops opted-in users but doesn't yet call the actual scan logic
  per user (the Cypher/scoring is duplicated in the on-demand route only).
  Needs refactor: extract scan logic into a shared service function callable
  from both the API route and the cron job.
- ⚪ Notification trigger on mutual confirmation — no email/push exists yet
  (see Foundational Gaps), so a "mutually_confirmed" match currently has no
  way to actually notify either user outside of refreshing `/matches`.
- ⚪ Pagination/ranking on `GET /api/matches` if match volume grows.

## Phase 4 — Community & Virality
🟢 **Core features complete.**
- `gedcomExporter.js` — serializes a tree to GEDCOM 5.5.1, wired to
  `GET /api/tree/:rootPersonId/export/gedcom`, with a working export button
  on the person profile page
- `memorialWallRoutes.js` — public, unauthenticated `/api/memorial/:personId`
  respecting `public_globe_display` consent, with a live `/memorial/:id`
  frontend page

### Still Pending
- ⚪ GEDCOM **import** UI — `gedcomImporter.js` (line parser) still exists
  only as a backend utility with no upload endpoint or review screen for a
  user to confirm/edit parsed records before committing them to their tree.
- ⚪ `snapshotGenerator.js` — server-side subtree image/link generator for
  social sharing. Not started.
- ⚪ Guestbook comment storage — `GET /api/memorial/:personId/guestbook`
  currently returns an empty array as a stable contract; no write endpoint,
  no persistence.

---

## Build Fix Log

**2026-08-23 — Vercel build failure #1: cross-directory import.** The initial
Phase 2 wiring commit imported `useFlyToChoreography.js` and
`TimelineScrubber.jsx` from the top-level `rooted/phase2-cinematic/` folder —
outside `rooted/frontend/`, which is Vercel's configured Root Directory.
Since Vercel builds that directory in isolation, the cross-directory import
broke module resolution and failed every deploy. Fixed by relocating both
files into `frontend/src/hooks/` and `frontend/src/components/`
respectively, and by adding `vercel.json` directly inside `rooted/frontend/`
(it previously only existed at `rooted/infra/vercel.json`, unreachable once
Root Directory scoping applies).

**2026-08-23 — Vercel build failure #2: top-level await unsupported by
build target.** After fix #1, a new build error surfaced:
`Top-level await is not available in the configured target environment
("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)`.
Root cause: `react-globe.gl`'s dependency `three.js` ships a WebGPU
capability-detection snippet using top-level `await navigator.gpu.requestAdapter()`.
Vite's default esbuild target for production builds doesn't support
top-level await (that requires ES2022+). Fixed by setting both
`build.target` and `optimizeDeps.esbuildOptions.target` to `"esnext"` in
`frontend/vite.config.js` — safe since all modern evergreen browsers
support top-level await natively.

**Note:** `rooted/backend/src/routes/matches.js` and `gedcomExport.js` still
import from `rooted/phase3-reconnection-engine/` and
`rooted/phase4-community/` respectively using relative paths that reach
outside `rooted/backend/`. This has **not** caused a failure yet because
Render (unlike Vercel) deploys the whole repo rather than isolating a
subdirectory — but if Render's root directory setting is ever scoped the
same way Vercel's is, this will break identically. Worth proactively fixing
by moving those shared modules into `backend/src/services/` if Render
deployment issues appear.

---

## Foundational Gaps (not in original phase list, blocking real usage)

- ⚪ **Photo/media upload** — `photoUrl` is a field everywhere but there's no upload endpoint. Needs object storage integration (Supabase Storage recommended — matches existing stack).
- ⚪ **Email verification** — registration works but emails aren't verified.
- ⚪ **Password reset** — no recovery flow exists.
- ⚪ **Notifications** — no email/push system; required for match confirmations and "on this day" resurfacing. This is now the single biggest UX gap in the Phase 3 loop — users have no way to know a match was confirmed without manually revisiting `/matches`.
- ⚪ **Attestation abuse rate-limiting** — general API rate limiting exists, but nothing specifically throttles mass creation of deceased/minor records.
- ⚪ **Guardian account linking flow** — `GUARDIAN_OF` relationship type exists in schema but there's no UI/API flow for a parent account to claim/link a minor's record.

---

## Phase 5 — Emotional Depth & Retention

- ⚪ **Voice/video memory capsules** — attach a short voice note or video to a
  deceased person's profile. Requires media upload (see Foundational Gaps)
  plus a new `MemoryCapsule` node type linked to `Person`.
- ⚪ **"On this day" resurfacing** — gentle notification on a birthday or
  anniversary of passing. Requires the Notifications system above.
- ⚪ **Collaborative tree editing with version history** — lightweight
  "who changed what, when" log beyond attestation.
- ⚪ **Multi-language support (i18n)** — UI translation layer, prioritizing
  French.
- ⚪ **Offline/PDF export of a tree branch** — printable family tree poster
  or PDF; a natural monetizable feature distinct from GEDCOM export.

---

## Suggested Next Build Priorities

1. **Notifications system** — highest priority; the Phase 3 loop is
   functionally complete but silently useless without a way to alert users
   when a match is confirmed.
2. **matchQueue.js refactor** — extract shared scan logic so the nightly job
   actually works, not just logs a loop.
3. **Photo upload** — blocks a genuinely complete profile/memorial experience.
4. **GEDCOM import UI** — completes the Phase 4 data-portability story
   (export already works; import doesn't yet).
