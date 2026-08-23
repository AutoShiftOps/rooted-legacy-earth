import { useState } from "react";
import { api } from "../api/client.js";

export default function PossibleConnectionCard({ match, onResolved }) {
  const [busy, setBusy] = useState(false);

  const confidencePercent = Math.round((match.confidence || 0) * 100);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      const res = await api.confirmMatch(match.matchId);
      onResolved && onResolved(match.matchId, res.data.status);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await api.rejectMatch(match.matchId);
      onResolved && onResolved(match.matchId, "rejected");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className="match-confidence">{confidencePercent}% possible match</span>
      </div>
      <p className="match-description">
        Someone else's family tree has a person who may be connected to{" "}
        <strong>{match.myPerson.name}</strong>:
      </p>
      <div className="match-candidate">
        <strong>{match.candidatePerson.name}</strong>
        {(match.candidatePerson.birthYear || match.candidatePerson.deathYear) && (
          <span className="match-years">
            {" "}({match.candidatePerson.birthYear ?? "?"}–{match.candidatePerson.deathYear ?? "?"})
          </span>
        )}
      </div>
      <p className="match-note">
        No contact information is shared unless you both confirm this connection.
      </p>
      <div className="match-actions">
        <button disabled={busy} onClick={handleConfirm}>Yes, this could be family</button>
        <button disabled={busy} className="secondary" onClick={handleReject}>Not a match</button>
      </div>
      {match.status === "confirmed_by_a" || match.status === "confirmed_by_b" ? (
        <p className="match-pending">Waiting on the other side to confirm...</p>
      ) : null}
      {match.status === "mutually_confirmed" && (
        <p className="match-success">Both sides confirmed! Check your notifications to connect.</p>
      )}
    </div>
  );
}
