# AR Page Type — Implementation Notes

## Overview

The `ar` page type uses **MindAR.js** (Three.js mode) for image-target tracking. When a player unlocks an AR page, they see a briefing, open the camera, point it at a physical printed image, and a 3D entity appears anchored to it. On confirmation they claim the page rewards.

Integrated as a standard page type — admins configure everything from the admin panel.

## Dependencies

- `mind-ar` — image tracking engine (uses TensorFlow.js internally)
- `three` — 3D rendering
- `@types/three` — type declarations

## Admin config (game_config fields)

| Field | Purpose | Default |
|---|---|---|
| Briefing Text | Flavour text shown before camera opens | "Point your camera at the target..." |
| Target File URL | Path to compiled `.mind` file | `/targets/default.mind` |
| Hold Duration | Seconds player must hold target in view | 0 (instant) |

Grants/flags use the standard page fields, claimed via `/api/pages/:id/claim` on confirmation.

## Creating a .mind target file

Any printed image can be an AR target. To compile:

1. Go to https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload your target image (high contrast, detailed images work best)
3. Download the `.mind` file
4. Place it in `public/targets/` and reference the path in the admin

**Good target images:** high contrast, lots of unique detail, non-repetitive patterns.
**Bad target images:** plain text, simple geometric shapes, low contrast, symmetric patterns.

## Files

```
src/components/ar/
  ARScreen.tsx        — Main AR page component (briefing → camera → claim)
  useARScene.ts       — Hook: MindAR lifecycle, Three.js scene, cleanup
src/types/
  ar-types.d.ts       — Type declarations for MindAR module
```

## How it works

1. `useARScene` dynamically imports MindAR's Three.js module
2. Creates a `MindARThree` instance attached to a container div (no body-level DOM injection)
3. Adds a Three.js anchor for target index 0
4. Builds nested wireframe polyhedra (the "sigil") as standard Three.js meshes on the anchor group
5. On target found/lost, fires callbacks to manage hold timer + UI state
6. On deactivate/unmount: stops MindAR, disposes renderer, cleans up any leaked UI overlays

## Camera sharing with QR scanner

MindAR renders into its container div and manages its own camera stream. The AR screen is a fullscreen takeover (`position: fixed; inset: 0; z-index: 1000`), so the QR scanner is visually behind it. The `deactivate()` call stops the camera stream and cleans up. No special mutual-exclusion logic is needed.

## Replacing the 3D entity

Edit `buildSigilEntity()` in `useARScene.ts`. It receives the anchor's `THREE.Group` — add any Three.js objects. For a GLTF model:

```ts
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load("/models/entity.glb", (gltf) => {
  gltf.scene.scale.set(0.5, 0.5, 0.5);
  group.add(gltf.scene);
});
```

## Notes

- **HTTPS required** for camera API
- **iOS Safari**: works on iOS 16.4+, needs HTTPS
- **Target image size**: print at 10cm+ for reliable tracking
- **Low light**: larger targets and a small lamp help
- **Performance**: keep GLTF models under 2MB, use flat shading on low-end devices
