import { useEffect, useState } from "react";
import CinematicGlobe from "../components/CinematicGlobe.jsx";
import FamilyTreePanel from "../components/FamilyTreePanel.jsx";
import TimelineScrubber from "../../phase2-cinematic/TimelineScrubber.jsx";
import { api } from "../api/client.js";

export default function Dashboard() {
  const [pins, setPins] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [showTree, setShowTree] = useState(false);
  const [yearFilter, setYearFilter] = useState(null);
  const rootPersonId = localStorage.getItem("rooted_person_id");

  useEffect(() => {
    api.getPublicPins().then((res) => setPins(res.data.pins)).catch(() => setPins([]));
  }, []);

  const openTree = async () => {
    if (!rootPersonId) return;
    try {
      const res = await api.getTree(rootPersonId);
      setTreeData(res.data);
      setShowTree(true);
    } catch (err) {
      console.error("Failed to load tree", err);
    }
  };

  const years = pins.flatMap((p) => [p.birthYear, p.deathYear]).filter(Boolean);
  const minYear = years.length ? Math.min(...years) : 1900;
  const maxYear = new Date().getFullYear();

  return (
    <div className="dashboard-container">
      <CinematicGlobe
        pins={pins}
        autoRotate={false}
        onPinClick={() => openTree()}
        yearFilter={yearFilter}
      />
      <div className="dashboard-toolbar">
        <button onClick={openTree}>View my family tree</button>
        <a href="/settings/consent">Consent settings</a>
      </div>
      <TimelineScrubber
        minYear={minYear}
        maxYear={maxYear}
        onRangeChange={(year) => setYearFilter(year)}
      />
      {showTree && treeData && (
        <FamilyTreePanel
          nodes={treeData.nodes || []}
          relationships={treeData.relationships || []}
          onClose={() => setShowTree(false)}
        />
      )}
    </div>
  );
}
