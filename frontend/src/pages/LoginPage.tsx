import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import hotLogo from "../assets/images/hot-logo.svg";
import { useLanguage } from "../contexts/LanguageContext";

type OnboardingStep = "question" | "osm_connect" | "redirecting";

const ONBOARDING_STEP_KEY = "hotosm_onboarding_step";

const APP_DISPLAY_NAMES: Record<string, string> = {
  fair: "fAIr",
  umap: "uMap",
  "drone-tm": "Drone Tasking Manager",
  "osm-export-tool": "OSM Export Tool",
  chatmap: "ChatMap",
  "tasking-manager": "Tasking Manager",
};

function LoginPage() {
  const [searchParams] = useSearchParams();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // Restore step from sessionStorage (survives OAuth redirects)
  const getInitialStep = (): OnboardingStep => {
    const saved = sessionStorage.getItem(ONBOARDING_STEP_KEY);
    if (saved === "osm_connect" || saved === "redirecting") {
      return saved;
    }
    return "question";
  };

  const [onboardingStep, setOnboardingStepState] =
    useState<OnboardingStep>(getInitialStep);

  // Wrapper to save step to sessionStorage
  const setOnboardingStep = (step: OnboardingStep) => {
    if (step === "question") {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
    } else {
      sessionStorage.setItem(ONBOARDING_STEP_KEY, step);
    }
    setOnboardingStepState(step);
  };

  // Get all search params
  const onboardingApp = searchParams.get("onboarding");
  const isOnboarding = !!onboardingApp;
  const returnTo = searchParams.get("return_to");
  const osmRequired = searchParams.get("osm_required") === "true";
  const autoConnect = searchParams.get("auto_connect") === "true";
  const errorMessage = searchParams.get("error");

  // Show error toast if there's an error param
  const [showError, setShowError] = useState(!!errorMessage);

  // Track if user is logged in and their profile
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [_displayName, setDisplayName] = useState("");

  // Listen for login/logout events from hotosm-auth
  useEffect(() => {
    const handleLogin = async () => {
      setIsLoggedIn(true);
      console.log(isLoggedIn);
      // Fetch profile to get display name
      try {
        const response = await fetch("/api/profile/me", {
          credentials: "include",
        });
        if (response.ok) {
          const profile = await response.json();
          if (profile.first_name || profile.last_name) {
            setDisplayName(
              `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
            );
          }
        }
      } catch (error) {
        console.log("Could not fetch profile:", error);
      }
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      setDisplayName("");
    };

    document.addEventListener("hanko-login", handleLogin);
    document.addEventListener("logout", handleLogout);

    return () => {
      document.removeEventListener("hanko-login", handleLogin);
      document.removeEventListener("logout", handleLogout);
    };
  }, []);

  // Reset to question step if there's an error (user came back from failed onboarding)
  useEffect(() => {
    if (errorMessage && isOnboarding) {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      setOnboardingStepState("question");
    }
  }, [errorMessage, isOnboarding]);

  // Clear sessionStorage when not in onboarding mode
  useEffect(() => {
    if (!isOnboarding) {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
    }
  }, [isOnboarding]);

  useEffect(() => {
    if (returnTo || isOnboarding) return;
    fetch("/api/profile/me", { credentials: "include" }).then((res) => {
      if (res.ok) navigate("/profile");
    });
  }, []);

  // Listen for OSM connected event and redirect to onboarding
  useEffect(() => {
    if (!isOnboarding || onboardingStep !== "osm_connect") return;

    const handleOSMConnected = () => {
      console.log(
        "🎯 OSM connected event received, redirecting to onboarding...",
      );
      setOnboardingStep("redirecting");
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);

      const baseUrl = returnTo
        ? new URL(returnTo).origin
        : window.location.origin;
      const callbackUrl = `${baseUrl}/api/v1/auth/onboarding/`;

      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 500);
    };

    // Listen to the custom event from web component
    document.addEventListener("osm-connected", handleOSMConnected);

    return () => {
      document.removeEventListener("osm-connected", handleOSMConnected);
    };
  }, [isOnboarding, onboardingStep, returnTo]);

  const hankoUrl = import.meta.env.VITE_HANKO_URL || "http://login.localhost";
  const hankoBaseUrl = hankoUrl.replace(/\/login$/, "") || "http://localhost";

  const handleLegacyUser = () => {
    // User says they had an account - need to connect OSM
    setOnboardingStep("osm_connect");
  };

  const handleNewUser = () => {
    // User is new - redirect back to app with new_user flag
    setOnboardingStep("redirecting");

    // Build callback URL for the app
    const baseUrl = returnTo
      ? new URL(returnTo).origin
      : window.location.origin;
    const callbackUrl = `${baseUrl}/api/v1/auth/onboarding/?new_user=true`;

    setTimeout(() => {
      window.location.href = callbackUrl;
    }, 500);
  };

  const appDisplayName =
    (onboardingApp && APP_DISPLAY_NAMES[onboardingApp]) ||
    onboardingApp ||
    "the app";

  const appDisplayUrl = (() => {
    try {
      return returnTo ? new URL(returnTo).hostname : "";
    } catch {
      return returnTo || "";
    }
  })();

  return (
    <div className="flex items-center justify-center min-h-screen bg-hot-gray-50 p-4">
      {/* Error Toast */}
      {showError && errorMessage && (
        <div className="toast-error">
          <div className="toast-content">
            <span className="toast-icon">⚠️</span>
            <span className="toast-message">{errorMessage}</span>
            <button className="toast-close" onClick={() => setShowError(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl px-2 xl:px-8 py-8">
          {/* <LanguageSwitcher /> */}
          <div className="text-center mb-8">
            <img
              src={hotLogo}
              alt="Humanitarian OpenStreetMap Team"
              className="h-12 mx-auto"
            />
          </div>

          {/* Onboarding: Question step */}
          {isOnboarding && onboardingStep === "question" && (
            <div className="max-w-[360px] mx-auto flex flex-col items-center">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-hot-gray-900 mb-2">
                  {t("welcomeTo")} {appDisplayName}!
                </h2>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
                <p className="text-center text-hot-gray-900 font-bold mb-3">
                  {t("didYouHaveAccount")}
                </p>
                <p className="text-center text-sm text-hot-gray-600">
                  {t("ifPreviouslyUsed")} {appDisplayUrl} {t("recoverData")}
                </p>
              </div>

              <div className="flex flex-col gap-3 items-center w-full">
                <button
                  onClick={handleLegacyUser}
                  className="btn-secondary-hot"
                >
                  {t("yesRecoverAccount")}
                </button>
                <div className="flex items-center w-full gap-8">
                  <div className="flex-1 border-t border-hot-gray-200" />
                  <span className="text-base text-hot-gray-700">or</span>
                  <div className="flex-1 border-t border-hot-gray-200" />
                </div>
                <button onClick={handleNewUser} className="btn-primary-hot">
                  {t("continue")}
                </button>
              </div>
            </div>
          )}

          {/* Onboarding: OSM Connect step */}
          {isOnboarding && onboardingStep === "osm_connect" && (
            <div className="max-w-[400px] mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-hot-gray-900 mb-2">
                  {t("connectOsmAccount")}
                </h2>
                <p className="text-sm text-hot-gray-600">
                  {t("connectSameOsm")} {appDisplayName} data.
                </p>
              </div>

              <hotosm-auth
                hanko-url={hankoBaseUrl}
                show-profile={true}
                osm-required={true}
                auto-connect={true}
                lang={currentLanguage}
                redirect-after-login={`${returnTo ? new URL(returnTo).origin : ""}/api/v1/auth/onboarding/`}
              />

              <button
                onClick={() => setOnboardingStep("question")}
                className="btn-back mt-4"
              >
                {t("goBack")}
              </button>
            </div>
          )}

          {/* Onboarding: Redirecting step */}
          {isOnboarding && onboardingStep === "redirecting" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-200 border-t-hot-red-600 mx-auto mb-4"></div>
              <p className="text-hot-gray-600">{t("settingUpAccount")}</p>
            </div>
          )}

          {/* this is never showned at the moment, redirecting to profile page */}
          {!isOnboarding && (
            <div className="max-w-[400px] mx-auto">
              <hotosm-auth
                hanko-url={hankoBaseUrl}
                show-profile={true}
                lang={currentLanguage}
                redirect-after-login={returnTo || "/app/profile"}
                osm-required={osmRequired || undefined}
                auto-connect={autoConnect || undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
