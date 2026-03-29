import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

export type ARLoadState = "idle" | "loading" | "ready" | "error";

export interface UseARSceneOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mindFileUrl: string;
  onTargetFound?: () => void;
  onTargetLost?: () => void;
}

export interface UseARSceneReturn {
  loadState: ARLoadState;
  error: string | null;
  activate: () => void;
  deactivate: () => void;
  targetVisible: boolean;
}

export function useARScene({
  containerRef,
  mindFileUrl,
  onTargetFound,
  onTargetLost,
}: UseARSceneOptions): UseARSceneReturn {
  const [loadState, setLoadState] = useState<ARLoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);

  const mindarRef = useRef<any>(null);
  const activeRef = useRef(false);
  const stoppedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (mindarRef.current) {
      try {
        mindarRef.current.renderer.setAnimationLoop(null);
        mindarRef.current.stop();
      } catch (_) {}
      try {
        mindarRef.current.renderer.dispose();
      } catch (_) {}
      mindarRef.current = null;
    }
    // Clean up any leaked MindAR UI overlays
    document.querySelectorAll(".mindar-ui-overlay").forEach((el) => el.remove());
    // Clean container
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }
    activeRef.current = false;
    setTargetVisible(false);
  }, [containerRef]);

  const activate = useCallback(async () => {
    if (activeRef.current || !containerRef.current) return;
    activeRef.current = true;
    stoppedRef.current = false;
    setError(null);
    setLoadState("loading");

    try {
      // Dynamic import to avoid bundling issues — MindAR uses dynamic imports internally
      const { MindARThree } = await import(
        // @ts-ignore - no type declarations for this module
        "mind-ar/dist/mindar-image-three.prod.js"
      );

      if (stoppedRef.current) return;

      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: mindFileUrl,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
      });
      mindarRef.current = mindarThree;

      const { renderer, scene, camera } = mindarThree;
      const anchor = mindarThree.addAnchor(0);

      // Build the nested wireframe sigil entity
      buildSigilEntity(anchor.group);

      anchor.onTargetFound = () => {
        setTargetVisible(true);
        onTargetFound?.();
      };
      anchor.onTargetLost = () => {
        setTargetVisible(false);
        onTargetLost?.();
      };

      await mindarThree.start();

      if (stoppedRef.current) {
        cleanup();
        return;
      }

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      setLoadState("ready");
    } catch (err) {
      activeRef.current = false;
      const message =
        err instanceof Error ? err.message : "Unknown error starting AR";
      const friendlyMessage = message.includes("Permission")
        ? "Camera permission denied. Please allow camera access and try again."
        : `Could not start AR: ${message}`;
      setError(friendlyMessage);
      setLoadState("error");
    }
  }, [containerRef, mindFileUrl, onTargetFound, onTargetLost, cleanup]);

  const deactivate = useCallback(() => {
    stoppedRef.current = true;
    cleanup();
    setLoadState("idle");
  }, [cleanup]);

  // Deactivate on unmount
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return { loadState, error, activate, deactivate, targetVisible };
}

/**
 * Build the nested wireframe polyhedra effect as a Three.js group.
 * Each layer rotates on a different axis/speed for a shifting sigil look.
 */
function buildSigilEntity(group: THREE.Group) {
  const layers: {
    geometry: THREE.BufferGeometry;
    color: number;
    opacity: number;
    radius: number;
    rotationAxis: THREE.Vector3;
    rotationSpeed: number;
    initialRotation?: THREE.Euler;
  }[] = [
    {
      geometry: new THREE.IcosahedronGeometry(0.32, 0),
      color: 0xe8c87e,
      opacity: 0.5,
      radius: 0.32,
      rotationAxis: new THREE.Vector3(0, 1, 0),
      rotationSpeed: 0.45,
    },
    {
      geometry: new THREE.DodecahedronGeometry(0.26),
      color: 0xff6600,
      opacity: 0.65,
      radius: 0.26,
      rotationAxis: new THREE.Vector3(0, 1, 0),
      rotationSpeed: 0.7,
      initialRotation: new THREE.Euler(Math.PI / 4, 0, Math.PI / 9),
    },
    {
      geometry: new THREE.OctahedronGeometry(0.2),
      color: 0xff3300,
      opacity: 0.8,
      radius: 0.2,
      rotationAxis: new THREE.Vector3(1, -1, 0).normalize(),
      rotationSpeed: 0.9,
    },
    {
      geometry: new THREE.TetrahedronGeometry(0.14),
      color: 0xcc0000,
      opacity: 1,
      radius: 0.14,
      rotationAxis: new THREE.Vector3(1, 1, 0).normalize(),
      rotationSpeed: 1.4,
      initialRotation: new THREE.Euler(Math.PI / 6, 0, Math.PI / 6),
    },
    {
      geometry: new THREE.IcosahedronGeometry(0.07, 0),
      color: 0xffddaa,
      opacity: 1,
      radius: 0.07,
      rotationAxis: new THREE.Vector3(-1, 1, -1).normalize(),
      rotationSpeed: 2.1,
    },
  ];

  const meshes: { mesh: THREE.Mesh; axis: THREE.Vector3; speed: number }[] = [];

  for (const layer of layers) {
    const material = new THREE.MeshBasicMaterial({
      color: layer.color,
      wireframe: true,
      transparent: layer.opacity < 1,
      opacity: layer.opacity,
    });
    const mesh = new THREE.Mesh(layer.geometry, material);
    mesh.position.set(0, 0.5, 0);
    if (layer.initialRotation) {
      mesh.rotation.copy(layer.initialRotation);
    }
    group.add(mesh);
    meshes.push({ mesh, axis: layer.rotationAxis, speed: layer.rotationSpeed });
  }

  // Animate via a clock attached to the group's onBeforeRender
  const clock = new THREE.Clock();
  const root = meshes[0]!.mesh;
  root.onBeforeRender = () => {
    const delta = clock.getDelta();
    for (const { mesh, axis, speed } of meshes) {
      mesh.rotateOnAxis(axis, speed * delta);
    }
    // Breathing effect on Y position
    const t = clock.elapsedTime;
    const breathe = 0.5 + Math.sin(t * 2.1) * 0.05;
    for (const { mesh } of meshes) {
      mesh.position.y = breathe;
    }
  };
}
