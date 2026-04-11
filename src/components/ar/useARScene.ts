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
 * Glowing occult text with orbiting wireframe symbols.
 * Renders "GLEAMING EYES, RESPOND?" in Uncial Antiqua with layered glow,
 * surrounded by slowly orbiting wireframe geodesics.
 *
 * MindAR coords: target image spans ~-0.5 to 0.5 on X/Y at z=0.
 */
function buildSigilEntity(offsetStr: string, scale: number) {
  const group = new THREE.Group();
  const parts = offsetStr.split(",").map((s) => parseFloat(s.trim()) || 0);
  group.position.set(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0.5);
  group.scale.setScalar(scale);

  // --- Glowing text plane ---
  const canvas = document.createElement("canvas");
  const w = 1024, h = 512;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Occult symbols above and below
  const symbols = "✧  ☽  ◉  ☽  ✧";
  const drawText = () => {
    ctx.clearRect(0, 0, w, h);

    // Outer glow layers (drawn first, largest blur)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [blur, alpha] of [[40, 0.3], [20, 0.5], [10, 0.7]] as const) {
      ctx.shadowColor = "#40e090";
      ctx.shadowBlur = blur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = alpha;

      // Symbols
      ctx.font = `28px "Uncial Antiqua", serif`;
      ctx.fillStyle = "#60e0a0";
      ctx.fillText(symbols, w / 2, h * 0.22);
      ctx.fillText(symbols, w / 2, h * 0.78);

      // Main text — two lines
      ctx.font = `bold 104px "Uncial Antiqua", serif`;
      ctx.fillStyle = "#ccffee";
      ctx.fillText("GLEAMING EYES,", w / 2, h * 0.42);
      ctx.fillText("RESPOND?", w / 2, h * 0.58);
    }

    // Crisp foreground pass
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.font = `28px "Uncial Antiqua", serif`;
    ctx.fillStyle = "#80ffbb";
    ctx.fillText(symbols, w / 2, h * 0.22);
    ctx.fillText(symbols, w / 2, h * 0.78);

    ctx.font = `bold 104px "Uncial Antiqua", serif`;
    ctx.fillStyle = "#eeffee";
    ctx.fillText("GLEAMING EYES,", w / 2, h * 0.42);
    ctx.fillText("RESPOND?", w / 2, h * 0.58);
  };
  drawText();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const planeGeo = new THREE.PlaneGeometry(0.8, 0.4);
  const textMesh = new THREE.Mesh(planeGeo, planeMat);
  group.add(textMesh);

  // --- Orbiting wireframe geodesics ---
  const orbiters: { pivot: THREE.Group; speed: number }[] = [];
  const orbitConfigs = [
    { geo: new THREE.IcosahedronGeometry(0.04, 0), radius: 0.48, color: 0x2d8a6a, glow: 0x40e090, speed: 0.6, yOffset: 0, phase: 0 },
    { geo: new THREE.OctahedronGeometry(0.035), radius: 0.45, color: 0x40aa70, glow: 0x60e0a0, speed: -0.8, yOffset: 0.02, phase: Math.PI * 0.66 },
    { geo: new THREE.TetrahedronGeometry(0.03), radius: 0.42, color: 0x80ffbb, glow: 0xccffee, speed: 1.0, yOffset: -0.02, phase: Math.PI * 1.33 },
    { geo: new THREE.DodecahedronGeometry(0.03), radius: 0.46, color: 0x50cc80, glow: 0x80ffbb, speed: -0.5, yOffset: 0.01, phase: Math.PI * 0.5 },
    { geo: new THREE.IcosahedronGeometry(0.025, 0), radius: 0.44, color: 0x60e0a0, glow: 0xccffee, speed: 0.9, yOffset: -0.01, phase: Math.PI },
  ];

  for (const oc of orbitConfigs) {
    const pivot = new THREE.Group();
    pivot.rotation.y = oc.phase;

    const orbiterGroup = new THREE.Group();
    orbiterGroup.position.set(oc.radius, oc.yOffset, 0);

    // Core wireframe
    const mat = new THREE.MeshBasicMaterial({ color: oc.color, wireframe: true, transparent: true, opacity: 0.9 });
    orbiterGroup.add(new THREE.Mesh(oc.geo, mat));

    // Glow shell
    const glowGeo = oc.geo.clone();
    glowGeo.scale(1.4, 1.4, 1.4);
    const glowMat = new THREE.MeshBasicMaterial({ color: oc.glow, wireframe: true, transparent: true, opacity: 0.25 });
    orbiterGroup.add(new THREE.Mesh(glowGeo, glowMat));

    pivot.add(orbiterGroup);
    group.add(pivot);
    orbiters.push({ pivot, speed: oc.speed });
  }

  const clock = new THREE.Clock();
  const baseZ = group.position.z;

  return {
    group,
    update() {
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      // Breathing float
      group.position.z = baseZ + Math.sin(t * 2.1) * 0.04;
      // Pulsing text glow
      planeMat.opacity = 0.85 + Math.sin(t * 3) * 0.15;
      // Orbit the geodesics
      for (const { pivot, speed } of orbiters) {
        pivot.rotation.y += speed * delta;
      }
    },
  };
}
