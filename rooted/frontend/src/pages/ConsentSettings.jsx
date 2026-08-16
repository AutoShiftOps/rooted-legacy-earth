import { useState } from "react";
import { api } from "../api/client.js";

const SCOPES = [
  { key: "store_data", label: "Store my profile & relationship data", warn: "Turning this off will anonymize your data." },
  { key: "public_globe_display", label: "Show my pin publicly on the landing globe" },
  { key: "match_engine_participation", label: "Include me in reconnection matching against other users' trees" },
  { key: "contact_reveal_on_match", label: "Allow sharing my contact info if a match is confirmed" },
];

export default function ConsentSettings() {
  const personId = localStorage.getItem("rooted_person_id");
  const [status, setStatus] = useState({});

  const toggle = async (scope, granted) => {
    try {
      await api.setConsent(personId, { scope, granted });
      setStatus((s) => ({ ...s, [scope]: granted }));
    } catch (err) {
      console.error("Consent update failed", err);
    }
  };

  return (
    <div className="consent-page">
      <h2>Your consent & privacy settings</h2>
      <p>
        Each setting below is independent. You can change your mind at any
        time — turning a setting off takes effect immediately.
      </p>
      {SCOPES.map((s) => (
        <div key={s.key} className="consent-row">
          <label>
            <input
              type="checkbox"
              checked={!!status[s.key]}
              onChange={(e) => toggle(s.key, e.target.checked)}
            />
            {s.label}
          </label>
          {s.warn && <p className="consent-warn">{s.warn}</p>}
        </div>
      ))}
    </div>
  );
}
