import { useState, useEffect } from "react";
import { toast } from "sonner";
import { slugify } from "../utils/slug";
import { useLanguage } from "../contexts/LanguageContext";
import { portalUrl } from "../utils/portal";
import type { UserProfile } from "../types/profile";

// The backend rewraps every HTTPException as `{ code, message }`, so the error
// payload lands under `message`, not FastAPI's default `detail`.
function errorPayload(body: unknown): { suggestion?: unknown } | null {
  if (!body || typeof body !== "object") return null;
  const { message, detail } = body as { message?: unknown; detail?: unknown };
  const payload = message ?? detail;
  return payload && typeof payload === "object" ? payload : null;
}

export function usePublicProfile(
  profile: UserProfile | null,
  refetchProfile: () => Promise<void>,
) {
  const { t, currentLanguage } = useLanguage();

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
  const [redirectingToPortal, setRedirectingToPortal] = useState(false);

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

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const publicProfileUrl = (slug: string) =>
    portalUrl(`people/${slug}`, profile?.language);

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

  // Coming back with the browser's back button can restore the page from the
  // bfcache with the redirect spinner still showing.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setRedirectingToPortal(false);
        setPublicProfileSaving(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

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

  const goToPortal = (url: string) => {
    setRedirectingToPortal(true);
    window.location.href = url;
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
        goToPortal(publicProfileUrl(slug));
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
        setPublicProfileSaving(false);
        return;
      }

      // Missing name or slug (400), or a slug that normalizes to nothing (422).
      if (response.status === 400 || response.status === 422) {
        setPublicProfileError(t("publicProfileValidationError"));
        setPublicProfileSaving(false);
        return;
      }

      if (response.status === 429) {
        setPublicProfileError(t("publicProfileCooldown"));
        setPublicProfileSaving(false);
        return;
      }

      toast.error(t("publicProfileError"));
      setPublicProfileSaving(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("publicProfileError"));
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
        await refetchProfile();
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
        await refetchProfile();
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

      await refetchProfile();
      setUnpublishModalOpen(false);
      setEditingSlug(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("unpublishError"));
    } finally {
      setUnpublishing(false);
    }
  };

  return {
    showPublicProfileForm,
    publicFirstName,
    setPublicFirstName,
    publicLastName,
    setPublicLastName,
    publicSlug,
    setPublicSlug,
    publicProfileSaving,
    publicProfileError,
    setPublicProfileError,
    slugSuggestion,
    setSlugSuggestion,
    redirectingToPortal,
    editingSlug,
    editSlug,
    setEditSlug,
    slugSaving,
    slugError,
    setSlugError,
    editSlugSuggestion,
    setEditSlugSuggestion,
    unpublishModalOpen,
    setUnpublishModalOpen,
    unpublishing,
    publicProfileUrl,
    publishedSlug,
    normalizedSlug,
    canCreatePublicProfile,
    slugOnCooldown,
    slugCooldownMessage,
    normalizedEditSlug,
    openPublicProfileForm,
    goToPortal,
    handleCreatePublicProfile,
    openSlugEditor,
    closeSlugEditor,
    handleSaveSlug,
    handleUnpublish,
  };
}
