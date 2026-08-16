# Phase 3 — Reconnection Engine

The feature that fulfills the app's actual motto: "connect your missed
beloved ones." Only activates for `Person` nodes with
`match_engine_participation` consent granted (see `docs/CONSENT_MODEL.md`).

## Matching Strategy
1. **Structural graph overlap** — two independently created trees may share
   an ancestor. Query for `Person` nodes with matching normalized name +
   overlapping birth year range that sit at compatible generational depth
   in both trees.
2. **Fuzzy attribute scoring** — combine name similarity (Jaro-Winkler),
   birth year proximity, birthplace string similarity, and known relative
   name overlap into a single confidence score (0–1).
3. **Human-in-the-loop confirmation** — never auto-merge. Surface candidates
   above a confidence threshold (e.g. 0.75) to both account owners as
   "possible connection" cards. Merge only executes after both confirm.

## Suggested Service Structure
```
phase3-reconnection-engine/
├── matchScoring.js       # Jaro-Winkler + year/place similarity scoring
├── candidateQuery.cypher # Neo4j query finding structurally similar unlinked nodes
├── matchQueue.js         # background job that runs scoring nightly for opted-in trees
└── mergeRequestFlow.js   # consent-gated mutual-confirmation merge logic
```

## Privacy Guardrails (do not skip)
- Only opted-in Person nodes are queryable by the match service.
- Rejected matches are never shown again to the rejecting party, and the
  other party is never told a rejection happened.
- All match computations should run in a backend job — never expose raw
  cross-tree data to the frontend before mutual confirmation.
