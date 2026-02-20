import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import hotLogo from "../assets/images/hot-logo.svg";
import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGES } from "../translations";

interface UserProfile {
  hanko_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  language: string;
  osm_user_id: number | null;
  osm_username: string | null;
  osm_avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

function ProfilePage() {
  const navigate = useNavigate();
  const { t, setLanguage: setContextLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [language, setLanguage] = useState("en");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // Get return URL from query params (passed by web component)
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get("return_to");

  // Determine back button text and destination
  const getBackInfo = () => {
    if (returnTo) {
      try {
        const url = new URL(returnTo);
        // Extract app name from hostname (e.g., "fair" from "fair.hotosm.org")
        const appName = url.hostname.split(".")[0];
        // Capitalize first letter
        const label = appName.charAt(0).toUpperCase() + appName.slice(1);
        return { url: returnTo, label };
      } catch {
        // Invalid URL, fall back to Login
      }
    }
    return { url: "/", label: "Login" };
  };

  const backInfo = getBackInfo();

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Listen for account deletion event from Hanko
  useEffect(() => {
    const handleUserDeleted = () => {
      // Clear any local state
      setProfile(null);

      // Show confirmation
      alert(
        t("accountDeleted") || "Your account has been deleted successfully.",
      );

      // Redirect to the return URL (previous app) or login page
      if (returnTo) {
        window.location.href = returnTo;
      } else {
        window.location.href = "/";
      }
    };

    document.addEventListener("hanko-user-deleted", handleUserDeleted);

    return () => {
      document.removeEventListener("hanko-user-deleted", handleUserDeleted);
    };
  }, [t, returnTo]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendUrl}/profile/me`, {
        credentials: "include",
      });

      if (response.status === 401) {
        // Not logged in, redirect to login
        navigate("/?return_to=" + encodeURIComponent(window.location.href));
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);

      // Initialize form
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setPictureUrl(data.picture_url || "");
      setLanguage(data.language || "en");

      // Set the context language to match user's profile language
      setContextLanguage(data.language || "en");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${backendUrl}/profile/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName || null,
          last_name: lastName || null,
          picture_url: pictureUrl || null,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data);
      setSuccess(t("profileUpdated"));

      // Update context language when user changes it
      setContextLanguage(data.language || "en");

      // Dispatch event for other apps to listen to language changes
      window.dispatchEvent(
        new CustomEvent("user-language-changed", {
          detail: { language: data.language },
        }),
      );

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-hot-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hot-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={hotLogo} alt="HOT" className="h-10" />
            </div>
            <button
              onClick={() => {
                if (backInfo.url.startsWith("http")) {
                  window.location.href = backInfo.url;
                } else {
                  navigate(backInfo.url);
                }
              }}
              className="text-hot-gray-1000 hover:text-hot-gray-900 text-sm transition-colors"
            >
              ← {t("back")}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">
            {t("profileInformation")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={
                  pictureUrl ||
                  profile?.osm_avatar_url ||
                  `https://www.gravatar.com/avatar/?d=identicon&s=80`
                }
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-hot-gray-200"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t("pictureUrl")}
                </label>
                <input
                  type="url"
                  value={pictureUrl}
                  onChange={(e) => setPictureUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="input-field"
                />
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t("firstName")}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t("lastName")}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="input-field-disabled"
              />
              <p className="text-xs text-hot-gray-400 mt-1">
                {t("emailManagedBy")}
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                {t("language")}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* OSM Connection */}
            {profile?.osm_username && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.osm_avatar_url || ""}
                    alt="OSM Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {t("connectedToOsm")}
                    </p>
                    <p className="text-sm text-green-600">
                      @{profile.osm_username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary-hot disabled:opacity-50"
              >
                {saving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </form>
        </div>

        {/* Security Section - Hanko Profile */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">
            {t("security")}
          </h2>
          <p className="text-sm text-hot-gray-600 mb-4">
            {t("managePasswordPasskeys")}
          </p>

          {/* Hanko Profile Component */}
          <hanko-profile lang={language}></hanko-profile>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-hot-gray-500">
          <p>
            {t("accountCreated")}:{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
