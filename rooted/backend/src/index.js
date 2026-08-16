import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import personRoutes from "./routes/persons.js";
import treeRoutes from "./routes/tree.js";
import consentRoutes from "./routes/consent.js";
import globeRoutes from "./routes/globe.js";
import { closeDriver } from "./db/neo4j.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "5mb" }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "rooted-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/persons", personRoutes);
app.use("/api/tree", treeRoutes);
app.use("/api/persons", consentRoutes);
app.use("/api/globe", globeRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const server = app.listen(PORT, () => console.log(`Rooted API listening on :${PORT}`));

process.on("SIGTERM", async () => {
  await closeDriver();
  server.close(() => process.exit(0));
});
