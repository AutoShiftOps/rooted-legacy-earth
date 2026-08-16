import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../db/neo4j.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "email, password, and name are required" });
  }
  const session = getSession();
  try {
    const existing = await session.run("MATCH (u:User {email: $email}) RETURN u", { email });
    if (existing.records.length > 0) {
      return res.status(409).json({ error: "Account already exists for this email" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const personId = uuidv4();

    await session.run(
      `CREATE (u:User {id: $userId, email: $email, passwordHash: $passwordHash, createdAt: datetime()})
       CREATE (p:Person {id: $personId, name: $name, dataSubjectType: "self", isLiving: true})
       CREATE (u)-[:OWNS]->(p)
       CREATE (c1:Consent {scope: "store_data", granted: true, grantedAt: datetime()})
       CREATE (c2:Consent {scope: "public_globe_display", granted: false})
       CREATE (c3:Consent {scope: "match_engine_participation", granted: false})
       CREATE (c4:Consent {scope: "contact_reveal_on_match", granted: false})
       CREATE (p)-[:HAS_CONSENT]->(c1)
       CREATE (p)-[:HAS_CONSENT]->(c2)
       CREATE (p)-[:HAS_CONSENT]->(c3)
       CREATE (p)-[:HAS_CONSENT]->(c4)`,
      { userId, email, passwordHash, personId, name }
    );

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, userId, personId });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const session = getSession();
  try {
    const result = await session.run("MATCH (u:User {email: $email}) RETURN u", { email });
    if (result.records.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    const user = result.records[0].get("u").properties;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, userId: user.id });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

export default router;
