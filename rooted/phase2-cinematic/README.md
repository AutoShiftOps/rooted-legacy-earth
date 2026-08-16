# Phase 2 — Cinematic Polish

Adds the "visual wonder" layer on top of the Phase 1 core loop.

## Planned Features
- **Fly-to camera choreography**: multi-stage `pointOfView` transitions when
  opening a person (zoom out from globe → arc flight → landing close-up).
- **Timeline scrubber**: a bottom-of-screen slider bound to decade ranges;
  dragging it filters `pointsData`/`arcsData` by birth/death year so the
  globe visually "plays through" a family's migration over time.
- **Ambient audio layer**: soft generative/ambient soundtrack using Web Audio
  API, toggled by user, volume tied to zoom level (quieter when zoomed out).
- **Day/night terminator shader**: swap `globeImageUrl` dynamically based on
  a simulated sun position for added realism.
- **Particle "remembrance" effect**: deceased pins emit a slow upward
  particle drift (custom Three.js `Points` system layered on the globe mesh).

## Suggested File Additions
```
phase2-cinematic/
├── TimelineScrubber.jsx     # decade slider component
├── useFlyToChoreography.js  # hook wrapping globeRef.pointOfView sequences
├── AmbientAudioLayer.jsx    # Web Audio ambient soundtrack controller
└── RemembranceParticles.js  # custom Three.js particle system for deceased pins
```

## Dependency Additions
```
npm install howler   # simpler ambient audio control than raw Web Audio API
```

This phase is UI/rendering-only — no backend or schema changes required.
