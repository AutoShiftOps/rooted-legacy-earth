import express from "express";
import { getSession } from "../db/neo4j.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const VALID_SCOPES = ["store_data", "public_globe_display", "match_engine_participation", "contact_reveal_on_match"];

router.post("/:id/consent", requireAuth, async (req, res, next) => {
  const { scope, granted } = req.body;
  if (!VALID_SCOPES.includes(scope)) {
    return res.status(400).json({ error: `scope must be one of ${VALID_SCOPES.join(", ")}` });
  }
  const session = getSession();
  try {
    const personResult = await session.run("MATCH (p:Person {id: $id}) RETURN p", { id: req.params.id });
    if (personResult.records.length === 0) return res.status(404).json({ error: "Person not found" });
    const person = personResult.records[0].get("p").properties;

    if (person.dataSubjectType === "minor" && granted &&
        (scope === "public_globe_display" || scope === "match_engine_participation")) {
      return res.status(403).json({ error: "This consent scope is disabled for minors regardless of guardian input." });
    }

    if (granted) {
      await session.run(
        `MATCH (p:Person {id: $id})-[:HAS_CONSENT]->(c:Consent {scope: $scope})
         SET c.granted = true, c.grantedAt = datetime(), c.revokedAt = null`,
        { id: req.params.id, scope }
      );
    } else {
      await session.run(
        `MATCH (p:Person {id: $id})-[:HAS_CONSENT]->(c:Consent {scope: $scope})
         SET c.granted = false, c.revokedAt = datetime()`,
        { id: req.params.id, scope }
      );
      if (scope === "store_data") {
        await session.run(
          `MATCH (p:Person {id: $id})
           SET p.name = "Removed at user request", p.bio = "", p.photoUrl = null,
               p.lat = null, p.lng = null`,
          { id: req.params.id }
        );
      }
    }
    res.json({ id: req.params.id, scope, granted });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
