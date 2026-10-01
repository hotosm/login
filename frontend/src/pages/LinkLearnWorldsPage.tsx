import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import hotLogo from '../assets/images/hot-logo.svg';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { backendUrl, readError } from '../utils/api';
import { FlowState, sendVerificationCode, submitCode } from '../utils/hankoFlow';

// Shown when someone arrives from learn.hotosm.org and we cannot tell which
// LearnWorlds account is theirs: no link stored, and none of their verified
// addresses is in the school.
//
// Nothing has been created at this point, and nothing will be until they
// answer. That is the whole reason this page exists: LearnWorlds makes a new,
// empty account for an unknown address, and the courses they already have
// would then sit out of reach behind the address they no longer use.
type Step = 'ask' | 'code' | 'done';

// The address belongs to a different HOT account. Hanko refuses to move it,
// which is right, and the way out is to sign in with that account instead —
// so this error gets its own button rather than a line of red text.
const EMAIL_TAKEN = 'email_taken';

function LinkLearnWorldsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  // Where the LMS wanted them to land; carried through every step.
  const redirectUrl = searchParams.get('redirectUrl') || '';

  const [step, setStep] = useState<Step>('ask');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [otherEmail, setOtherEmail] = useState('');
  const [code, setCode] = useState('');
  const [flow, setFlow] = useState<FlowState | null>(null);
  const [courses, setCourses] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [takenEmail, setTakenEmail] = useState<string | null>(null);

  // Back to the SSO endpoint: with a link stored it now knows who they are.
  // `new=1` tells it to go ahead and let LearnWorlds create the account.
  const continueToLms = (startFresh = false) => {
    const params = new URLSearchParams({ redirectUrl });
    if (startFresh) params.set('new', '1');
    window.location.href = `${backendUrl}/sso/learnworlds?${params}`;
  };

  // Show which address came up empty, so the question makes sense.
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${backendUrl}/sso/learnworlds/status`, {
          credentials: 'include',
        });
        if (response.status === 401) {
          window.location.href = `/app/?return_to=${encodeURIComponent(window.location.href)}`;
          return;
        }
        if (!response.ok) return;
        const data = await response.json();
        // Already linked (a second tab, a reload): send them straight in.
        if (data.linked) continueToLms();
        setCurrentEmail(data.emails?.[0] ?? null);
      } catch {
        // Not knowing the address only costs us a nicer sentence.
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // End this session and come back to the SSO entry point, which will ask them
  // to sign in — with the account that owns the address they typed.
  const signInWithThatAccount = async () => {
    try {
      await fetch(`${import.meta.env.VITE_HANKO_URL || ''}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Even if the call fails, sending them on is better than staying here.
    }
    continueToLms();
  };

  const askForCode = async () => {
    setError(null);
    setTakenEmail(null);
    setBusy(true);
    try {
      // The code is sent by Hanko, as part of adding the address to their HOT
      // account — not by us, and not because the address exists in the LMS.
      // Tying it to the LMS would let anyone test addresses to find out who
      // studies here.
      setFlow(await sendVerificationCode(otherEmail.trim()));
      setStep('code');
    } catch (err) {
      const reason = err instanceof Error ? err.message : '';
      if (reason === EMAIL_TAKEN) {
        setTakenEmail(otherEmail.trim());
      } else if (reason === 'already_verified') {
        setError(t('linkEmailAlreadyYours'));
      } else {
        // Anything else is ours to look at, so keep what Hanko said rather
        // than flattening every failure into the same sentence.
        setError(
          reason && reason !== 'rejected'
            ? `${t('linkCodeSendFailed')} (${reason})`
            : t('linkCodeSendFailed'),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (!flow) return;
    setError(null);
    setBusy(true);
    try {
      await submitCode(flow, code.trim());
    } catch {
      setError(t('linkCodeWrong'));
      setBusy(false);
      return;
    }

    // Verified: now the backend may look the address up in the school. It
    // re-checks with Hanko that the address really is ours before linking.
    try {
      const response = await fetch(`${backendUrl}/sso/learnworlds/link`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otherEmail.trim() }),
      });
      if (response.status === 404) {
        setError(t('linkNoCoursesForEmail'));
        setStep('ask');
        setCode('');
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      setCourses(data.courses ?? null);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('linkFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-hot-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl px-2 xl:px-8 py-8">
          <LanguageSwitcher />
          <div className="text-center mb-8">
            <img
              src={hotLogo}
              alt="Humanitarian OpenStreetMap Team"
              className="h-12 mx-auto"
            />
          </div>

          <div className="max-w-[360px] mx-auto">
            {step === 'ask' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-hot-gray-900 mb-2">
                    {t('linkTitle')}
                  </h2>
                  <p className="text-sm text-hot-gray-600">
                    {currentEmail
                      ? t('linkNoCoursesFor').replace('{email}', currentEmail)
                      : t('linkNoCoursesGeneric')}
                  </p>
                </div>

                {takenEmail ? (
                  // Not a dead end: that address has its own HOT account, and
                  // signing in with it finds the courses without any linking.
                  <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
                    <p className="text-center text-hot-gray-900 font-bold mb-3">
                      {t('linkEmailTakenTitle').replace('{email}', takenEmail)}
                    </p>
                    <p className="text-center text-sm text-hot-gray-600 mb-4">
                      {t('linkEmailTaken')}
                    </p>
                    <button
                      onClick={signInWithThatAccount}
                      className="btn-primary-hot"
                    >
                      {t('linkSignInWithThatAccount')}
                    </button>
                    <button
                      onClick={() => setTakenEmail(null)}
                      className="btn-back mt-2"
                    >
                      {t('linkUseAnotherEmail')}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-sm text-hot-gray-700 mb-4">
                      {t('linkAskOtherEmail')}
                    </p>
                    <input
                      type="email"
                      value={otherEmail}
                      onChange={(e) => setOtherEmail(e.target.value)}
                      placeholder={t('linkOtherEmailPlaceholder')}
                      className="w-full py-3 px-4 mb-4 text-[15px] border border-hot-gray-300 rounded-md focus:outline-none focus:border-hot-red-600"
                    />
                    <button
                      onClick={askForCode}
                      disabled={busy || !otherEmail.trim()}
                      className="btn-primary-hot disabled:opacity-50"
                    >
                      {busy ? t('linkSearching') : t('linkFindMyProgress')}
                    </button>

                    {/* Always visible: most people here really are new. */}
                    <button
                      onClick={() => continueToLms(true)}
                      className="btn-back mt-3"
                    >
                      {t('linkIAmNew')}
                    </button>
                    <p className="text-xs text-hot-gray-500 text-center mt-4">
                      {t('linkOnlyOnce')}
                    </p>
                  </>
                )}
              </>
            )}

            {step === 'code' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-hot-gray-900 mb-2">
                    {t('linkCodeTitle')}
                  </h2>
                  <p className="text-sm text-hot-gray-600">
                    {t('linkCodeSentTo').replace('{email}', otherEmail)}
                  </p>
                </div>

                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="······"
                  className="w-full py-3 px-4 mb-4 text-lg text-center tracking-[0.5em] border border-hot-gray-300 rounded-md focus:outline-none focus:border-hot-red-600"
                />
                <button
                  onClick={confirmCode}
                  disabled={busy || code.trim().length < 6}
                  className="btn-primary-hot disabled:opacity-50"
                >
                  {busy ? t('linkVerifying') : t('linkVerify')}
                </button>
                <button
                  onClick={() => {
                    setStep('ask');
                    setCode('');
                    setError(null);
                  }}
                  className="btn-back mt-3"
                >
                  {t('linkUseAnotherEmail')}
                </button>
              </>
            )}

            {step === 'done' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-hot-gray-900 mb-2">
                    {t('linkDoneTitle')}
                  </h2>
                  <p className="text-sm text-hot-gray-600">
                    {/* Concrete numbers are what convince someone that
                        nothing was lost. */}
                    {courses
                      ? t('linkDoneCourses').replace('{count}', String(courses))
                      : t('linkDoneGeneric')}
                  </p>
                </div>
                <button onClick={() => continueToLms()} className="btn-primary-hot">
                  {t('continue')}
                </button>
              </>
            )}

            {error && (
              <p className="text-sm text-hot-red-600 mt-4 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkLearnWorldsPage;
