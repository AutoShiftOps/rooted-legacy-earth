import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CinematicGlobe from "../components/CinematicGlobe.jsx";
import FamilyTreePanel from "../components/FamilyTreePanel.jsx";
import TimelineScrubber from "../components/TimelineScrubber.jsx";
import client from "../api/client.js";

export default function GuestDashboard() {
  const [pins, setPins] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [showTree, setShowTree] = useState(false);
  const [yearFilter, setYearFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/api/demo/pins").then((res) => setPins(res.data.pins)).catch(() => setPins([]));
  }, []);

  const openTree = async () => {
    try {
      const res = await client.get("/api/demo/tree/demo-1");
      setTreeData(res.data);
      setShowTree(true);
    } catch (err) {
      console.error("Failed to load demo tree", err);
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
        <span className="demo-badge">Demo mode — sample family</span>
        <button onClick={openTree}>View sample family tree</button>
        <button onClick={() => navigate("/register")}>Create your own tree</button>
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
