/** MindAR Three.js mode — no bundled type declarations */
declare module "mind-ar/dist/mindar-image-three.prod.js" {
  import type { WebGLRenderer, Scene, PerspectiveCamera, Group } from "three";

  interface MindARThreeOptions {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
    filterMinCF?: number | null;
    filterBeta?: number | null;
    warmupTolerance?: number | null;
    missTolerance?: number | null;
  }

  interface Anchor {
    group: Group;
    onTargetFound: (() => void) | null;
    onTargetLost: (() => void) | null;
  }

  export class MindARThree {
    constructor(options: MindARThreeOptions);
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    addAnchor(targetIndex: number): Anchor;
    start(): Promise<void>;
    stop(): void;
  }
}
