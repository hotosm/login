import { useEffect, useState } from 'react';
import { backendUrl } from '../utils/api';

export interface Roles {
  isAdmin: boolean;
  isAccountManager: boolean;
  loading: boolean;
}

// Fetches the current user's platform roles once (GET /me/roles).
// Defaults to no privileges while loading or on error.
export function useRoles(): Roles {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountManager, setIsAccountManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRoles = async () => {
      try {
        const response = await fetch(`${backendUrl}/me/roles`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setIsAdmin(!!data.is_admin);
            setIsAccountManager(!!data.is_account_manager);
          }
        }
      } catch {
        // Keep defaults (no privileges) on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRoles();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, isAccountManager, loading };
}
