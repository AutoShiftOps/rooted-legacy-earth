// Moved into backend/src/services/ (was previously in the top-level
// phase3-reconnection-engine/ folder, which broke Render deploys — Render
// isolates the backend Root Directory the same way Vercel isolates the
// frontend, so cross-directory imports fail at runtime with
// ERR_MODULE_NOT_FOUND. See ROADMAP.md Build Fix Log.

function jaroWinkler(a, b) {
  if (a === b) return 1;
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  let matches = 0;
  for (const ch of shorter) if (longer.includes(ch)) matches++;
  return matches / longer.length;
}

export function scoreMatch(personA, personB) {
  const nameScore = jaroWinkler((personA.name || "").toLowerCase(), (personB.name || "").toLowerCase());
  const yearDiff = Math.abs((personA.birthYear || 0) - (personB.birthYear || 0));
  const yearScore = yearDiff === 0 ? 1 : yearDiff <= 2 ? 0.7 : 0.2;
  const placeScore = personA.birthplace && personA.birthplace === personB.birthplace ? 1 : 0.3;

  const confidence = nameScore * 0.5 + yearScore * 0.3 + placeScore * 0.2;
  return { confidence, nameScore, yearScore, placeScore };
}

export const MATCH_THRESHOLD = 0.75;
