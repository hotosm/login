import { Hanko } from "@teamhanko/hanko-elements";
import { useLanguage } from "../../contexts/LanguageContext";
import { LANGUAGES } from "../../translations";
import PanelHeader from "@/components/PanelHeader";
import Input from "@/components/forms/Input";
import Button from "@/components/shared/Button";
import type { UserProfile } from "../../types/profile";

interface AccountInfoPanelProps {
  profile: UserProfile | null;
  saving: boolean;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  pictureUrl: string;
  setPictureUrl: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  hankoUrl: string;
  returnTo: string | null;
}

function AccountInfoPanel({
  profile,
  saving,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  pictureUrl,
  setPictureUrl,
  language,
  setLanguage,
  handleSubmit,
  hankoUrl,
  returnTo,
}: AccountInfoPanelProps) {
  const { t } = useLanguage();

  return (
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
  );
}

export default AccountInfoPanel;
