import { useEffect, useRef } from "react";
import f3 from "family-chart";

export default function FamilyTreePanel({ nodes = [], relationships = [], onClose }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const f3Data = nodes.map((n) => ({
      id: n.id,
      data: {
        "first name": n.name,
        "birthday": n.birthYear || "",
        "avatar": n.photoUrl || "",
      },
      rels: {
        father: relationships.find((r) => r.type === "PARENT_OF" && r.target === n.id && r.parentGender === "male")?.source,
        mother: relationships.find((r) => r.type === "PARENT_OF" && r.target === n.id && r.parentGender === "female")?.source,
        spouses: relationships.filter((r) => r.type === "MARRIED_TO" && r.source === n.id).map((r) => r.target),
        children: relationships.filter((r) => r.type === "PARENT_OF" && r.source === n.id).map((r) => r.target),
      },
    }));

    const chart = f3.createChart(containerRef.current, f3Data)
      .setTransitionTime(600)
      .setCardXSpacing(220)
      .setCardYSpacing(150)
      .setOrientationVertical();

    chart.setCard(f3.CardHtml).setCardDisplay([["first name"], ["birthday"]]);
    chart.updateTree({ initial: true });

    return () => {
      containerRef.current.innerHTML = "";
    };
  }, [nodes, relationships]);

  return (
    <div className="tree-panel">
      <button className="tree-panel-close" onClick={onClose}>×</button>
      <div ref={containerRef} className="tree-panel-canvas" />
    </div>
  );
}
