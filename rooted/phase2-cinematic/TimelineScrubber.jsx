import { useState } from "react";

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
