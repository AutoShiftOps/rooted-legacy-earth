import express from "express";
import { getSession } from "../db/neo4j.js";
import { requireAuth } from "../middleware/auth.js";
import { exportTreeToGedcom } from "../services/gedcomExporter.js";

const router = express.Router();

router.get("/:rootPersonId/export/gedcom", requireAuth, async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (root:Person {id: $rootId})
       CALL apoc.path.subgraphAll(root, {
         relationshipFilter: "PARENT_OF|MARRIED_TO|SIBLING_OF|GUARDIAN_OF",
         maxLevel: 6
       }) YIELD nodes, relationships
       RETURN nodes, relationships`,
      { rootId: req.params.rootPersonId }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Root person not found" });
    }

    const record = result.records[0];
    const nodes = record.get("nodes").map((n) => n.properties);
    const relationships = record.get("relationships").map((r) => ({
      type: r.type,
      source: r.startNodeElementId,
      target: r.endNodeElementId,
    }));

    const gedcomText = exportTreeToGedcom(nodes, relationships);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="rooted-family-tree.ged"`);
    res.send(gedcomText);
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
