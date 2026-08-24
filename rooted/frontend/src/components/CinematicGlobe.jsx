import { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { useFlyToChoreography } from "../hooks/useFlyToChoreography.js";

/**
 * CinematicGlobe v3.1 — textures are now bundled locally under
 * public/textures/ instead of fetched from unpkg.com at runtime. This
 * removes the external network dependency and guarantees the globe looks
 * correct on first paint regardless of the user's connection to a third
 * party CDN. Place these three files in rooted/frontend/public/textures/:
 *   earth-night.jpg, earth-topology.png, night-sky.png
 * (sourced from three-globe's example/img directory).
 */
export default function CinematicGlobe({
  pins = [],
  arcs = [],
  onPinClick,
  autoRotate = true,
  yearFilter = null,
}) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { flyToPerson } = useFlyToChoreography(globeRef);

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current && autoRotate) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.4;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.4 }, 0);
    }
  }, [autoRotate]);

  useEffect(() => {
    if (!globeRef.current) return;
    const renderer = globeRef.current.renderer();
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
      renderer.antialias = true;
    }
  }, []);

  const visiblePins = yearFilter
    ? pins.filter((p) => {
        const born = p.birthYear || -Infinity;
        const died = p.deathYear || Infinity;
        return born <= yearFilter && yearFilter <= died;
      })
    : pins;

  const visibleArcs = yearFilter
    ? arcs.filter((a) => (a.year ? a.year <= yearFilter : true))
    : arcs;

  const pointColor = (d) => (d.isLiving ? "#e8f1ff" : "#ffb347");
  const pointAltitude = (d) => (d.isLiving ? 0.01 : 0.015);
  const pointRadius = (d) => (d.isLiving ? 0.35 : 0.42);

  const pointLabel = (d) => `
    <div style="
      background: rgba(10,14,26,0.92);
      border: 1px solid ${d.isLiving ? "#5aa9ff" : "#ffb347"};
      border-radius: 8px;
      padding: 8px 12px;
      color: #f4f6fb;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      max-width: 200px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.45);
    ">
      <div style="font-weight: 600; margin-bottom: 2px;">${d.name}</div>
      <div style="opacity:0.75; font-size: 11px;">
        ${
          d.isLiving
            ? "Living"
            : `${d.birthYear ?? "?"} – ${d.deathYear ?? "?"}`
        }
      </div>
      <div style="opacity:0.55; font-size: 10px; margin-top: 4px;">Click to view profile</div>
    </div>
  `;

  const handlePinClick = (pin) => {
    flyToPerson(pin, { onArrive: () => onPinClick && onPinClick(pin) });
  };

  return (
    <Globe
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl="/textures/earth-night.jpg"
      bumpImageUrl="/textures/earth-topology.png"
      backgroundImageUrl="/textures/night-sky.png"
      atmosphereColor="#5aa9ff"
      atmosphereAltitude={0.18}
      rendererConfig={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      pointsData={visiblePins}
      pointLat="lat"
      pointLng="lng"
      pointColor={pointColor}
      pointAltitude={pointAltitude}
      pointRadius={pointRadius}
      pointLabel={pointLabel}
      pointsMerge={false}
      onPointClick={handlePinClick}
      arcsData={visibleArcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor={() => ["#5aa9ff", "#ffb347"]}
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={4000}
      arcStroke={0.5}
    />
  );
}
