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
