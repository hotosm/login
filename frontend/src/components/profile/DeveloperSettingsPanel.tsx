import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApiTokens } from "../../hooks/useApiTokens";

const ALLOWED_APPS = [
  { id: "fair", label: "fAIr" },
  { id: "drone-tm", label: "Drone TM" },
  { id: "oam", label: "OpenAerialMap" },
];

interface DeveloperSettingsPanelProps {
  enabled: boolean;
}

function DeveloperSettingsPanel({ enabled }: DeveloperSettingsPanelProps) {
  const { t } = useLanguage();
  const {
    tokens,
    justCreatedToken,
    setJustCreatedToken,
    tokenCopied,
    handleGenerateToken,
    handleRevokeToken,
    handleCopyToken,
  } = useApiTokens(enabled);
  const [tokensExpanded, setTokensExpanded] = useState(false);

  return (
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
  );
}

export default DeveloperSettingsPanel;
