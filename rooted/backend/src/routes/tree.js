import express from "express";
import { getSession } from "../db/neo4j.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:rootPersonId", requireAuth, async (req, res, next) => {
  const depth = Math.min(parseInt(req.query.depth || "4", 10), 6);
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (root:Person {id: $rootId})
       CALL apoc.path.subgraphAll(root, {
         relationshipFilter: "PARENT_OF|MARRIED_TO|SIBLING_OF|GUARDIAN_OF",
         maxLevel: $depth
       }) YIELD nodes, relationships
       RETURN nodes, relationships`,
      { rootId: req.params.rootPersonId, depth }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Root person not found" });
    }

    const record = result.records[0];
    const nodes = record.get("nodes").map((n) => n.properties);
    const relationships = record.get("relationships").map((r) => ({
      type: r.type,
      startId: r.properties.id || null,
      source: r.startNodeElementId,
      target: r.endNodeElementId,
    }));

    res.json({ nodes, relationships });
  } catch (err) {
    if (err.message && err.message.includes("apoc")) {
      const session2 = getSession();
      try {
        const fallback = await session2.run(
          `MATCH (root:Person {id: $rootId})-[r]-(connected:Person)
           RETURN root, collect({rel: type(r), person: connected}) AS connections`,
          { rootId: req.params.rootPersonId }
        );
        if (fallback.records.length === 0) return res.status(404).json({ error: "Root person not found" });
        const rec = fallback.records[0];
        return res.json({
          root: rec.get("root").properties,
          connections: rec.get("connections").map((c) => ({ rel: c.rel, person: c.person.properties })),
          note: "APOC not installed — returned 1-hop fallback. Install APOC plugin for full subgraph traversal."
        });
      } finally {
        await session2.close();
      }
    }
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
