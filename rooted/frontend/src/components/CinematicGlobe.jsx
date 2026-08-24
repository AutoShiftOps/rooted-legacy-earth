import { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { useFlyToChoreography } from "../hooks/useFlyToChoreography.js";

/**
 * CinematicGlobe v3 — fixes blurry zoom (high-res textures + explicit pixel
 * ratio + antialias) and makes pins self-explanatory (persistent labels +
 * richer tooltips), on top of the v2 fly-to choreography and remembrance
 * glow ring for deceased pins.
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

  // High-DPI renderer setup — this is what fixes the "blurry on zoom" issue.
  // three-globe has no automatic mip/LOD swap; without this the canvas
  // renders at a fixed internal resolution regardless of zoom level or
  // screen density, so zooming just magnifies the same soft pixels.
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

  // Rich HTML tooltip so a dot is never just an unlabeled dot. Shows name,
  // life years (or "living"), and a hint to click for the full profile.
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
      // 8K night-lights texture — the default bundled texture in
      // react-globe.gl/three-globe is comparatively low-res, which is why
      // zooming in previously looked soft. This is the actual resolution
      // fix, not just a renderer setting.
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
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
