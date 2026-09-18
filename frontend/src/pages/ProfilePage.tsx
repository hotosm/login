import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Hanko } from "@teamhanko/hanko-elements";
import { toast } from "sonner";
import { validateReturnTo } from "../utils/validateReturnTo";
import { slugify, slugifyInput } from "../utils/slug";
import { useLanguage } from "../contexts/LanguageContext";
import { LANGUAGES } from "../translations";
import PanelHeader from "@/components/PanelHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import Input from "@/components/forms/Input";
import Button from "@/components/shared/Button";
import ErrorBanner from "@/components/shared/ErrorBanner";

// Portal serves public profiles under a locale prefix and falls back to English
// for anything it doesn't ship.
const PORTAL_LOCALES = ["en", "es", "fr"];

const ALLOWED_APPS = [
  { id: "fair", label: "fAIr" },
  { id: "drone-tm", label: "Drone TM" },
  { id: "oam", label: "OpenAerialMap" },
];

// The backend rewraps every HTTPException as `{ code, message }`, so the error
// payload lands under `message`, not FastAPI's default `detail`.
function errorPayload(body: unknown): { suggestion?: unknown } | null {
  if (!body || typeof body !== "object") return null;
  const { message, detail } = body as { message?: unknown; detail?: unknown };
  const payload = message ?? detail;
  return payload && typeof payload === "object" ? payload : null;
}

interface ApiTokenMeta {
  id: string;
  app: string;
  created_at: string;
  last_used_at: string | null;
}

interface UserProfile {
  hanko_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  language: string;
  is_public: boolean;
  slug: string | null;
  // null means the slug can be changed now; a future date means it's locked.
  next_slug_change_at: string | null;
  osm_user_id: number | null;
  osm_username: string | null;
  osm_avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

function ProfilePage() {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage: setContextLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [language, setLanguage] = useState("en");

  // API token state
  const [tokens, setTokens] = useState<ApiTokenMeta[]>([]);
  const [justCreatedToken, setJustCreatedToken] = useState<{
    app: string;
    token: string;
  } | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokensExpanded, setTokensExpanded] = useState(false);

  // Public profile state
  const [showPublicProfileForm, setShowPublicProfileForm] = useState(false);
  const [publicFirstName, setPublicFirstName] = useState("");
  const [publicLastName, setPublicLastName] = useState("");
  const [publicSlug, setPublicSlug] = useState("");
  const [publicProfileSaving, setPublicProfileSaving] = useState(false);
  const [publicProfileError, setPublicProfileError] = useState<string | null>(
    null,
  );
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);

  // Published-profile management: slug edit and unpublish
  const [editingSlug, setEditingSlug] = useState(false);
  const [editSlug, setEditSlug] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [editSlugSuggestion, setEditSlugSuggestion] = useState<string | null>(
    null,
  );
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

  const [dataDeletionModalOpen, setDataDeletionModalOpen] = useState(false);
  const [dataDeletionSubmitting, setDataDeletionSubmitting] = useState(false);
  const [dataDeletionSent, setDataDeletionSent] = useState(false);
  const [dataDeletionError, setDataDeletionError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const hankoUrl = import.meta.env.VITE_HANKO_URL || "";
  const portalUrl = import.meta.env.VITE_PORTAL_URL || "http://portal.localhost";

  const locale =
    profile && PORTAL_LOCALES.includes(profile.language)
      ? profile.language
      : "en";
  const publicProfileUrl = (slug: string) =>
    `${portalUrl}/${locale}/people/${slug}`;

  // A published profile always has a slug; without one there is nothing to
  // link to, so fall back to the creation flow.
  const publishedSlug = profile?.is_public ? profile.slug : null;
  const normalizedSlug = slugify(publicSlug);
  const canCreatePublicProfile = Boolean(
    publicFirstName.trim() && publicLastName.trim() && normalizedSlug,
  );

  // The backend only lets the slug change once every 15 days, and tells us up
  // front when the next one is allowed — so the field can be locked before the
  // user types anything, instead of failing on save.
  const nextSlugChangeAt = profile?.next_slug_change_at
    ? new Date(profile.next_slug_change_at)
    : null;
  const slugOnCooldown =
    nextSlugChangeAt !== null && nextSlugChangeAt > new Date();
  const slugCooldownMessage = nextSlugChangeAt
    ? t("slugCooldownUntil", {
        date: new Intl.DateTimeFormat(currentLanguage, {
          dateStyle: "long",
        }).format(nextSlugChangeAt),
      })
    : null;
  const normalizedEditSlug = slugify(editSlug);

  // Get return URL from query params (passed by web component)
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = validateReturnTo(urlParams.get("return_to"));

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

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

  const fetchProfile = async () => {
    try {
      setLoading(true);

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
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/profile/me/api-tokens`, {
        credentials: "include",
      });
      if (response.ok) {
        setTokens(await response.json());
      }
    } catch {
      // Silently fail — tokens section just shows empty
    }
  }, [backendUrl]);

  useEffect(() => {
    if (!loading && profile) {
      fetchTokens();
    }
  }, [loading, profile, fetchTokens]);

  const handleGenerateToken = async (app: string) => {
    const existing = tokens.find((t) => t.app === app);
    if (existing) {
      if (!window.confirm(t("regenerateConfirm"))) return;
    }
    try {
      const response = await fetch(`${backendUrl}/profile/me/api-tokens`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app }),
      });
      if (response.ok) {
        const data = await response.json();
        setJustCreatedToken({ app: data.app, token: data.token });
        setTokenCopied(false);
        await fetchTokens();
      }
    } catch {
      toast.error("Failed to generate token");
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!window.confirm(t("revokeConfirm"))) return;
    try {
      const response = await fetch(
        `${backendUrl}/profile/me/api-tokens/${tokenId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (response.ok) {
        await fetchTokens();
        if (justCreatedToken) {
          const revoked = tokens.find((tk) => tk.id === tokenId);
          if (revoked && revoked.app === justCreatedToken.app) {
            setJustCreatedToken(null);
          }
        }
      }
    } catch {
      toast.error("Failed to revoke token");
    }
  };

  const handleCopyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 3000);
  };

  const handleRequestDataDeletion = async (): Promise<boolean> => {
    setDataDeletionSubmitting(true);
    setDataDeletionError(null);
    try {
      const response = await fetch(
        `${backendUrl}/profile/me/request-data-deletion`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setDataDeletionSent(true);
      return true;
    } catch (err) {
      console.error("Data deletion request failed:", err);
      setDataDeletionError(
        err instanceof Error ? err.message : t("dataDeletionError"),
      );
      return false;
    } finally {
      setDataDeletionSubmitting(false);
    }
  };

  const openPublicProfileForm = () => {
    setPublicFirstName(profile?.first_name || "");
    setPublicLastName(profile?.last_name || "");
    setPublicSlug(
      profile?.slug ||
        slugify(`${profile?.first_name || ""} ${profile?.last_name || ""}`),
    );
    setPublicProfileError(null);
    setSlugSuggestion(null);
    setShowPublicProfileForm(true);
  };

  const handleCreatePublicProfile = async () => {
    const slug = slugify(publicSlug);
    setPublicProfileSaving(true);
    setPublicProfileError(null);
    setSlugSuggestion(null);

    try {
      const response = await fetch(`${backendUrl}/profile/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: publicFirstName,
          last_name: publicLastName,
          slug,
          is_public: true,
        }),
      });

      if (response.ok) {
        window.location.href = publicProfileUrl(slug);
        return;
      }

      const body = await response.json().catch(() => null);
      const detail = errorPayload(body);

      // The slug is taken or reserved; the backend hands us a free alternative.
      if (response.status === 409) {
        const suggestion =
          typeof detail?.suggestion === "string" ? detail.suggestion : null;
        setSlugSuggestion(suggestion);
        setPublicProfileError(
          suggestion ? t("slugTaken", { suggestion }) : t("publicProfileError"),
        );
        return;
      }

      // Missing name or slug (400), or a slug that normalizes to nothing (422).
      if (response.status === 400 || response.status === 422) {
        setPublicProfileError(t("publicProfileValidationError"));
        return;
      }

      if (response.status === 429) {
        setPublicProfileError(t("publicProfileCooldown"));
        return;
      }

      toast.error(t("publicProfileError"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("publicProfileError"));
    } finally {
      setPublicProfileSaving(false);
    }
  };

  const openSlugEditor = () => {
    setEditSlug(profile?.slug || "");
    setSlugError(null);
    setEditSlugSuggestion(null);
    setEditingSlug(true);
  };

  const closeSlugEditor = () => {
    setEditingSlug(false);
    setSlugError(null);
    setEditSlugSuggestion(null);
  };

  const handleSaveSlug = async () => {
    const slug = slugify(editSlug);
    setSlugSaving(true);
    setSlugError(null);
    setEditSlugSuggestion(null);

    try {
      const response = await fetch(`${backendUrl}/profile/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      if (response.ok) {
        // Refetch so the fresh `next_slug_change_at` locks the field again.
        await fetchProfile();
        setEditingSlug(false);
        toast.success(t("slugUpdated"));
        return;
      }

      const body = await response.json().catch(() => null);
      const detail = errorPayload(body);

      // The slug is taken or reserved; the backend hands us a free alternative.
      if (response.status === 409) {
        const suggestion =
          typeof detail?.suggestion === "string" ? detail.suggestion : null;
        setEditSlugSuggestion(suggestion);
        setSlugError(
          suggestion ? t("slugTaken", { suggestion }) : t("slugUpdateError"),
        );
        return;
      }

      // A slug that normalizes to nothing.
      if (response.status === 422) {
        setSlugError(t("publicProfileValidationError"));
        return;
      }

      // The field is disabled during the cooldown, so this only shows up if the
      // window closed on the server between the fetch and the save.
      if (response.status === 429) {
        setSlugError(t("publicProfileCooldown"));
        await fetchProfile();
        return;
      }

      setSlugError(t("slugUpdateError"));
    } catch (err) {
      setSlugError(err instanceof Error ? err.message : t("slugUpdateError"));
    } finally {
      setSlugSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setUnpublishing(true);

    try {
      // Only `is_public` — the slug stays put, so the URL stays reserved and
      // republishing later doesn't burn the 15-day slug cooldown.
      const response = await fetch(`${backendUrl}/profile/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_public: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await fetchProfile();
      setUnpublishModalOpen(false);
      setEditingSlug(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("unpublishError"));
    } finally {
      setUnpublishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
      toast.success(t("profileUpdated"));

      // Update context language when user changes it
      setContextLanguage(data.language || "en");

      // Dispatch event for other apps to listen to language changes
      window.dispatchEvent(
        new CustomEvent("user-language-changed", {
          detail: { language: data.language },
        }),
      );

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
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
    <div>
      <div>
        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <PanelHeader sectionName={t("profileInformation")} />

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
                <Input
                  type="url"
                  value={pictureUrl}
                  onValueChange={setPictureUrl}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t("firstName")}
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onValueChange={setFirstName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t("lastName")}
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onValueChange={setLastName}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                {t("email")}
              </label>
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
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
            <div className="pt-4 flex flex-col gap-2">
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? t("saving") : t("saveChanges")}
              </Button>
              <Button
                appearance="outlined"
                onClick={async () => {
                  const hanko = new Hanko(hankoUrl);
                  await hanko.logout();
                  window.location.href = returnTo || "/app";
                }}
              >
                {t("logOut")}
              </Button>
            </div>
          </form>
        </div>

        {/* Public profile on Portal */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <PanelHeader sectionName={t("publicProfileTitle")} />

          {publishedSlug ? (
            <div className="flex flex-col items-start gap-3">

              {editingSlug ? (
                <div className="w-full space-y-3">
                  <Input
                    type="text"
                    label={t("slugLabel")}
                    hint={t("slugUrlPreview", {
                      url: publicProfileUrl(normalizedEditSlug),
                    })}
                    required
                    value={editSlug}
                    onValueChange={(value) => setEditSlug(slugifyInput(value))}
                  />

                  <p className="text-sm text-hot-gray-500">
                    {t("slugChangeBreaksLinks")}
                  </p>

                  {slugError && (
                    <ErrorBanner>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">{slugError}</span>
                        {editSlugSuggestion && (
                          <Button
                            type="button"
                            appearance="outlined"
                            size="small"
                            onClick={() => {
                              setEditSlug(editSlugSuggestion);
                              setSlugError(null);
                              setEditSlugSuggestion(null);
                            }}
                          >
                            {t("useSuggestedSlug")}
                          </Button>
                        )}
                      </div>
                    </ErrorBanner>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={!normalizedEditSlug || slugSaving}
                      onClick={handleSaveSlug}
                    >
                      {slugSaving ? t("saving") : t("saveChanges")}
                    </Button>
                    <Button
                      type="button"
                      appearance="plain"
                      disabled={slugSaving}
                      onClick={closeSlugEditor}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {slugOnCooldown ? (
                    <p className="text-sm text-hot-gray-500">
                      {slugCooldownMessage}
                    </p>
                  ) : (
                    <p className="text-sm text-hot-gray-500">
                      {t("slugChangeBreaksLinks")}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      appearance="outlined"
                      onClick={() => {
                        window.location.href = publicProfileUrl(publishedSlug);
                      }}
                    >
                      {t("viewEditPublicProfile")}
                    </Button>
                    <Button
                      type="button"
                      appearance="outlined"
                      disabled={slugOnCooldown}
                      onClick={openSlugEditor}
                    >
                      {t("editUrl")}
                    </Button>
                    <Button
                      type="button"
                      appearance="plain"
                      variant="danger"
                      onClick={() => setUnpublishModalOpen(true)}
                    >
                      {t("unpublishProfile")}
                    </Button>
                  </div>
                </>
              )}

              <ConfirmDialog
                open={unpublishModalOpen}
                label={t("unpublishConfirmTitle")}
                message={t("unpublishConfirmBody")}
                confirmText={t("unpublish")}
                danger
                busy={unpublishing}
                onConfirm={handleUnpublish}
                onCancel={() => {
                  if (!unpublishing) setUnpublishModalOpen(false);
                }}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm text-hot-gray-600 mb-4">
                {t("publicProfileDescription")}
              </p>

              {!showPublicProfileForm ? (
                <Button type="button" onClick={openPublicProfileForm}>
                  {t("createPublicProfile")}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="text"
                        label={t("firstName")}
                        required
                        value={publicFirstName}
                        onValueChange={setPublicFirstName}
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        label={t("lastName")}
                        required
                        value={publicLastName}
                        onValueChange={setPublicLastName}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      type="text"
                      label={t("slugLabel")}
                      hint={t("slugUrlPreview", {
                        url: publicProfileUrl(normalizedSlug),
                      })}
                      required
                      value={publicSlug}
                      onValueChange={(value) =>
                        setPublicSlug(slugifyInput(value))
                      }
                    />
                  </div>

                  {publicProfileError && (
                    <ErrorBanner>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">{publicProfileError}</span>
                        {slugSuggestion && (
                          <Button
                            type="button"
                            appearance="outlined"
                            size="small"
                            onClick={() => {
                              setPublicSlug(slugSuggestion);
                              setPublicProfileError(null);
                              setSlugSuggestion(null);
                            }}
                          >
                            {t("useSuggestedSlug")}
                          </Button>
                        )}
                      </div>
                    </ErrorBanner>
                  )}

                  <Button
                    type="button"
                    disabled={!canCreatePublicProfile || publicProfileSaving}
                    onClick={handleCreatePublicProfile}
                  >
                    {publicProfileSaving
                      ? t("publicProfileCreating")
                      : t("publicProfileSubmit")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <hanko-profile lang={language}></hanko-profile>
        </div>

        {/* Data deletion across HOT apps (independent from Hanko delete) */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-2">
            {t("dataDeletionTitle")}
          </h2>
          <p className="text-sm text-hot-gray-600 mb-4">
            {t("dataDeletionDescription")}{" "}
            <a
              href="https://www.hotosm.org/en/policies/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-hot-red-600 hover:underline"
            >
              {t("dataDeletionPrivacyPolicy")}
            </a>
            .
          </p>
          {dataDeletionSent ? (
            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm">
              {t("dataDeletionSent")}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDataDeletionError(null);
                setDataDeletionModalOpen(true);
              }}
              className="px-4 py-2 bg-hot-red-600 text-white rounded-lg hover:bg-hot-red-700 text-sm font-medium"
            >
              {t("dataDeletionRequestButton")}
            </button>
          )}
        </div>

        {dataDeletionModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !dataDeletionSubmitting && setDataDeletionModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-hot-gray-900 mb-2">
                {t("dataDeletionConfirmTitle")}
              </h3>
              <p className="text-sm text-hot-gray-600 mb-4">
                {t("dataDeletionConfirmBody")}
              </p>
              {dataDeletionError && (
                <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-3 py-2 rounded mb-3 text-sm">
                  {dataDeletionError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={dataDeletionSubmitting}
                  onClick={() => setDataDeletionModalOpen(false)}
                  className="px-4 py-2 bg-hot-gray-100 text-hot-gray-700 rounded-lg hover:bg-hot-gray-200 text-sm"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  disabled={dataDeletionSubmitting}
                  onClick={async () => {
                    const ok = await handleRequestDataDeletion();
                    if (ok) {
                      setDataDeletionModalOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-hot-red-600 text-white rounded-lg hover:bg-hot-red-700 text-sm font-medium disabled:opacity-50"
                >
                  {dataDeletionSubmitting
                    ? t("dataDeletionSubmitting")
                    : t("dataDeletionConfirmButton")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Developer Settings (collapsible, after hanko-profile) */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <button
            type="button"
            onClick={() => setTokensExpanded(!tokensExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-hot-gray-900">
              {t("developerSettings")}
            </h2>
            <span className="text-hot-gray-400 text-xl">
              {tokensExpanded ? "▲" : "▼"}
            </span>
          </button>

          {!tokensExpanded ? null : <>
          <h3 className="text-sm font-semibold text-hot-gray-700 mt-4 mb-2">
            {t("apiAccessTokens")}
          </h3>

          <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {t("apiTokenWarning")}
          </div>

          {/* One row per app */}
          <div className="divide-y divide-hot-gray-200">
            {ALLOWED_APPS.map((app) => {
              /* Show inline token reveal instead of the normal row */
              if (justCreatedToken && justCreatedToken.app === app.id) {
                return (
                  <div key={app.id} className="py-3">
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        {ALLOWED_APPS.find((a) => a.id === justCreatedToken.app)
                          ?.label || justCreatedToken.app}{" "}
                        — {t("tokenShownOnce")}
                      </p>
                      <code className="block w-full bg-white border border-yellow-300 rounded px-3 py-2 text-sm font-mono break-all select-all mb-2">
                        {justCreatedToken.token}
                      </code>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCopyToken(justCreatedToken.token)}
                          className="btn-primary-hot text-sm px-3 py-2"
                        >
                          {tokenCopied ? t("tokenCopied") : t("copyToken")}
                        </button>
                        <button
                          onClick={() => setJustCreatedToken(null)}
                          className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                        >
                          {t("iSavedIt")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              const token = tokens.find((tk) => tk.app === app.id);
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-hot-gray-900">
                      {app.label}
                    </p>
                    {token && (
                      <p className="text-xs text-hot-gray-500">
                        {t("tokenCreatedOn")}{" "}
                        {new Date(token.created_at).toLocaleDateString()}
                        {" · "}
                        {token.last_used_at
                          ? `${t("tokenLastUsed")} ${new Date(token.last_used_at).toLocaleDateString()}`
                          : t("tokenNeverUsed")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateToken(app.id)}
                      className={
                        token
                          ? "text-sm text-hot-gray-600 hover:text-hot-gray-900 border border-hot-gray-300 rounded px-3 py-1"
                          : "text-sm btn-primary-hot px-3 py-1"
                      }
                    >
                      {token ? t("regenerateToken") : t("generateToken")}
                    </button>
                    {token && (
                      <button
                        onClick={() => handleRevokeToken(token.id)}
                        className="text-sm text-hot-red-600 hover:text-hot-red-800 border border-hot-red-300 rounded px-3 py-1"
                      >
                        {t("revokeToken")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </>}
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
