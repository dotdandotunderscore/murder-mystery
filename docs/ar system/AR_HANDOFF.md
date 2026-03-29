# AR Scene — Handoff Notes

## What this is

An AR puzzle page type for the escape room. When a player unlocks an AR page, they see a briefing and an "Open Camera" button. Pointing the camera at a physical printed marker renders a 3D entity floating above it. After holding steady (configurable duration), they can claim rewards.

This is integrated as a first-class page type (`ar`) — admins configure it from the admin panel like any other page.

---

## Admin-configurable fields (via game_config)

| Field | Purpose | Default |
|---|---|---|
| Briefing Text | Flavour text shown before camera opens | "Point your camera at the marker to reveal what's hidden." |
| Marker Type | `hiro` (built-in test marker) or `custom` (.patt file) | hiro |
| Marker Pattern URL | Path to `.patt` file (only when custom) | — |
| Hold Duration | Seconds player must hold marker in view before reveal | 0 (instant) |

Grants (flags, words) and removals are configured via the standard page fields and claimed on confirmation — same pattern as Coin Flip / Slot Machine.

---

## Files

```
src/components/ar/
  ARScreen.tsx        — Main AR page component
  useARScene.ts       — Hook: script loading, camera, marker events
src/types/
  ar-types.d.ts       — JSX type declarations for A-Frame elements
```

---

## Physical setup: the marker

### Hiro marker (default, easiest to test)
Built-in AR.js marker. Print at **10cm × 10cm minimum**, laminate for durability.

### Custom marker (production)
1. Design in black and white (high contrast, asymmetric, square)
2. Generate `.patt` file at: https://au.gmented.com/app/marker/marker.php
3. Host at e.g. `/public/markers/custom.patt`
4. Set Marker Type to "Custom" and enter the URL in admin

---

## Camera sharing with QR scanner

The QR scanner and AR scene both need the camera. **Don't run both simultaneously.** The AR screen is a fullscreen takeover, so the scanner should be unmounted naturally. The `useARScene` hook cleans up AR.js's injected `<video>` elements on deactivate/unmount.

---

## Replacing the 3D entity

The current entity is nested wireframe polyhedra. To use a GLTF model instead, edit `ARScreen.tsx` — replace the geometry entities inside `<a-marker>` with:

```tsx
<a-entity
  gltf-model="#ar-entity"
  position="0 0.3 0"
  scale="0.5 0.5 0.5"
  animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear"
/>
```

And add `<a-assets>` before the marker in the scene.

---

## Notes

- **HTTPS required** for camera API
- **iOS 16.4+** needed for reliable camera in PWAs
- **Low light**: larger markers (15–20cm) and a small lamp near the prop help
- **Low-end Android**: keep GLTF models under 2MB, use flat shading
