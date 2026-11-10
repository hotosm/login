import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export function useDataDeletionRequest() {
  const { t } = useLanguage();

  const [dataDeletionSubmitting, setDataDeletionSubmitting] = useState(false);
  const [dataDeletionSent, setDataDeletionSent] = useState(false);
  const [dataDeletionError, setDataDeletionError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

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
      setDataDeletionError(t("dataDeletionError"));
      return false;
    } finally {
      setDataDeletionSubmitting(false);
    }
  };

  return {
    dataDeletionSubmitting,
    dataDeletionSent,
    dataDeletionError,
    setDataDeletionError,
    handleRequestDataDeletion,
  };
}
