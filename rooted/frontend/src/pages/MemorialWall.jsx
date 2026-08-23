import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client.js";

export default function MemorialWall() {
  const { id } = useParams();
  const [memorial, setMemorial] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    client.get(`/api/memorial/${id}`)
      .then((res) => setMemorial(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="memorial-page">
        <p>This memorial isn't public, or doesn't exist.</p>
      </div>
    );
  }

  if (!memorial) return <div className="memorial-page">Loading...</div>;

  return (
    <div className="memorial-page">
      <div className="memorial-card">
        {memorial.photoUrl && <img src={memorial.photoUrl} alt={memorial.name} className="memorial-photo" />}
        <h1>{memorial.name}</h1>
        <p className="memorial-dates">{memorial.birthYear ?? "?"} – {memorial.deathYear ?? "?"}</p>
        {memorial.bio && <p className="memorial-bio">{memorial.bio}</p>}

        {memorial.relationships.length > 0 && (
          <>
            <h3>Remembered by</h3>
            <ul className="memorial-relations">
              {memorial.relationships.map((r, i) => (
                <li key={i}>{r.type.replace("_", " ").toLowerCase()}: {r.name}</li>
              ))}
            </ul>
          </>
        )}

        <p className="memorial-footer-note">
          This memorial page lives on Rooted — a family tree pinned to the
          places that mattered most.
        </p>
      </div>
    </div>
  );
}
