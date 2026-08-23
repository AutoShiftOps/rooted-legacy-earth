import express from "express";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../db/neo4j.js";
import { requireAuth } from "../middleware/auth.js";
import { scoreMatch, MATCH_THRESHOLD } from "../../../phase3-reconnection-engine/matchScoring.js";
import { MATCH_STATUS, confirmMatch, rejectMatch } from "../../../phase3-reconnection-engine/mergeRequestFlow.js";

const router = express.Router();

router.post("/scan", requireAuth, async (req, res, next) => {
  const session = getSession();
  try {
    const candidates = await session.run(
      `MATCH (myUser:User {id: $userId})-[:OWNS|MANAGES]->(p1:Person)-[:HAS_CONSENT]->(:Consent {scope: "match_engine_participation", granted: true})
       MATCH (otherUser:User)-[:OWNS|MANAGES]->(p2:Person)-[:HAS_CONSENT]->(:Consent {scope: "match_engine_participation", granted: true})
       WHERE myUser <> otherUser
         AND NOT (p1)-[*1..3]-(p2)
         AND NOT EXISTS {
           MATCH (p1)-[:CANDIDATE_OF]-(:Match)-[:CANDIDATE_OF]-(p2)
         }
       RETURN p1, p2, myUser.id AS userAId, otherUser.id AS userBId
       LIMIT 500`,
      { userId: req.userId }
    );

    const created = [];
    for (const record of candidates.records) {
      const p1 = record.get("p1").properties;
      const p2 = record.get("p2").properties;
      const { confidence, nameScore, yearScore, placeScore } = scoreMatch(p1, p2);

      if (confidence >= MATCH_THRESHOLD) {
        const matchId = uuidv4();
        await session.run(
          `MATCH (p1:Person {id: $p1Id}), (p2:Person {id: $p2Id})
           CREATE (m:Match {
             id: $matchId, status: $status, confidence: $confidence,
             nameScore: $nameScore, yearScore: $yearScore, placeScore: $placeScore,
             userAId: $userAId, userBId: $userBId, createdAt: datetime()
           })
           CREATE (p1)-[:CANDIDATE_OF]->(m)
           CREATE (p2)-[:CANDIDATE_OF]->(m)`,
          {
            p1Id: p1.id, p2Id: p2.id, matchId,
            status: MATCH_STATUS.SUGGESTED, confidence, nameScore, yearScore, placeScore,
            userAId: record.get("userAId"), userBId: record.get("userBId")
          }
        );
        created.push({ matchId, p1Id: p1.id, p2Id: p2.id, confidence });
      }
    }

    res.json({ scanned: candidates.records.length, matchesCreated: created.length, matches: created });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (m:Match)
       WHERE (m.userAId = $userId OR m.userBId = $userId)
         AND m.status <> "rejected"
       MATCH (p1:Person)-[:CANDIDATE_OF]->(m)<-[:CANDIDATE_OF]-(p2:Person)
       RETURN m, p1, p2`,
      { userId: req.userId }
    );

    const matches = result.records.map((r) => {
      const m = r.get("m").properties;
      const p1 = r.get("p1").properties;
      const p2 = r.get("p2").properties;
      const mine = m.userAId === req.userId ? p1 : p2;
      const theirs = m.userAId === req.userId ? p2 : p1;
      return {
        matchId: m.id,
        status: m.status,
        confidence: m.confidence,
        myPerson: { id: mine.id, name: mine.name },
        candidatePerson: { id: theirs.id, name: theirs.name, birthYear: theirs.birthYear, deathYear: theirs.deathYear }
      };
    });

    res.json({ matches });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.post("/:id/confirm", requireAuth, async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run("MATCH (m:Match {id: $id}) RETURN m", { id: req.params.id });
    if (result.records.length === 0) return res.status(404).json({ error: "Match not found" });
    let matchRecord = result.records[0].get("m").properties;

    if (matchRecord.userAId !== req.userId && matchRecord.userBId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to act on this match" });
    }

    matchRecord = confirmMatch(matchRecord, req.userId);

    await session.run(
      `MATCH (m:Match {id: $id}) SET m.status = $status, m.updatedAt = datetime()`,
      { id: req.params.id, status: matchRecord.status }
    );

    res.json({ matchId: req.params.id, status: matchRecord.status });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.post("/:id/reject", requireAuth, async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run("MATCH (m:Match {id: $id}) RETURN m", { id: req.params.id });
    if (result.records.length === 0) return res.status(404).json({ error: "Match not found" });
    const matchRecord = result.records[0].get("m").properties;

    if (matchRecord.userAId !== req.userId && matchRecord.userBId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to act on this match" });
    }

    const rejected = rejectMatch(matchRecord);
    await session.run(
      `MATCH (m:Match {id: $id}) SET m.status = $status, m.updatedAt = datetime()`,
      { id: req.params.id, status: rejected.status }
    );

    res.json({ matchId: req.params.id, status: rejected.status });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
