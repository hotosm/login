import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import type { ApiTokenMeta } from "../types/profile";

export function useApiTokens(enabled: boolean) {
  const { t } = useLanguage();

  // API token state
  const [tokens, setTokens] = useState<ApiTokenMeta[]>([]);
  const [justCreatedToken, setJustCreatedToken] = useState<{
    app: string;
    token: string;
  } | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

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
    if (enabled) {
      fetchTokens();
    }
  }, [enabled, fetchTokens]);

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

  return {
    tokens,
    justCreatedToken,
    setJustCreatedToken,
    tokenCopied,
    fetchTokens,
    handleGenerateToken,
    handleRevokeToken,
    handleCopyToken,
  };
}
