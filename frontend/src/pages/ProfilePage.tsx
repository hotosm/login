import { useEffect } from "react";
import { validateReturnTo } from "../utils/validateReturnTo";
import { useLanguage } from "../contexts/LanguageContext";
import { useProfile } from "../hooks/useProfile";
import AccountInfoPanel from "@/components/profile/AccountInfoPanel";
import PublicProfilePanel from "@/components/profile/PublicProfilePanel";
import DeveloperSettingsPanel from "@/components/profile/DeveloperSettingsPanel";
import DataDeletionPanel from "@/components/profile/DataDeletionPanel";

function ProfilePage() {
  const { t } = useLanguage();
  const {
    profile,
    setProfile,
    loading,
    saving,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    pictureUrl,
    setPictureUrl,
    language,
    setLanguage,
    fetchProfile,
    handleSubmit,
  } = useProfile();

  const hankoUrl = import.meta.env.VITE_HANKO_URL || "";

  // Get return URL from query params (passed by web component)
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = validateReturnTo(urlParams.get("return_to"));

  // Inject styles into hanko-profile
  useEffect(() => {
    if (loading) return;

    const el = document.querySelector("hanko-profile");
    if (
      !el?.shadowRoot ||
      el.shadowRoot.querySelector("#hot-profile-overrides")
    )
      return;

    const style = document.createElement("style");
    style.id = "hot-profile-overrides";
    style.textContent = `
      .hanko_label.hanko_dropdown .hanko_labelText {
        margin-top: var(--hot-spacing-small);
        text-decoration: underline;
        transition: color 0.2s ease;
      }
      .hanko_label.hanko_dropdown:hover .hanko_labelText {
        color: var(--hot-color-gray-1000);
      }
    `;
    el.shadowRoot.appendChild(style);
  }, [loading]);

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

  const spinner = (
    <div className="flex items-start justify-center mt-xl bg-hot-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent"></div>
    </div>
  );

  // Initial load: nothing to keep yet, so only the spinner renders.
  if (loading && !profile) {
    return spinner;
  }

  // On a refetch the panels stay mounted (hidden) under the spinner so their
  // local state survives the reload.
  return (
    <div>
      {loading && spinner}
      <div hidden={loading}>
        {/* Profile Form */}
        <AccountInfoPanel
          profile={profile}
          saving={saving}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          pictureUrl={pictureUrl}
          setPictureUrl={setPictureUrl}
          language={language}
          setLanguage={setLanguage}
          handleSubmit={handleSubmit}
          hankoUrl={hankoUrl}
          returnTo={returnTo}
        />

        {/* Public profile on Portal */}
        <PublicProfilePanel profile={profile} refetchProfile={fetchProfile} />

        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <hanko-profile lang={language}></hanko-profile>
        </div>

        {/* Developer Settings (collapsible, after hanko-profile) */}
        <DeveloperSettingsPanel enabled={!loading && Boolean(profile)} />

        {/* Data deletion across HOT apps (independent from Hanko delete) */}
        <DataDeletionPanel />

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
