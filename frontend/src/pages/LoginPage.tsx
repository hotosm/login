import { useSearchParams } from 'react-router-dom';
import hotLogo from '../assets/images/hot-logo.svg';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return_to');
  const osmRequired = searchParams.get('osm_required') === 'true';
  const autoConnect = searchParams.get('auto_connect') === 'true';
  const hankoUrl = import.meta.env.VITE_HANKO_URL || 'http://login.localhost';
  // Hanko component adds /login automatically, so remove it from the URL
  const hankoBaseUrl = hankoUrl.replace(/\/login$/, '') || 'http://localhost';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={hotLogo}
              alt="Humanitarian OpenStreetMap Team"
              className="h-12 mx-auto"
            />
          </div>

          <div className="max-w-[400px] mx-auto">
            {/* SSO Description */}
            <div className="text-center px-5">
              <p className="text-sm text-gray-600">
                Access all HOT tools and services
              </p>
            </div>

            <hotosm-auth
              hanko-url={hankoBaseUrl}
              show-profile={true}
              redirect-after-login={returnTo || undefined}
              osm-required={osmRequired || undefined}
              auto-connect={autoConnect || undefined}
            />
          </div>

          {returnTo && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <a
                href={returnTo}
                className="text-sm text-gray-600 hover:text-red-600 inline-flex items-center gap-2 transition-colors"
              >
                <span>←</span> Back to previous page
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://www.hotosm.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Humanitarian OpenStreetMap Team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
