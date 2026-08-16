# Consent & Legal Data Model

## Why this matters
Rooted processes sensitive personal and family data — including geolocation,
photos, relationship structures, and data about deceased and minor individuals.
This is legally sensitive under Canada's PIPEDA and, for any EU/UK users, GDPR.
Consent must be **meaningful**: specific, informed, and revocable — not a single
bundled checkbox. (See PIPEDA's Consent principle and GDPR Guidelines 05/2020.)

## Data Subject Types
Every `Person` node carries a `data_subject_type` enum:

- `self` — a living user who registered and controls their own consent.
- `minor` — a living person under legal age; consent is given by a
  parent/guardian account linked via `GUARDIAN_OF` edge.
- `deceased` — consent is given by the submitting next-of-kin/descendant on
  the deceased's behalf; no self-consent right exists, but the record can be
  disputed/flagged by other verified relatives.

## Granular Consent Scopes
Stored as a `Consent` node linked to each `Person` via `HAS_CONSENT`:

| Scope | Purpose | Default |
|---|---|---|
| `store_data` | Store profile, relationship, and location data | Required to use the app |
| `public_globe_display` | Show this person's pin/name publicly on the globe | Off (private tree only) |
| `match_engine_participation` | Allow this person's data to be compared against other users' trees for reconnection suggestions | Off (explicit opt-in) |
| `contact_reveal_on_match` | If a match is confirmed, allow sharing contact info with the matched party | Off, asked again at match time |

## Match & Reconnection Flow
1. User A opts a tree into `match_engine_participation`.
2. Matching service runs graph-overlap + fuzzy attribute comparison against
   other opted-in trees (see Phase 3 service).
3. A candidate match is surfaced privately to **both** sides as
   "possible connection" — no contact info is shared yet.
4. Both sides must independently confirm before `contact_reveal_on_match`
   is triggered and any identifying info is exchanged.
5. Either side can reject or ignore — no notification is sent to the other
   party on rejection, to avoid exposing rejection as information.

## Withdrawal
Revoking any consent scope is a single action in account settings and takes
effect immediately: `public_globe_display` off = pin removed from public view
within one sync cycle; `store_data` off = full anonymization job queued
(name replaced with "Removed at user request", media deleted, relationship
edges preserved as anonymous placeholders so others' trees don't break).

## Minors
No minor profile can enable `public_globe_display` or
`match_engine_participation` — these toggles are hard-disabled in the UI and
API for any `Person` flagged `minor`, regardless of guardian input.
