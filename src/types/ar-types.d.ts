/**
 * Type declarations for A-Frame and AR.js custom elements.
 * Extends React's JSX IntrinsicElements to allow A-Frame tags in TSX.
 */

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        embedded?: boolean | string;
        arjs?: string;
        renderer?: string;
        "vr-mode-ui"?: string;
        "loading-screen"?: string;
      };
      "a-marker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        preset?: string;
        type?: string;
        url?: string;
        smooth?: string | boolean;
        "smooth-count"?: string | number;
        "smooth-tolerance"?: string | number;
      };
      "a-entity": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        geometry?: string;
        material?: string;
        position?: string;
        rotation?: string;
        scale?: string;
        animation?: string;
        animation__breathe?: string;
        animation__pulse?: string;
        light?: string;
        "gltf-model"?: string;
      };
      "a-camera": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: string;
      };
    }
  }
}
