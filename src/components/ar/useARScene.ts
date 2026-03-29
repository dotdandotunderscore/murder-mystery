import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type ARLoadState = "loading" | "ready" | "error";

export interface UseARSceneOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mindFileUrl: string;
  onTargetFound?: () => void;
  onTargetLost?: () => void;
}

export function useARScene({
  containerRef,
  mindFileUrl,
  onTargetFound,
  onTargetLost,
}: UseARSceneOptions) {
  const [loadState, setLoadState] = useState<ARLoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const mindarRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let stopped = false;
    const container = containerRef.current;

    const start = async () => {
      try {
        console.log("[AR] importing MindAR...");
        const { MindARThree } = await import(
          // @ts-ignore
          "mind-ar/dist/mindar-image-three.prod.js"
        );
        console.log("[AR] MindAR imported OK");

        if (stopped) return;

        // Pre-check: does the .mind file exist?
        const check = await fetch(mindFileUrl, { method: "HEAD" });
        if (!check.ok) {
          throw new Error(`Target file not found: ${mindFileUrl} (${check.status})`);
        }
        console.log("[AR] target file exists:", mindFileUrl);

        const rect = container.getBoundingClientRect();
        console.log("[AR] container size:", rect.width, "x", rect.height);
        if (rect.width === 0 || rect.height === 0) {
          throw new Error("AR container has zero dimensions — cannot start camera");
        }

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

        buildSigilEntity(anchor.group);

        anchor.onTargetFound = () => {
          setTargetVisible(true);
          onTargetFound?.();
        };
        anchor.onTargetLost = () => {
          setTargetVisible(false);
          onTargetLost?.();
        };

        console.log("[AR] calling mindarThree.start()...");
        await mindarThree.start();
        console.log("[AR] start() resolved OK");

        // MindAR sets video z-index to -2, which pushes it behind the
        // container's background. Fix the stacking so everything is visible.
        const video = container.querySelector("video");
        if (video) video.style.zIndex = "0";
        // Canvas (WebGL) should be on top of video
        const canvas = container.querySelector("canvas");
        if (canvas) canvas.style.zIndex = "1";
        // CSS3D renderer div (3rd child) on top of canvas
        const cssDiv = container.children[2] as HTMLElement | undefined;
        if (cssDiv) cssDiv.style.zIndex = "2";

        if (stopped) {
          cleanup(mindarThree, container);
          return;
        }

        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });

        setLoadState("ready");
      } catch (err) {
        if (stopped) return;
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
      stopped = true;
      if (mindarRef.current) {
        cleanup(mindarRef.current, container);
        mindarRef.current = null;
      }
    };
  }, [mindFileUrl]); // only re-run if the mind file changes

  return { loadState, error, targetVisible };
}

function cleanup(mindarThree: any, container: HTMLElement) {
  try {
    mindarThree.renderer.setAnimationLoop(null);
  } catch (_) {}
  try {
    mindarThree.stop();
  } catch (_) {}
  try {
    mindarThree.renderer.dispose();
  } catch (_) {}
  document.querySelectorAll(".mindar-ui-overlay").forEach((el) => el.remove());
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Nested wireframe polyhedra — each layer rotates on a different axis/speed.
 */
function buildSigilEntity(group: THREE.Group) {
  const layers = [
    { geo: new THREE.IcosahedronGeometry(0.32, 0), color: 0xe8c87e, opacity: 0.5, axis: [0, 1, 0], speed: 0.45 },
    { geo: new THREE.DodecahedronGeometry(0.26), color: 0xff6600, opacity: 0.65, axis: [0, 1, 0], speed: 0.7, rot: [Math.PI / 4, 0, Math.PI / 9] },
    { geo: new THREE.OctahedronGeometry(0.2), color: 0xff3300, opacity: 0.8, axis: [1, -1, 0], speed: 0.9 },
    { geo: new THREE.TetrahedronGeometry(0.14), color: 0xcc0000, opacity: 1, axis: [1, 1, 0], speed: 1.4, rot: [Math.PI / 6, 0, Math.PI / 6] },
    { geo: new THREE.IcosahedronGeometry(0.07, 0), color: 0xffddaa, opacity: 1, axis: [-1, 1, -1], speed: 2.1 },
  ];

  const meshes: { mesh: THREE.Mesh; axis: THREE.Vector3; speed: number }[] = [];

  for (const l of layers) {
    const mat = new THREE.MeshBasicMaterial({
      color: l.color,
      wireframe: true,
      transparent: l.opacity < 1,
      opacity: l.opacity,
    });
    const mesh = new THREE.Mesh(l.geo, mat);
    mesh.position.set(0, 0.5, 0);
    if (l.rot) mesh.rotation.set(l.rot[0]!, l.rot[1]!, l.rot[2]!);
    group.add(mesh);
    meshes.push({ mesh, axis: new THREE.Vector3(...l.axis).normalize(), speed: l.speed });
  }

  const clock = new THREE.Clock();
  meshes[0]!.mesh.onBeforeRender = () => {
    const delta = clock.getDelta();
    const breathe = 0.5 + Math.sin(clock.elapsedTime * 2.1) * 0.05;
    for (const { mesh, axis, speed } of meshes) {
      mesh.rotateOnAxis(axis, speed * delta);
      mesh.position.y = breathe;
    }
  };
}
