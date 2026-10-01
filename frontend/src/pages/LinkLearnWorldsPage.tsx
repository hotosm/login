import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import hotLogo from '../assets/images/hot-logo.svg';
import Input from '../components/forms/Input';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Button from '../components/shared/Button';
import ErrorBanner from '../components/shared/ErrorBanner';
import Spinner from '../components/shared/Spinner';
import { useLanguage } from '../contexts/LanguageContext';
import { backendUrl, readError } from '../utils/api';
import {
  FlowState,
  resendCode,
  sendVerificationCode,
  submitCode,
} from '../utils/hankoFlow';

// Shown when someone arrives from learn.hotosm.org and we cannot tell which
// LearnWorlds account is theirs: no link stored, and none of their verified
// addresses is in the school.
//
// Nothing has been created at this point, and nothing will be until they
// answer. That is the whole reason this page exists: LearnWorlds makes a new,
// empty account for an unknown address, and the courses they already have
// would then sit out of reach behind the address they no longer use.
type Step = 'loading' | 'choose' | 'ask' | 'code' | 'done';

// The address belongs to a different HOT account. Hanko refuses to move it,
// which is right, and the way out is to sign in with that account instead —
// so this one gets its own panel rather than a line of red text.
const EMAIL_TAKEN = 'email_taken';

function LinkLearnWorldsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  // Where the LMS wanted them to land; carried through every step.
  const redirectUrl = searchParams.get('redirectUrl') || '';

  const [step, setStep] = useState<Step>('loading');
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
        if (response.ok) {
          const data = await response.json();
          // Already linked (a second tab, a reload): send them straight in.
          if (data.linked) {
            continueToLms();
            return;
          }
          setCurrentEmail(data.emails?.[0] ?? null);
        }
      } catch {
        // Not knowing the address only costs us a nicer sentence.
      }
      setStep('choose');
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
      // Even if the call fails, sending them on beats staying here.
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
      setCode('');
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
        <div className="card px-2 xl:px-8 py-8">
          <LanguageSwitcher />
          <div className="text-center mb-8">
            <img
              src={hotLogo}
              alt="Humanitarian OpenStreetMap Team"
              className="h-12 mx-auto"
            />
          </div>

          <div className="max-w-[360px] mx-auto flex flex-col gap-6">
            {step === 'loading' && (
              <div className="py-6">
                <Spinner />
              </div>
            )}

            {step === 'choose' && (
              <>
                <div className="text-center">
                  <h2 className="text-2xl mb-3">{t('linkChooseTitle')}</h2>
                  <p className="text-base text-hot-gray-700">
                    {t('linkChooseIntro')}
                  </p>
                  {currentEmail && (
                    <p className="text-base font-semibold text-hot-gray-900 break-all mt-1">
                      {currentEmail}
                    </p>
                  )}
                </div>

                {/* Two real options, not an action with an escape hatch: most
                    people who reach this page have nothing to recover, and
                    leading with "recover your courses" worries them. */}
                <div className="flex flex-col gap-2">
                  <Button appearance="outlined" onClick={() => setStep('ask')}>
                    {t('linkYesOtherEmail')}
                  </Button>
                  <Button
                    appearance="accent"
                    onClick={() => continueToLms(true)}
                  >
                    {t('linkNoImNew')}
                  </Button>
                </div>
                <p className="text-sm text-hot-gray-500 text-center">
                  {t('linkOnlyOnce')}
                </p>
              </>
            )}

            {step === 'ask' && (
              <>
                <div className="text-center">
                  <p className="text-sm text-hot-gray-500 mb-1">
                    {t('linkStepOf').replace('{n}', '1')}
                  </p>
                  <h2 className="text-2xl mb-3">{t('linkTitle')}</h2>
                  <p className="text-base text-hot-gray-700">
                    {currentEmail
                      ? t('linkNoCoursesFor')
                      : t('linkNoCoursesGeneric')}
                  </p>
                  {/* The address is the fact this screen turns on, so it is
                      readable instead of buried in a grey sentence. */}
                  {currentEmail && (
                    <p className="text-base font-semibold text-hot-gray-900 break-all mt-1">
                      {currentEmail}
                    </p>
                  )}
                </div>

                {takenEmail ? (
                  // Not a dead end: that address has its own HOT account, and
                  // signing in with it finds the courses without any linking.
                  <div className="bg-amber-50 border border-amber-200 p-5 flex flex-col gap-4">
                    <div className="text-center">
                      <h3 className="text-lg mb-2">
                        {t('linkEmailTakenTitle').replace('{email}', takenEmail)}
                      </h3>
                      <p className="text-sm text-hot-gray-600">
                        {t('linkEmailTaken')}
                      </p>
                    </div>
                    <Button appearance="accent" onClick={signInWithThatAccount}>
                      {t('linkSignInWithThatAccount')}
                    </Button>
                    <Button
                      appearance="plain"
                      onClick={() => setTakenEmail(null)}
                    >
                      {t('linkUseAnotherEmail')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      <p className="text-base text-hot-gray-700">
                        {t('linkAskOtherEmail')}
                      </p>
                      <Input
                        label={t('linkEmailLabel')}
                        type="email"
                        value={otherEmail}
                        onValueChange={setOtherEmail}
                        placeholder={t('linkOtherEmailPlaceholder')}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        appearance="accent"
                        onClick={askForCode}
                        disabled={busy || !otherEmail.trim()}
                      >
                        {busy ? t('linkSearching') : t('linkFindMyProgress')}
                      </Button>
                      <Button
                        appearance="plain"
                        onClick={() => setStep('choose')}
                      >
                        {t('goBack')}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {step === 'code' && (
              <>
                <div className="text-center">
                  <p className="text-sm text-hot-gray-500 mb-1">
                    {t('linkStepOf').replace('{n}', '2')}
                  </p>
                  <h2 className="text-2xl mb-3">{t('linkCodeTitle')}</h2>
                  <p className="text-base text-hot-gray-700">
                    {t('linkSentCodeTo')}
                  </p>
                  <p className="text-base font-semibold text-hot-gray-900 break-all mt-1">
                    {otherEmail}
                  </p>
                  {/* Nobody likes a code with no stated purpose. */}
                  <p className="text-sm text-hot-gray-600 mt-3">
                    {t('linkWhyCode')}
                  </p>
                </div>

                <Input
                  label={t('linkCodeLabel')}
                  type="text"
                  value={code}
                  onValueChange={setCode}
                  placeholder="000000"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    appearance="accent"
                    onClick={confirmCode}
                    disabled={busy || code.trim().length < 6}
                  >
                    {busy ? t('linkVerifying') : t('linkVerify')}
                  </Button>
                  <Button
                    appearance="plain"
                    onClick={async () => {
                      // Codes expire in five minutes, so asking for another
                      // one has to be possible without starting over.
                      if (!flow) return;
                      setError(null);
                      try {
                        setFlow(await resendCode(flow));
                      } catch {
                        setError(t('linkCodeSendFailed'));
                      }
                    }}
                  >
                    {t('linkResendCode')}
                  </Button>
                  <Button
                    appearance="plain"
                    onClick={() => {
                      setStep('ask');
                      setCode('');
                      setError(null);
                    }}
                  >
                    {t('linkUseAnotherEmail')}
                  </Button>
                </div>
              </>
            )}

            {step === 'done' && (
              <>
                <div className="text-center">
                  <h2 className="text-2xl mb-3">{t('linkDoneTitle')}</h2>
                  {/* Concrete numbers are what convince someone that nothing
                      was lost. */}
                  <p className="text-base text-hot-gray-900 font-semibold">
                    {courses
                      ? t('linkDoneCourses').replace('{count}', String(courses))
                      : t('linkDoneGeneric')}
                  </p>
                  <p className="text-sm text-hot-gray-600 mt-2">
                    {t('linkDoneFrom')}
                  </p>
                </div>
                <Button appearance="accent" onClick={() => continueToLms()}>
                  {t('linkGoToCourses')}
                </Button>
              </>
            )}

            {error && <ErrorBanner>{error}</ErrorBanner>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkLearnWorldsPage;
