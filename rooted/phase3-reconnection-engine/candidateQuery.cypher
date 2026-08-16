// Finds candidate cross-tree matches: Person nodes owned/managed by different
// Users, both opted into match_engine_participation, with no existing path
// between them, similar name and overlapping birth year window (+/- 2 years).
MATCH (u1:User)-[:OWNS|MANAGES]->(p1:Person)-[:HAS_CONSENT]->(c1:Consent {scope: "match_engine_participation", granted: true})
MATCH (u2:User)-[:OWNS|MANAGES]->(p2:Person)-[:HAS_CONSENT]->(c2:Consent {scope: "match_engine_participation", granted: true})
WHERE u1 <> u2
  AND p1.id < p2.id
  AND NOT (p1)-[*1..3]-(p2)
  AND apoc.text.jaroWinklerDistance(toLower(p1.name), toLower(p2.name)) > 0.85
  AND abs(coalesce(p1.birthYear, 0) - coalesce(p2.birthYear, 0)) <= 2
RETURN p1.id AS candidateA, p2.id AS candidateB,
       apoc.text.jaroWinklerDistance(toLower(p1.name), toLower(p2.name)) AS nameScore
ORDER BY nameScore DESC
LIMIT 200;
