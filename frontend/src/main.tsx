import { StrictMode, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
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

// Sonner ships its own palette (generic green/red hues) and injects it as a
// <style> tag at runtime. These are the same --hot-color-* tokens the Tailwind
// scales are built from, set inline so they win over that injected stylesheet
// regardless of load order or the toaster's data-theme.
// Text steps are picked for >= 4.5:1 against their own background: the 700 step
// is too light on cyan (3.8:1) and the yellow scale runs orange, so success
// uses 900 and warning falls back to gray-950.
const toastTokens = {
  "--success-bg": "var(--hot-color-success-50)",
  "--success-border": "var(--hot-color-success-200)",
  "--success-text": "var(--hot-color-success-900)",
  "--error-bg": "var(--hot-color-red-50)",
  "--error-border": "var(--hot-color-red-200)",
  "--error-text": "var(--hot-color-red-700)",
  "--warning-bg": "var(--hot-color-warning-50)",
  "--warning-border": "var(--hot-color-warning-200)",
  "--warning-text": "var(--hot-color-gray-950)",
  "--info-bg": "var(--hot-color-blue-50)",
  "--info-border": "var(--hot-color-blue-200)",
  "--info-text": "var(--hot-color-blue-700)",
} as CSSProperties;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster richColors position="bottom-right" style={toastTokens} />
    <App />
  </StrictMode>,
);
