import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { PlayerProvider } from "./context/PlayerContext";
import App from "./components/App";

declare const __BUILD_VERSION__: string;
const buildVersion = typeof __BUILD_VERSION__ !== "undefined" ? __BUILD_VERSION__ : "dev · " + new Date().toLocaleTimeString();

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
    <div style={{ position: "fixed", bottom: 4, right: 6, fontSize: 9, color: "rgba(255,255,255,0.15)", pointerEvents: "none", zIndex: 9999, fontFamily: "monospace" }}>
      {buildVersion}
    </div>
    <Toaster
      theme="dark"
      position="top-center"
      toastOptions={{
        style: {
          background: "#2e2d50",
          border: "1px solid rgba(201,168,76,0.3)",
          color: "#e8dcc8",
          fontFamily: "Georgia, serif",
          borderRadius: "0",
        },
      }}
    />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
