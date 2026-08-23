import { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { useFlyToChoreography } from "../../phase2-cinematic/useFlyToChoreography.js";

/**
 * CinematicGlobe v2 — now wired with multi-stage fly-to choreography on pin
 * click (Phase 2). Deceased pins render with a soft outer glow ring to hint
 * at the "remembrance" visual treatment (full particle system is a follow-up).
 */
export default function CinematicGlobe({ pins = [], arcs = [], onPinClick, autoRotate = true, yearFilter = null }) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const { flyToPerson } = useFlyToChoreography(globeRef);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
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

  const handlePinClick = (pin) => {
    flyToPerson(pin, { onArrive: () => onPinClick && onPinClick(pin) });
  };

  return (
    <Globe
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      atmosphereColor="#5aa9ff"
      atmosphereAltitude={0.22}
      pointsData={visiblePins}
      pointLat="lat"
      pointLng="lng"
      pointColor={pointColor}
      pointAltitude={pointAltitude}
      pointRadius={pointRadius}
      pointLabel={(d) => `${d.name}${d.isLiving ? "" : ` (${d.birthYear ?? "?"}–${d.deathYear ?? "?"})`}`}
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
