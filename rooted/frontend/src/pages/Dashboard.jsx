import { useEffect, useState } from "react";
import CinematicGlobe from "../components/CinematicGlobe.jsx";
import FamilyTreePanel from "../components/FamilyTreePanel.jsx";
import { api } from "../api/client.js";

export default function Dashboard() {
  const [pins, setPins] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [showTree, setShowTree] = useState(false);
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

  return (
    <div className="dashboard-container">
      <CinematicGlobe pins={pins} autoRotate={false} onPinClick={() => openTree()} />
      <div className="dashboard-toolbar">
        <button onClick={openTree}>View my family tree</button>
        <a href="/settings/consent">Consent settings</a>
      </div>
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
