export function parseGedcomLines(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const records = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(@\w+@)?\s*(\w+)\s*(.*)$/);
    if (!match) continue;
    const [, level, xref, tag, value] = match;
    if (level === "0" && (tag === "INDI" || tag === "FAM")) {
      current = { type: tag, xref, tags: {} };
      records.push(current);
    } else if (current) {
      current.tags[tag] = value;
    }
  }
  return records;
}

export function gedcomToRootedMutations(records) {
  const persons = records
    .filter((r) => r.type === "INDI")
    .map((r) => ({
      gedcomId: r.xref,
      name: r.tags.NAME?.replace(/\//g, "") || "Unknown",
      dataSubjectType: "deceased",
    }));
  const families = records.filter((r) => r.type === "FAM");
  return { persons, families };
}
