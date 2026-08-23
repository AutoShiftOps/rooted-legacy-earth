import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function PersonProfile() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);

  useEffect(() => {
    api.getPerson(id).then((res) => setPerson(res.data)).catch(() => setPerson(null));
  }, [id]);

  if (!person) return <div className="profile-page">Loading...</div>;

  const { person: p, relationships, attestations } = person;

  const handleExportGedcom = () => {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
    const token = localStorage.getItem("rooted_token");
    fetch(`${base}/api/tree/${id}/export/gedcom`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rooted-family-tree.ged";
        a.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        {p.photoUrl && <img src={p.photoUrl} alt={p.name} className="profile-photo" />}
        <h2>{p.name}</h2>
        {!p.isLiving && <p className="memorial-dates">{p.birthYear ?? "?"} – {p.deathYear ?? "?"}</p>}
        {p.bio && <p className="profile-bio">{p.bio}</p>}

        <h3>Connections</h3>
        <ul>
          {relationships && relationships.map((r, i) => (
            <li key={i}>{r.type.replace("_", " ").toLowerCase()}: {r.otherName}</li>
          ))}
        </ul>

        {attestations && attestations.length > 0 && (
          <p className="attestation-badge">
            Verified by a relative ({attestations[0].relationship?.replace("_", " ")})
          </p>
        )}

        <div className="profile-actions">
          <button onClick={handleExportGedcom}>Export tree as GEDCOM</button>
          {!p.isLiving && (
            <a href={`/memorial/${id}`} target="_blank" rel="noreferrer">
              View public memorial page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
