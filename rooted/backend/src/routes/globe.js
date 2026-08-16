import express from "express";
import { getSession } from "../db/neo4j.js";

const router = express.Router();

router.get("/pins", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (p:Person)-[:HAS_CONSENT]->(c:Consent {scope: "public_globe_display", granted: true})
       WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL
       RETURN p.id AS id, p.name AS name, p.lat AS lat, p.lng AS lng,
              p.isLiving AS isLiving, p.birthYear AS birthYear, p.deathYear AS deathYear
       LIMIT 5000`
    );
    const pins = result.records.map((r) => ({
      id: r.get("id"), name: r.get("name"), lat: r.get("lat"), lng: r.get("lng"),
      isLiving: r.get("isLiving"), birthYear: r.get("birthYear"), deathYear: r.get("deathYear"),
    }));
    res.json({ pins });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
