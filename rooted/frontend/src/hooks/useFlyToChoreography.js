// Moved into frontend/src/hooks/ (was previously in the top-level
// phase2-cinematic/ folder, which broke Vercel builds — see fix notes in
// CinematicGlobe.jsx). Hook: sequences multi-stage camera transitions for
// a cinematic "reveal" when a user clicks a pin.
export function useFlyToChoreography(globeRef) {
  const flyToPerson = (person, { onArrive } = {}) => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: person.lat, lng: person.lng, altitude: 2.2 }, 800);
    setTimeout(() => {
      globeRef.current.pointOfView({ lat: person.lat, lng: person.lng, altitude: 0.4 }, 1600);
    }, 900);
    setTimeout(() => onArrive && onArrive(person), 2600);
  };
  return { flyToPerson };
}
