import { useEffect, useRef } from "react";
import f3 from "family-chart";

/**
 * FamilyTreePanel v2 — replaces the plain default family-chart cards with a
 * custom HTML template: circular portrait frame, generation-colored glow
 * ring, a small leaf/root icon for warmth, and a staggered fade-in on
 * mount. Layout math still comes from family-chart (don't reinvent tree
 * positioning), only the card's visual template is custom.
 */
export default function FamilyTreePanel({ nodes = [], relationships = [], onClose }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const f3Data = nodes.map((n) => ({
      id: n.id,
      data: {
        "first name": n.name,
        birthday: n.birthYear || "",
        avatar: n.photoUrl || "",
        isLiving: n.isLiving !== false,
        generation: n.generation ?? 0,
      },
      rels: {
        father: relationships.find(
          (r) => r.type === "PARENT_OF" && r.target === n.id && r.parentGender === "male"
        )?.source,
        mother: relationships.find(
          (r) => r.type === "PARENT_OF" && r.target === n.id && r.parentGender === "female"
        )?.source,
        spouses: relationships
          .filter((r) => r.type === "MARRIED_TO" && r.source === n.id)
          .map((r) => r.target),
        children: relationships
          .filter((r) => r.type === "PARENT_OF" && r.source === n.id)
          .map((r) => r.target),
      },
    }));

    const genColors = ["#5aa9ff", "#ffb347", "#8ee6a8", "#d9a7ff", "#ff8fa3"];
    const colorForGeneration = (gen) => genColors[Math.abs(gen) % genColors.length];

    const chart = f3
      .createChart(containerRef.current, f3Data)
      .setTransitionTime(700)
      .setCardXSpacing(230)
      .setCardYSpacing(170)
      .setOrientationVertical();

    // Custom card renderer: portrait circle + glow ring + name/year + icon.
    chart.setCard(f3.CardHtml).setCardDisplay([["first name"], ["birthday"]]);
    chart.setCardHtml?.((d) => {
      const person = d.data.data;
      const glow = person.isLiving ? "#5aa9ff" : "#ffb347";
      const ring = colorForGeneration(person.generation);
      const initials = (person["first name"] || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const icon = person.isLiving ? "🌿" : "🕊";

      return `
        <div class="rooted-card" style="
          display:flex; flex-direction:column; align-items:center;
          font-family: system-ui, sans-serif; color:#f4f6fb;
          animation: rootedFadeIn 480ms ease forwards;
          opacity:0; transform: translateY(10px);
        ">
          <div style="
            width:64px; height:64px; border-radius:50%;
            background: ${person.avatar ? `url(${person.avatar}) center/cover` : "linear-gradient(135deg,#1c2333,#2a3350)"};
            border: 2px solid ${ring};
            box-shadow: 0 0 14px ${glow}66, 0 0 2px ${glow};
            display:flex; align-items:center; justify-content:center;
            font-weight:600; font-size:18px; position:relative;
          ">
            ${person.avatar ? "" : initials}
            <span style="
              position:absolute; bottom:-4px; right:-4px;
              font-size:14px; background:#0a0e1a; border-radius:50%;
              width:20px; height:20px; display:flex; align-items:center;
              justify-content:center; border:1px solid ${ring};
            ">${icon}</span>
          </div>
          <div style="margin-top:8px; font-weight:600; font-size:13px; text-align:center;">
            ${person["first name"] || "Unknown"}
          </div>
          <div style="opacity:0.6; font-size:11px;">
            ${person.birthday || ""}
          </div>
        </div>
      `;
    });

    chart.updateTree({ initial: true });

    // Staggered entrance: cascade each card's fade-in by depth order.
    const cards = containerRef.current.querySelectorAll(".rooted-card");
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 90}ms`;
    });

    return () => {
      containerRef.current.innerHTML = "";
    };
  }, [nodes, relationships]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 20%, rgba(30,42,74,0.9), rgba(4,6,12,0.98))",
        zIndex: 50,
        overflow: "auto",
      }}
    >
      <style>{`
        @keyframes rootedFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
        .rooted-card:hover {
          filter: brightness(1.15);
          transition: filter 150ms ease;
        }
      `}</style>
      <button
        onClick={onClose}
        aria-label="Close family tree"
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#f4f6fb",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 18,
          cursor: "pointer",
          zIndex: 60,
        }}
      >
        ×
      </button>
      {nodes.length === 0 ? (
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            color: "#9aa4bf",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          No family members yet.
        </div>
      ) : (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}
