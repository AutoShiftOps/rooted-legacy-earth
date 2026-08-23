import { useState } from "react";

// Moved into frontend/src/components/ (was previously in the top-level
// phase2-cinematic/ folder, which broke Vercel builds — see fix notes in
// CinematicGlobe.jsx). Filters globe pins/arcs by a decade range.
export default function TimelineScrubber({ minYear = 1900, maxYear = 2026, onRangeChange }) {
  const [year, setYear] = useState(maxYear);

  const handleChange = (e) => {
    const y = parseInt(e.target.value, 10);
    setYear(y);
    onRangeChange && onRangeChange(y);
  };

  return (
    <div className="timeline-scrubber">
      <input type="range" min={minYear} max={maxYear} value={year} onChange={handleChange} />
      <span>{year}</span>
    </div>
  );
}
