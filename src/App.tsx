import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlayerProvider } from "./context/PlayerContext";
import App from "./components/App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
