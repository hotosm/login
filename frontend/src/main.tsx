import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import HOTOSM auth web component
import "@hotosm/hanko-auth";

import { register } from "@teamhanko/hanko-elements";
import { getTranslations } from "@hotosm/hanko-auth";

// Set global HANKO_URL for the web component
window.HANKO_URL = import.meta.env.VITE_HANKO_URL || "http://login.localhost";

// Register Hanko elements with translations (needed for hanko-profile on ProfilePage)
register(window.HANKO_URL, {
  enablePasskeys: false,
  hidePasskeyButtonOnLogin: true,
  translations: getTranslations(),
  fallbackLanguage: "en",
}).catch((error) => {
  console.error("Failed to register Hanko elements:", error);
});

console.log("🔧 Hanko URL configured:", window.HANKO_URL);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
