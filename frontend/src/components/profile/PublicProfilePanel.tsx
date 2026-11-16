import { slugifyInput } from "../../utils/slug";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import PanelHeader from "@/components/PanelHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import Input from "@/components/forms/Input";
import Button from "@/components/shared/Button";
import ErrorBanner from "@/components/shared/ErrorBanner";
import type { UserProfile } from "../../types/profile";

interface PublicProfilePanelProps {
  profile: UserProfile | null;
  refetchProfile: () => Promise<void>;
}

function PublicProfilePanel({
  profile,
  refetchProfile,
}: PublicProfilePanelProps) {
  const { t } = useLanguage();
  const {
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
  } = usePublicProfile(profile, refetchProfile);

  return (
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
                  loading={redirectingToPortal}
                  disabled={redirectingToPortal}
                  onClick={() => goToPortal(publicProfileUrl(publishedSlug))}
                >
                  {redirectingToPortal
                    ? t("redirectingToPortal")
                    : t("viewEditPublicProfile")}
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
                loading={publicProfileSaving || redirectingToPortal}
                disabled={
                  !canCreatePublicProfile ||
                  publicProfileSaving ||
                  redirectingToPortal
                }
                onClick={handleCreatePublicProfile}
              >
                {redirectingToPortal
                  ? t("redirectingToPortal")
                  : publicProfileSaving
                    ? t("publicProfileCreating")
                    : t("publicProfileSubmit")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PublicProfilePanel;
