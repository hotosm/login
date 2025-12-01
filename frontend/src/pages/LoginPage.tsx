import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import hotLogo from '../assets/images/hot-logo.svg';

type OnboardingStep = 'question' | 'osm_connect' | 'redirecting';

const ONBOARDING_STEP_KEY = 'hotosm_onboarding_step';

function LoginPage() {
  const [searchParams] = useSearchParams();

  // Restore step from sessionStorage (survives OAuth redirects)
  const getInitialStep = (): OnboardingStep => {
    const saved = sessionStorage.getItem(ONBOARDING_STEP_KEY);
    if (saved === 'osm_connect' || saved === 'redirecting') {
      return saved;
    }
    return 'question';
  };

  const [onboardingStep, setOnboardingStepState] = useState<OnboardingStep>(getInitialStep);

  // Wrapper to save step to sessionStorage
  const setOnboardingStep = (step: OnboardingStep) => {
    if (step === 'question') {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
    } else {
      sessionStorage.setItem(ONBOARDING_STEP_KEY, step);
    }
    setOnboardingStepState(step);
  };

  // Get all search params
  const onboardingApp = searchParams.get('onboarding');
  const isOnboarding = !!onboardingApp;
  const returnTo = searchParams.get('return_to');
  const osmRequired = searchParams.get('osm_required') === 'true';
  const autoConnect = searchParams.get('auto_connect') === 'true';
  const errorMessage = searchParams.get('error');

  // Show error toast if there's an error param
  const [showError, setShowError] = useState(!!errorMessage);

  // Reset to question step if there's an error (user came back from failed onboarding)
  useEffect(() => {
    if (errorMessage && isOnboarding) {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      setOnboardingStepState('question');
    }
  }, [errorMessage, isOnboarding]);

  // Clear sessionStorage when not in onboarding mode
  useEffect(() => {
    if (!isOnboarding) {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
    }
  }, [isOnboarding]);

  // Listen for OSM connected event and redirect to onboarding
  useEffect(() => {
    if (!isOnboarding || onboardingStep !== 'osm_connect') return;

    const handleOSMConnected = () => {
      console.log('🎯 OSM connected event received, redirecting to onboarding...');
      setOnboardingStep('redirecting');
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);

      const baseUrl = returnTo ? new URL(returnTo).origin : window.location.origin;
      const callbackUrl = `${baseUrl}/api/v1/auth/onboarding/`;

      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 500);
    };

    // Listen to the custom event from web component
    document.addEventListener('osm-connected', handleOSMConnected);

    return () => {
      document.removeEventListener('osm-connected', handleOSMConnected);
    };
  }, [isOnboarding, onboardingStep, returnTo]);

  const hankoUrl = import.meta.env.VITE_HANKO_URL || 'http://login.localhost';
  const hankoBaseUrl = hankoUrl.replace(/\/login$/, '') || 'http://localhost';

  const handleLegacyUser = () => {
    // User says they had an account - need to connect OSM
    setOnboardingStep('osm_connect');
  };

  const handleNewUser = () => {
    // User is new - redirect back to app with new_user flag
    setOnboardingStep('redirecting');

    // Build callback URL for the app
    const baseUrl = returnTo ? new URL(returnTo).origin : window.location.origin;
    const callbackUrl = `${baseUrl}/api/v1/auth/onboarding/?new_user=true`;

    setTimeout(() => {
      window.location.href = callbackUrl;
    }, 500);
  };

  // Get app display name
  const appDisplayName = onboardingApp === 'fair' ? 'fAIr' : onboardingApp || 'the app';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Error Toast */}
      {showError && errorMessage && (
        <div className="toast-error">
          <div className="toast-content">
            <span className="toast-icon">⚠️</span>
            <span className="toast-message">{errorMessage}</span>
            <button className="toast-close" onClick={() => setShowError(false)}>×</button>
          </div>
        </div>
      )}

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

          {/* Onboarding: Question step */}
          {isOnboarding && onboardingStep === 'question' && (
            <div className="max-w-[400px] mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to {appDisplayName}!
                </h2>
                <p className="text-sm text-gray-600">
                  We need to set up your account.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
                <p className="text-center text-gray-800 font-medium mb-3">
                  Did you have an existing {appDisplayName} account?
                </p>
                <p className="text-center text-sm text-gray-600">
                  If you previously used {appDisplayName} with OpenStreetMap,
                  we can recover your data.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={handleLegacyUser} className="btn-primary-hot">
                  Yes, recover my account
                </button>
                <button onClick={handleNewUser} className="btn-secondary-hot">
                  No, I'm new here
                </button>
              </div>

              <p className="mt-5 text-xs text-center text-gray-400">
                Not sure? Select "Yes" and we'll check for you.
              </p>
            </div>
          )}

          {/* Onboarding: OSM Connect step */}
          {isOnboarding && onboardingStep === 'osm_connect' && (
            <div className="max-w-[400px] mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Connect your OpenStreetMap account
                </h2>
                <p className="text-sm text-gray-600">
                  Connect with the same OSM account you used before to recover your {appDisplayName} data.
                </p>
              </div>

              <hotosm-auth
                hanko-url={hankoBaseUrl}
                show-profile={true}
                osm-required={true}
                auto-connect={true}
                redirect-after-login={`${returnTo ? new URL(returnTo).origin : ''}/api/v1/auth/onboarding/`}
              />

              <button
                onClick={() => setOnboardingStep('question')}
                className="btn-back mt-4"
              >
                ← Go back
              </button>
            </div>
          )}

          {/* Onboarding: Redirecting step */}
          {isOnboarding && onboardingStep === 'redirecting' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your account...</p>
            </div>
          )}

          {/* Normal login (not onboarding) */}
          {!isOnboarding && (
            <div className="max-w-[400px] mx-auto">
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
          )}

          {returnTo && !isOnboarding && (
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
