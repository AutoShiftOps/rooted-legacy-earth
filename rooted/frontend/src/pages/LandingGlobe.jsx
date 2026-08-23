import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CinematicGlobe from "../components/CinematicGlobe.jsx";
import { api } from "../api/client.js";

export default function LandingGlobe() {
  const [pins, setPins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPublicPins().then((res) => setPins(res.data.pins)).catch(() => setPins([]));
  }, []);

  return (
    <div className="landing-container">
      <CinematicGlobe pins={pins} autoRotate />
      <div className="landing-overlay">
        <h1 className="landing-logo">ROOTED</h1>
        <p className="landing-tagline">Connect your missed beloved ones.</p>
        <div className="landing-actions">
          <button onClick={() => navigate("/register")}>Start your tree</button>
          <button className="secondary" onClick={() => navigate("/login")}>Sign in</button>
        </div>
        <button className="try-demo-link" onClick={() => navigate("/demo")}>
          Try it without an account →
        </button>
      </div>
    </div>
  );
}
