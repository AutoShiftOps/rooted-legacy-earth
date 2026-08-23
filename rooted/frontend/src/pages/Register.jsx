import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.register(form);
      localStorage.setItem("rooted_token", res.data.token);
      localStorage.setItem("rooted_person_id", res.data.personId);
      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || `Server error (${err.response.status})`);
      } else if (err.request) {
        setError("Could not reach the server. Check your connection or try again shortly.");
      } else {
        setError(err.message || "Registration failed");
      }
    }
  };

  return (
    <div className="auth-page">
      <h2>Create your Rooted account</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        <p className="consent-note">
          By continuing you agree to store your profile data. Public display on
          the globe and reconnection matching are separate, off-by-default
          settings you control after signup.
        </p>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}
