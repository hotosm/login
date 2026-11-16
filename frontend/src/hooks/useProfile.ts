import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import type { UserProfile } from "../types/profile";

export function useProfile() {
  const navigate = useNavigate();
  const { t, setLanguage: setContextLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [language, setLanguage] = useState("en");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

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

  return {
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
  };
}
