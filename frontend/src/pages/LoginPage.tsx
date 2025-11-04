import { useSearchParams } from 'react-router-dom';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return_to') || '/';
  const osmRequired = searchParams.get('osm_required') === 'true';
  const autoConnect = searchParams.get('auto_connect') === 'true';
  const hankoUrl = import.meta.env.VITE_HANKO_URL || 'http://login.localhost';
  // Hanko component adds /login automatically, so remove it from the URL
  const hankoBaseUrl = hankoUrl.replace(/\/login$/, '') || 'http://localhost';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          HOT Login
        </h1>
        <hotosm-auth
          hanko-url={hankoBaseUrl}
          show-profile={true}
          redirect-after-login={returnTo}
          osm-required={osmRequired || undefined}
          auto-connect={autoConnect || undefined}
        />

        {returnTo && returnTo !== '/' && (
          <div className="mt-4 text-center">
            <a
              href={returnTo}
              className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <span>←</span> Back to previous page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
