import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { backendUrl, readError } from '../utils/api';

type Status = 'loading' | 'success' | 'error';

// Handles /invite?token=... — accepts an organization invitation on mount.
function AcceptInvitePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  // Guard against React 18/19 StrictMode double-invoking the effect
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setError(t('noInviteToken'));
      setStatus('error');
      return;
    }

    const accept = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/me/invitations/${token}/accept`,
          { method: 'POST', credentials: 'include' },
        );
        if (response.status === 401) {
          navigate('/?return_to=' + encodeURIComponent(window.location.href));
          return;
        }
        if (!response.ok) throw new Error(await readError(response));
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : t('inviteFailed'));
        setStatus('error');
      }
    };

    accept();
  }, [token, navigate, t]);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-hot-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-hot-gray-600">{t('acceptingInvite')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-lg font-semibold text-hot-gray-900 mb-2">
              {t('inviteAccepted')}
            </h1>
            <Link
              to="/organizations"
              className="btn-primary-hot inline-block w-auto px-6 py-2 text-sm mt-2"
            >
              {t('goToGroup')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-lg font-semibold text-hot-red-600 mb-2">
              {t('inviteFailed')}
            </h1>
            {error && <p className="text-sm text-hot-gray-600 mb-4">{error}</p>}
            <Link
              to="/organizations"
              className="btn-secondary-hot inline-block w-auto px-6 py-2 text-sm"
            >
              {t('navOrganizations')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default AcceptInvitePage;
