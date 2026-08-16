import { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";

export default function CinematicGlobe({ pins = [], arcs = [], onPinClick, autoRotate = true }) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

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

  const pointColor = (d) => (d.isLiving ? "#e8f1ff" : "#ffb347");

  const flyToPin = (pin) => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: pin.lat, lng: pin.lng, altitude: 0.6 }, 1800);
    }
    onPinClick && onPinClick(pin);
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
      pointsData={pins}
      pointLat="lat"
      pointLng="lng"
      pointColor={pointColor}
      pointAltitude={0.01}
      pointRadius={0.35}
      pointLabel={(d) => `${d.name}${d.isLiving ? "" : ` (${d.birthYear ?? "?"}–${d.deathYear ?? "?"})`}`}
      onPointClick={flyToPin}
      arcsData={arcs}
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
