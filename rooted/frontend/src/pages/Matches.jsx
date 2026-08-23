import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import PossibleConnectionCard from "../components/PossibleConnectionCard.jsx";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const loadMatches = () => {
    setLoading(true);
    api.getMatches()
      .then((res) => setMatches(res.data.matches))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMatches(); }, []);

  const handleScanNow = async () => {
    setScanning(true);
    try {
      await api.scanMatches();
      loadMatches();
    } finally {
      setScanning(false);
    }
  };

  const handleResolved = (matchId, newStatus) => {
    if (newStatus === "rejected") {
      setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
    } else {
      setMatches((prev) => prev.map((m) => (m.matchId === matchId ? { ...m, status: newStatus } : m)));
    }
  };

  return (
    <div className="matches-page">
      <h2>Possible connections</h2>
      <p>
        Rooted compares your opted-in family members against other users'
        trees to find people who might be the same person, lost across
        different branches of a family.
      </p>
      <button onClick={handleScanNow} disabled={scanning}>
        {scanning ? "Scanning..." : "Check for new connections"}
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p className="matches-empty">No possible connections found yet.</p>
      ) : (
        <div className="matches-list">
          {matches.map((m) => (
            <PossibleConnectionCard key={m.matchId} match={m} onResolved={handleResolved} />
          ))}
        </div>
      )}
    </div>
  );
}
