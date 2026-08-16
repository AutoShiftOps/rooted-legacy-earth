import { useState } from "react";
import { api } from "../api/client.js";

const RELATIONSHIP_OPTIONS = [
  { value: "direct_descendant", label: "I am a direct descendant (child/grandchild)" },
  { value: "next_of_kin", label: "I am the next of kin" },
  { value: "parent_guardian", label: "I am the parent/legal guardian" },
  { value: "sibling", label: "I am a sibling" },
  { value: "other_verified_relative", label: "I am another verified relative" },
];

export default function AddPersonForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "", birthYear: "", deathYear: "", bio: "",
    dataSubjectType: "deceased", isLiving: false,
  });
  const [attestation, setAttestation] = useState({ confirmed: false, relationship: "", statement: "" });
  const [error, setError] = useState("");

  const requiresAttestation = form.dataSubjectType === "deceased" || form.dataSubjectType === "minor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (requiresAttestation && (!attestation.confirmed || !attestation.relationship)) {
      setError("Please confirm your relationship to this person before saving.");
      return;
    }
    try {
      const payload = { ...form };
      if (requiresAttestation) payload.attestation = attestation;
      const res = await api.createPerson(payload);
      onCreated && onCreated(res.data.id);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save this person.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-person-form">
      <input placeholder="Full name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} required />

      <select value={form.dataSubjectType}
        onChange={(e) => setForm({ ...form, dataSubjectType: e.target.value })}>
        <option value="deceased">Deceased relative</option>
        <option value="minor">Minor (living, under legal age)</option>
        <option value="relative">Living relative (adult)</option>
      </select>

      <input placeholder="Birth year" value={form.birthYear}
        onChange={(e) => setForm({ ...form, birthYear: e.target.value })} />
      {form.dataSubjectType === "deceased" && (
        <input placeholder="Death year" value={form.deathYear}
          onChange={(e) => setForm({ ...form, deathYear: e.target.value })} />
      )}
      <textarea placeholder="A short memory or bio (optional)" value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })} />

      {requiresAttestation && (
        <div className="attestation-block">
          <p className="attestation-title">
            Since this person can't consent for themselves, please confirm your authority to add this record.
          </p>
          <select value={attestation.relationship}
            onChange={(e) => setAttestation({ ...attestation, relationship: e.target.value })} required>
            <option value="">Select your relationship...</option>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <label className="attestation-checkbox">
            <input type="checkbox" checked={attestation.confirmed}
              onChange={(e) => setAttestation({ ...attestation, confirmed: e.target.checked })} />
            I confirm I am authorized to add this record on behalf of this person.
            This creates an auditable record and can be disputed by other verified relatives.
          </label>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <button type="submit">Save to family tree</button>
    </form>
  );
}
