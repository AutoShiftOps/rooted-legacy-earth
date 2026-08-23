import express from "express";

const router = express.Router();

const DEMO_PINS = [
  { id: "demo-1", name: "Amara Okafor", lat: 6.5244, lng: 3.3792, isLiving: true, birthYear: 1990, deathYear: null },
  { id: "demo-2", name: "Chidi Okafor", lat: 6.5244, lng: 3.3792, isLiving: false, birthYear: 1958, deathYear: 2019 },
  { id: "demo-3", name: "Ngozi Okafor", lat: 51.5072, lng: -0.1276, isLiving: true, birthYear: 1988, deathYear: null },
  { id: "demo-4", name: "Femi Okafor", lat: 43.6532, lng: -79.3832, isLiving: true, birthYear: 2015, deathYear: null },
  { id: "demo-5", name: "Adaeze Nwosu", lat: 6.5244, lng: 3.3792, isLiving: false, birthYear: 1932, deathYear: 2001 },
];

const DEMO_RELATIONSHIPS = [
  { type: "PARENT_OF", source: "demo-2", target: "demo-1" },
  { type: "PARENT_OF", source: "demo-2", target: "demo-3" },
  { type: "MARRIED_TO", source: "demo-2", target: "demo-5" },
  { type: "PARENT_OF", source: "demo-1", target: "demo-4" },
];

router.get("/pins", (_req, res) => {
  res.json({ pins: DEMO_PINS });
});

router.get("/tree/:rootId", (req, res) => {
  res.json({ nodes: DEMO_PINS, relationships: DEMO_RELATIONSHIPS });
});

router.get("/person/:id", (req, res) => {
  const person = DEMO_PINS.find((p) => p.id === req.params.id);
  if (!person) return res.status(404).json({ error: "Demo person not found" });

  const relationships = DEMO_RELATIONSHIPS
    .filter((r) => r.source === person.id || r.target === person.id)
    .map((r) => {
      const otherId = r.source === person.id ? r.target : r.source;
      const other = DEMO_PINS.find((p) => p.id === otherId);
      return { type: r.type, otherId, otherName: other?.name };
    });

  res.json({
    person: {
      ...person,
      bio: person.id === "demo-2"
        ? "Beloved father and grandfather. Remembered for his stories and his garden."
        : "",
      photoUrl: null,
    },
    relationships,
    attestations: [],
  });
});

export default router;
