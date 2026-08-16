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

  const { person: p, relationships } = person;

  return (
    <div className="profile-page">
      <div className="profile-card">
        {p.photoUrl && <img src={p.photoUrl} alt={p.name} className="profile-photo" />}
        <h2>{p.name}</h2>
        {!p.isLiving && <p className="memorial-dates">{p.birthYear ?? "?"} – {p.deathYear ?? "?"}</p>}
        {p.bio && <p className="profile-bio">{p.bio}</p>}
        <h3>Connections</h3>
        <ul>
          {relationships.map((r, i) => (
            <li key={i}>{r.type.replace("_", " ").toLowerCase()}: {r.otherName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
