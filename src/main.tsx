import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { PlayerProvider } from "./context/PlayerContext";
import App from "./components/App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
    <Toaster
      theme="dark"
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
