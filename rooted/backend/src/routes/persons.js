import express from "express";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../db/neo4j.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res, next) => {
  const { name, birthYear, deathYear, bio, lat, lng, photoUrl, dataSubjectType, isLiving } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const validTypes = ["self", "minor", "deceased", "relative"];
  const subjectType = validTypes.includes(dataSubjectType) ? dataSubjectType : "relative";

  const session = getSession();
  try {
    const personId = uuidv4();
    await session.run(
      `MATCH (u:User {id: $userId})
       CREATE (p:Person {
         id: $personId, name: $name, birthYear: $birthYear, deathYear: $deathYear,
         bio: $bio, lat: $lat, lng: $lng, photoUrl: $photoUrl,
         dataSubjectType: $subjectType, isLiving: $isLiving
       })
       CREATE (u)-[:MANAGES]->(p)
       CREATE (c1:Consent {scope: "store_data", granted: true, grantedAt: datetime()})
       CREATE (c2:Consent {scope: "public_globe_display", granted: false})
       CREATE (c3:Consent {scope: "match_engine_participation", granted: false})
       CREATE (c4:Consent {scope: "contact_reveal_on_match", granted: false})
       CREATE (p)-[:HAS_CONSENT]->(c1)
       CREATE (p)-[:HAS_CONSENT]->(c2)
       CREATE (p)-[:HAS_CONSENT]->(c3)
       CREATE (p)-[:HAS_CONSENT]->(c4)`,
      {
        userId: req.userId, personId, name,
        birthYear: birthYear || null, deathYear: deathYear || null,
        bio: bio || "", lat: lat ?? null, lng: lng ?? null,
        photoUrl: photoUrl || null, subjectType, isLiving: isLiving ?? (subjectType !== "deceased")
      }
    );
    res.status(201).json({ id: personId });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (p:Person {id: $id})
       OPTIONAL MATCH (p)-[r]-(other:Person)
       RETURN p, collect({type: type(r), otherId: other.id, otherName: other.name}) AS relationships`,
      { id: req.params.id }
    );
    if (result.records.length === 0) return res.status(404).json({ error: "Person not found" });
    const record = result.records[0];
    res.json({ person: record.get("p").properties, relationships: record.get("relationships") });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  const allowedFields = ["name", "birthYear", "deathYear", "bio", "lat", "lng", "photoUrl"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const session = getSession();
  try {
    await session.run(
      `MATCH (p:Person {id: $id}) SET p += $updates`,
      { id: req.params.id, updates }
    );
    res.json({ id: req.params.id, updated: Object.keys(updates) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.post("/:id/relationships", requireAuth, async (req, res, next) => {
  const { targetPersonId, type } = req.body;
  const allowedTypes = ["PARENT_OF", "MARRIED_TO", "SIBLING_OF", "GUARDIAN_OF"];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of ${allowedTypes.join(", ")}` });
  }
  const session = getSession();
  try {
    await session.run(
      `MATCH (a:Person {id: $sourceId}), (b:Person {id: $targetId})
       CREATE (a)-[:${type}]->(b)`,
      { sourceId: req.params.id, targetId: targetPersonId }
    );
    res.status(201).json({ source: req.params.id, target: targetPersonId, type });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
