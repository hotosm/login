import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import hotLogo from '../assets/images/hot-logo.svg';

interface UserProfile {
  hanko_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  language: string;
  osm_user_id: number | null;
  osm_username: string | null;
  osm_avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'id', name: 'Bahasa Indonesia' },
];

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [language, setLanguage] = useState('en');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

  // Get return URL from query params (passed by web component)
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('return_to');

  // Determine back button text and destination
  const getBackInfo = () => {
    if (returnTo) {
      try {
        const url = new URL(returnTo);
        // Extract app name from hostname (e.g., "fair" from "fair.hotosm.org")
        const appName = url.hostname.split('.')[0];
        // Capitalize first letter
        const label = appName.charAt(0).toUpperCase() + appName.slice(1);
        return { url: returnTo, label };
      } catch {
        // Invalid URL, fall back to Login
      }
    }
    return { url: '/', label: 'Login' };
  };

  const backInfo = getBackInfo();

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${backendUrl}/profile/me`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        // Not logged in, redirect to login
        navigate('/?return_to=' + encodeURIComponent(window.location.href));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);

      // Initialize form
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setPictureUrl(data.picture_url || '');
      setLanguage(data.language || 'en');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${backendUrl}/profile/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName || null,
          last_name: lastName || null,
          picture_url: pictureUrl || null,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      setSuccess('Profile updated successfully');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    <div className="min-h-screen bg-hot-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={hotLogo} alt="HOT" className="h-10" />
              <h1 className="text-2xl font-bold text-hot-gray-900">My Profile</h1>
            </div>
            <button
              onClick={() => {
                if (backInfo.url.startsWith('http')) {
                  window.location.href = backInfo.url;
                } else {
                  navigate(backInfo.url);
                }
              }}
              className="text-hot-gray-600 hover:text-hot-red-600 text-sm transition-colors"
            >
              ← Back to {backInfo.label}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">Profile Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={pictureUrl || profile?.osm_avatar_url || `https://www.gravatar.com/avatar/?d=identicon&s=80`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-hot-gray-200"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  Picture URL
                </label>
                <input
                  type="url"
                  value={pictureUrl}
                  onChange={(e) => setPictureUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="input-field"
                />
              </div>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-field-disabled"
              />
              <p className="text-xs text-hot-gray-400 mt-1">
                Email is managed by your login provider
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                Language
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
                    src={profile.osm_avatar_url || ''}
                    alt="OSM Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Connected to OpenStreetMap
                    </p>
                    <p className="text-sm text-green-600">@{profile.osm_username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary-hot disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Section - Hanko Profile */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">Security</h2>
          <p className="text-sm text-hot-gray-600 mb-4">
            Manage your password, passkeys, and active sessions.
          </p>

          {/* Hanko Profile Component */}
          <hanko-profile></hanko-profile>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-hot-red-200">
          <h2 className="text-lg font-semibold text-hot-red-700 mb-4">Danger Zone</h2>
          <p className="text-sm text-hot-gray-600 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // TODO: Implement account deletion via Hanko API
                alert('Account deletion will be available soon.');
              }
            }}
            className="px-4 py-2 bg-hot-red-600 text-white rounded-lg hover:bg-hot-red-700 transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-hot-gray-500">
          <p>
            Account created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
