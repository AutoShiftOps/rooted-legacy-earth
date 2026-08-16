# Rooted 🌍
### Connect your missed beloved ones.

Rooted is a cinematic, 3D-globe web application for mapping family history,
memorializing loved ones, and reconnecting with relatives lost across time and
distance. Every family member is pinned to a real place on a rotating Earth;
every relationship is an edge in a living family graph.

## Monorepo Structure

```
rooted/
├── frontend/                  # React + Three.js (react-globe.gl) client — Phase 1
├── backend/                   # Node.js + Express + Neo4j API — Phase 1
├── infra/                     # Docker Compose, deploy configs — Phase 1
├── phase2-cinematic/          # Camera flythroughs, timeline scrubber, audio
├── phase3-reconnection-engine/# Graph-overlap matching + consent-gated merge flow
├── phase4-community/          # Public memorial walls, GEDCOM import/export
└── docs/                      # Architecture, schema, legal/consent design
```

## Phase Roadmap

| Phase | Focus | Status |
|---|---|---|
| 1 | Core loop: register, build tree, pin to globe, view tree panel | 🟢 Scaffolded |
| 2 | Cinematic polish: fly-to camera, timeline scrubber, ambient audio | 🟡 Stubbed |
| 3 | Reconnection engine: cross-tree match detection, consent-gated merge | 🟡 Stubbed |
| 4 | Community: public memorial walls, GEDCOM import/export | 🟡 Stubbed |

## Quick Start (Local Dev)

```bash
git clone https://github.com/devops-den/rooted-legacy-earth.git
cd rooted-legacy-earth/rooted
cp backend/.env.example backend/.env
docker compose -f infra/docker-compose.yml up --build
```

Frontend: http://localhost:5173
Backend API: http://localhost:4000
Neo4j Browser: http://localhost:7474

## Deployment

- **Frontend** → Vercel (see `infra/vercel.json`)
- **Backend + Neo4j** → Render (see `infra/render.yaml`)
- **CI** → GitHub Actions (`.github/workflows/ci.yml`)

See `docs/DEPLOYMENT.md` for the full step-by-step deployment guide.

## Legal & Consent Model

See `docs/CONSENT_MODEL.md`. Summary: consent is granular and purpose-specific
(storage vs. public display vs. match-engine participation), revocable at any
time, and distinguishes self / minor / deceased data subjects. Built to meet
PIPEDA (Canada) baseline and GDPR-grade granularity for global users.
