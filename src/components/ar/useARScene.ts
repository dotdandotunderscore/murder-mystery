import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type ARLoadState = "loading" | "ready" | "error";

export interface UseARSceneOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mindFileUrl: string;
  entityOffset?: string;  // "x, y, z" — default "0, 0, 0.5"
  entityScale?: number;   // default 0.8
  onTargetFound?: () => void;
  onTargetLost?: () => void;
}

export function useARScene({
  containerRef,
  mindFileUrl,
  entityOffset = "0, 0, 0.5",
  entityScale = 0.8,
  onTargetFound,
  onTargetLost,
}: UseARSceneOptions) {
  const [loadState, setLoadState] = useState<ARLoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const mindarRef = useRef<any>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    stoppedRef.current = false;
    const container = containerRef.current;

    const start = async () => {
      try {
        console.log("[AR] importing MindAR...");
        const { MindARThree } = await import(
          // @ts-ignore
          "mind-ar/dist/mindar-image-three.prod.js"
        );
        console.log("[AR] MindAR imported OK");

        if (stoppedRef.current) { console.log("[AR] stopped after import"); return; }

        const check = await fetch(mindFileUrl, { method: "HEAD" });
        if (!check.ok) {
          throw new Error(`Target file not found: ${mindFileUrl} (${check.status})`);
        }
        console.log("[AR] target file exists:", mindFileUrl);

        if (stoppedRef.current) { console.log("[AR] stopped after fetch"); return; }

        const rect = container.getBoundingClientRect();
        console.log("[AR] container size:", rect.width, "x", rect.height);

        const mindarThree = new MindARThree({
          container,
          imageTargetSrc: mindFileUrl,
          uiLoading: "no",
          uiScanning: "no",
          uiError: "no",
        });
        mindarRef.current = mindarThree;

        const { renderer, scene, camera } = mindarThree;
        const anchor = mindarThree.addAnchor(0);

        const sigil = buildSigilEntity(entityOffset, entityScale);
        anchor.group.add(sigil.group);

        anchor.onTargetFound = () => {
          console.log("[AR] TARGET FOUND — anchor visible:", anchor.group.visible, "pos:", anchor.group.position.toArray(), "children:", anchor.group.children.length);
          console.log("[AR] sigil pos:", sigil.group.position.toArray(), "scale:", sigil.group.scale.toArray());
          setTargetVisible(true);
          onTargetFound?.();
        };
        anchor.onTargetLost = () => {
          console.log("[AR] target lost");
          setTargetVisible(false);
          onTargetLost?.();
        };

        console.log("[AR] calling mindarThree.start()...");
        await mindarThree.start();
        console.log("[AR] start() resolved OK, stopped:", stoppedRef.current);

        if (stoppedRef.current) {
          cleanup(mindarThree, container);
          return;
        }

        // Debug: log all children and their styles
        for (let i = 0; i < container.children.length; i++) {
          const child = container.children[i] as HTMLElement;
          console.log(`[AR] container child[${i}]:`, child.tagName, "style:", child.style.cssText, "className:", child.className);
        }

        // Fix z-index stacking — MindAR sets video to z-index:-2
        const video = container.querySelector("video");
        if (video) video.style.zIndex = "0";
        const canvas = container.querySelector("canvas");
        if (canvas) {
          canvas.style.zIndex = "2";
          canvas.style.pointerEvents = "none";
          // Ensure canvas background is transparent
          console.log("[AR] canvas transparent:", renderer.getClearAlpha(), "size:", renderer.getSize(new THREE.Vector2()).toArray());
        }
        // CSS3D renderer div — should not block the WebGL canvas
        const cssDiv = container.children[2] as HTMLElement | undefined;
        if (cssDiv && cssDiv !== canvas) {
          cssDiv.style.zIndex = "1";
          cssDiv.style.pointerEvents = "none";
        }

        // Force transparent clear so 3D objects composite over video
        renderer.setClearColor(0x000000, 0);

        let frameCount = 0;
        renderer.setAnimationLoop(() => {
          sigil.update();
          renderer.render(scene, camera);
          frameCount++;
          if (frameCount === 60) {
            console.log("[AR] render loop running (60 frames). Scene children:", scene.children.length);
          }
        });

        console.log("[AR] animation loop started");
        setLoadState("ready");
      } catch (err) {
        if (stoppedRef.current) return;
        console.error("[AR] start failed:", err);
        const message =
          err instanceof Error ? err.message : "Unknown error starting AR";
        setError(
          message.includes("Permission")
            ? "Camera permission denied. Please allow camera access and try again."
            : message.includes("not found") || message.includes("404")
              ? `AR target file not found: ${mindFileUrl}`
              : `Could not start AR: ${message}`
        );
        setLoadState("error");
      }
    };

    start();

    return () => {
      console.log("[AR] cleanup running");
      stoppedRef.current = true;
      if (mindarRef.current) {
        cleanup(mindarRef.current, container);
        mindarRef.current = null;
      }
    };
  }, [mindFileUrl]);

  return { loadState, error, targetVisible };
}

function cleanup(mindarThree: any, container: HTMLElement) {
  try { mindarThree.renderer.setAnimationLoop(null); } catch (_) {}
  try { mindarThree.stop(); } catch (_) {}
  try { mindarThree.renderer.dispose(); } catch (_) {}
  document.querySelectorAll(".mindar-ui-overlay").forEach((el) => el.remove());
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Nested wireframe dice polyhedra (d20 → d12 → d8 → d6 → d4) in
 * eldritch green, each with a "glow" shell for bloom effect.
 *
 * MindAR coords: target image spans ~-0.5 to 0.5 on X/Y at z=0.
 */
function buildSigilEntity(offsetStr: string, scale: number) {
  const group = new THREE.Group();
  const parts = offsetStr.split(",").map((s) => parseFloat(s.trim()) || 0);
  group.position.set(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0.5);
  group.scale.setScalar(scale);

  // Lovecraftian green palette: pale outer → sickly bright core
  const layers = [
    // d20 — outermost, slow rotation
    { geo: new THREE.IcosahedronGeometry(0.38, 0), color: 0x1a4a3a, glow: 0x2d8a6a, opacity: 0.4, axis: [0, 1, 0], speed: 0.35 },
    // d12
    { geo: new THREE.DodecahedronGeometry(0.30), color: 0x2d7a5a, glow: 0x40c090, opacity: 0.55, axis: [0, 1, 0], speed: 0.55, rot: [Math.PI / 4, 0, Math.PI / 9] as const },
    // d8
    { geo: new THREE.OctahedronGeometry(0.22), color: 0x40aa70, glow: 0x60e0a0, opacity: 0.7, axis: [1, -1, 0], speed: 0.75 },
    // d6
    { geo: new THREE.BoxGeometry(0.28, 0.28, 0.28), color: 0x50cc80, glow: 0x80ffbb, opacity: 0.85, axis: [1, 1, 0], speed: 1.1, rot: [Math.PI / 6, 0, Math.PI / 6] as const },
    // d4 — innermost, fast spin, brightest
    { geo: new THREE.TetrahedronGeometry(0.14), color: 0x80ffbb, glow: 0xccffee, opacity: 1, axis: [-1, 1, -1], speed: 1.8 },
  ];

  const meshes: { mesh: THREE.Group; axis: THREE.Vector3; speed: number }[] = [];

  for (const l of layers) {
    const dieGroup = new THREE.Group();

    // Core wireframe — bright, full opacity
    const coreMat = new THREE.MeshBasicMaterial({
      color: l.color,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: l.opacity < 1,
      opacity: l.opacity,
    });
    dieGroup.add(new THREE.Mesh(l.geo, coreMat));

    // Glow shell — slightly larger, very transparent, same wireframe
    const glowGeo = l.geo.clone();
    glowGeo.scale(1.08, 1.08, 1.08);
    const glowMat = new THREE.MeshBasicMaterial({
      color: l.glow,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: l.opacity * 0.3,
    });
    dieGroup.add(new THREE.Mesh(glowGeo, glowMat));

    // Even larger faint shell for outer bloom
    const bloomGeo = l.geo.clone();
    bloomGeo.scale(1.2, 1.2, 1.2);
    const bloomMat = new THREE.MeshBasicMaterial({
      color: l.glow,
      wireframe: true,
      wireframeLinewidth: 1,
      transparent: true,
      opacity: l.opacity * 0.12,
    });
    dieGroup.add(new THREE.Mesh(bloomGeo, bloomMat));

    if (l.rot) dieGroup.rotation.set(l.rot[0], l.rot[1], l.rot[2]);
    group.add(dieGroup);
    meshes.push({ mesh: dieGroup, axis: new THREE.Vector3(...l.axis).normalize(), speed: l.speed });
  }

  const clock = new THREE.Clock();
  const baseZ = group.position.z;

  return {
    group,
    update() {
      const delta = clock.getDelta();
      // Breathing float along Z (towards/away from camera)
      group.position.z = baseZ + Math.sin(clock.elapsedTime * 2.1) * 0.04;
      for (const { mesh, axis, speed } of meshes) {
        mesh.rotateOnAxis(axis, speed * delta);
      }
    },
  };
}
