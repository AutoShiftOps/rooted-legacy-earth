import { Routes, Route } from "react-router-dom";
import LandingGlobe from "./pages/LandingGlobe.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PersonProfile from "./pages/PersonProfile.jsx";
import ConsentSettings from "./pages/ConsentSettings.jsx";
import Matches from "./pages/Matches.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingGlobe />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/person/:id" element={<PersonProfile />} />
      <Route path="/settings/consent" element={<ConsentSettings />} />
      <Route path="/matches" element={<Matches />} />
    </Routes>
  );
}
