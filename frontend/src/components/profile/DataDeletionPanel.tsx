import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDataDeletionRequest } from "../../hooks/useDataDeletionRequest";
import Button from "@/components/shared/Button";
import Callout from "@/components/shared/Callout";
import Checkbox from "@/components/shared/Checkbox";
import Dialog from "@/components/shared/Dialog";
import ErrorBanner from "@/components/shared/ErrorBanner";

function DataDeletionPanel() {
  const { t } = useLanguage();
  const {
    dataDeletionSubmitting,
    dataDeletionSent,
    dataDeletionError,
    setDataDeletionError,
    handleRequestDataDeletion,
  } = useDataDeletionRequest();
  const [dataDeletionExpanded, setDataDeletionExpanded] = useState(false);
  const [dataDeletionModalOpen, setDataDeletionModalOpen] = useState(false);
  const [dataDeletionAcks, setDataDeletionAcks] = useState<
    [boolean, boolean, boolean]
  >([false, false, false]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
        <button
          type="button"
          onClick={() => setDataDeletionExpanded(!dataDeletionExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-lg font-semibold text-hot-gray-900">
            {t("dataDeletionPanelTitle")}
          </h2>
          <span className="text-hot-gray-400 text-xl">
            {dataDeletionExpanded ? "▲" : "▼"}
          </span>
        </button>

        {dataDeletionExpanded && (
          <div className="mt-4 border-t border-hot-gray-200 py-3">
            {dataDeletionSent ? (
              <Callout variant="success">{t("dataDeletionSent")}</Callout>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-hot-gray-900">
                  {t("dataDeletionTitle")}
                </p>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => {
                    setDataDeletionError(null);
                    setDataDeletionAcks([false, false, false]);
                    setDataDeletionModalOpen(true);
                  }}
                >
                  {t("dataDeletionRequestButton")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={dataDeletionModalOpen}
        label={t("dataDeletionConfirmTitle")}
        onWaRequestClose={(e) => {
          if (dataDeletionSubmitting) e.preventDefault();
        }}
        onWaAfterHide={(e) => {
          if (e.target === e.currentTarget) setDataDeletionModalOpen(false);
        }}
      >
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
        <div className="flex flex-col gap-2">
          {(
            [
              "dataDeletionAckEmail",
              "dataDeletionAckContact",
              "dataDeletionAckIrreversible",
            ] as const
          ).map((key, i) => (
            <Checkbox
              key={key}
              size="small"
              checked={dataDeletionAcks[i]}
              onCheckedChange={(checked) =>
                setDataDeletionAcks((prev) => {
                  const next: [boolean, boolean, boolean] = [...prev];
                  next[i] = checked;
                  return next;
                })
              }
            >
              {t(key)}
            </Checkbox>
          ))}
        </div>
        {dataDeletionError && (
          <div className="mt-4">
            <ErrorBanner>{dataDeletionError}</ErrorBanner>
          </div>
        )}

        <div slot="footer" className="flex justify-end gap-4">
          <Button
            variant="neutral"
            appearance="filled"
            disabled={dataDeletionSubmitting}
            onClick={() => setDataDeletionModalOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="danger"
            disabled={
              !dataDeletionAcks.every(Boolean) || dataDeletionSubmitting
            }
            loading={dataDeletionSubmitting}
            onClick={async () => {
              const ok = await handleRequestDataDeletion();
              if (ok) {
                setDataDeletionModalOpen(false);
              }
            }}
          >
            {t("dataDeletionConfirmButton")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export default DataDeletionPanel;
