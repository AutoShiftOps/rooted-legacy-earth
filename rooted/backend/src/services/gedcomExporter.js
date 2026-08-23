// Moved into backend/src/services/ — see matchScoring.js comment for why.
// Serializes a Rooted family tree back into GEDCOM 5.5.1 text format.

function formatGedcomDate(year) {
  return year ? `1 JAN ${year}` : "";
}

function personToIndiRecord(person, index) {
  const xref = `@I${index + 1}@`;
  const lines = [`0 ${xref} INDI`];
  if (person.name) lines.push(`1 NAME ${person.name}`);
  if (person.birthYear) {
    lines.push("1 BIRT");
    lines.push(`2 DATE ${formatGedcomDate(person.birthYear)}`);
  }
  if (person.deathYear) {
    lines.push("1 DEAT");
    lines.push(`2 DATE ${formatGedcomDate(person.deathYear)}`);
  }
  if (person.bio) lines.push(`1 NOTE ${person.bio.replace(/\n/g, " ")}`);
  return { xref, lines };
}

function buildFamRecords(nodes, relationships, personXrefById) {
  const famRecords = [];
  const marriedPairs = relationships.filter((r) => r.type === "MARRIED_TO");
  let famIndex = 1;

  for (const pair of marriedPairs) {
    const husbandXref = personXrefById[pair.source];
    const wifeXref = personXrefById[pair.target];
    if (!husbandXref || !wifeXref) continue;

    const childrenOfCouple = relationships
      .filter((r) => r.type === "PARENT_OF" && (r.source === pair.source || r.source === pair.target))
      .map((r) => personXrefById[r.target])
      .filter(Boolean);

    const famXref = `@F${famIndex++}@`;
    const lines = [
      `0 ${famXref} FAM`,
      `1 HUSB ${husbandXref}`,
      `1 WIFE ${wifeXref}`,
      ...childrenOfCouple.map((childXref) => `1 CHIL ${childXref}`)
    ];
    famRecords.push({ famXref, lines });
  }

  return famRecords;
}

export function exportTreeToGedcom(nodes, relationships) {
  const header = [
    "0 HEAD",
    "1 SOUR Rooted",
    "1 GEDC",
    "2 VERS 5.5.1",
    "2 FORM LINEAGE-LINKED",
    "1 CHAR UTF-8"
  ];

  const personXrefById = {};
  const indiLines = [];
  nodes.forEach((person, index) => {
    const { xref, lines } = personToIndiRecord(person, index);
    personXrefById[person.id] = xref;
    indiLines.push(...lines);
  });

  const famRecords = buildFamRecords(nodes, relationships, personXrefById);
  const famLines = famRecords.flatMap((f) => f.lines);

  const trailer = ["0 TRLR"];

  return [...header, ...indiLines, ...famLines, ...trailer].join("\n");
}
