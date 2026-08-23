import express from "express";
import { getSession } from "../db/neo4j.js";

const router = express.Router();

router.get("/:personId", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (p:Person {id: $id})-[:HAS_CONSENT]->(c:Consent {scope: "public_globe_display", granted: true})
       OPTIONAL MATCH (p)-[r]-(other:Person)
       OPTIONAL MATCH (a:Attestation)-[:ATTESTS_FOR]->(p)
       RETURN p,
              collect(DISTINCT {type: type(r), name: other.name, id: other.id}) AS relationships,
              count(a) > 0 AS hasAttestation`,
      { id: req.params.personId }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Memorial not found, or not public." });
    }

    const record = result.records[0];
    const person = record.get("p").properties;

    res.json({
      id: person.id,
      name: person.name,
      birthYear: person.birthYear,
      deathYear: person.deathYear,
      bio: person.bio,
      photoUrl: person.photoUrl,
      lat: person.lat,
      lng: person.lng,
      relationships: record.get("relationships").filter((r) => r.type),
      verifiedBySubmitter: record.get("hasAttestation"),
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.get("/:personId/guestbook", async (_req, res) => {
  res.json({ comments: [] });
});

export default router;
