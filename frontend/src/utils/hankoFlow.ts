// Minimal client for Hanko's flow API, enough to add an email to the signed-in
// account and verify it with the code Hanko emails.
//
// Hanko v2 replaced the old REST endpoints (/passcode/login/initialize and
// friends, now 404) with flows: you POST to /profile, get back a state listing
// the actions you may take, and each action is its own URL. Only the actions
// present in the current state are valid, so we always read them from the
// response instead of building URLs by hand.
//
// The passcode itself never passes through our backend: Hanko sends it and
// Hanko checks it. The backend only reads the result (is this address verified
// for this user?) straight from Hanko's database.

const hankoUrl = import.meta.env.VITE_HANKO_URL || '';

export interface FlowState {
  name: string;
  csrf_token: string;
  actions: Record<string, { href: string } | undefined>;
  payload?: {
    user?: { emails?: { id: string; address: string; is_verified?: boolean }[] };
  };
  error?: { message?: string };
}

class FlowError extends Error {}

async function post(path: string, body: unknown): Promise<FlowState> {
  const response = await fetch(`${hankoUrl}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const state = (await response.json()) as FlowState;
  if (response.status === 401) throw new FlowError('unauthorized');
  return state;
}

/**
 * Start the profile flow. Requires a Hanko session.
 *
 * The flow opens in a `preflight` state that asks what the browser can do
 * before it will show any real action, so this answers that and returns the
 * state that actually lists them.
 */
export async function startProfileFlow(): Promise<FlowState> {
  const preflight = await post('/profile', {});
  if (preflight.name !== 'preflight') return preflight;

  const webauthn = typeof window !== 'undefined' && !!window.PublicKeyCredential;
  return runAction(preflight, 'register_client_capabilities', {
    // Sent as real booleans, not strings: Hanko rejects the wrong type here.
    webauthn_available: webauthn,
    webauthn_conditional_mediation_available: false,
    webauthn_platform_authenticator_available: false,
  } as unknown as Record<string, string>);
}

/** Take one of the actions the current state offers. */
export async function runAction(
  state: FlowState,
  action: string,
  inputs: Record<string, string> = {},
): Promise<FlowState> {
  const href = state.actions?.[action]?.href;
  if (!href) throw new FlowError(`Hanko does not offer "${action}" right now`);
  return post(href, { input_data: inputs, csrf_token: state.csrf_token });
}

function findEmail(state: FlowState, address: string) {
  return state.payload?.user?.emails?.find(
    (email) => email.address.toLowerCase() === address.toLowerCase(),
  );
}

/**
 * Add `address` to the account and ask Hanko to email a code.
 *
 * Returns the state that accepts the code. An address already on the account
 * skips creation and goes straight to verification, so re-entering the same
 * address after a timeout does the sensible thing instead of erroring.
 */
export async function sendVerificationCode(address: string): Promise<FlowState> {
  let state = await startProfileFlow();

  let email = findEmail(state, address);
  if (!email) {
    state = await runAction(state, 'email_create', { email: address });
    if (state.error?.message) throw new FlowError(state.error.message);
    email = findEmail(state, address);
  }
  if (!email) throw new FlowError('Hanko did not return the new address');
  if (email.is_verified) throw new FlowError('already_verified');

  // `email_verify` only shows up once an unverified address exists, which is
  // why the action is read from the state after creating it.
  const verifying = await runAction(state, 'email_verify', { email_id: email.id });
  if (verifying.error?.message) throw new FlowError(verifying.error.message);
  return verifying;
}

/** Submit the code. Throws when Hanko rejects it. */
export async function submitCode(state: FlowState, code: string): Promise<void> {
  const result = await runAction(state, 'verify_passcode', { code });
  if (result.error?.message) throw new FlowError(result.error.message);
}

/** Ask for another code, returning the state that accepts it. */
export async function resendCode(state: FlowState): Promise<FlowState> {
  return runAction(state, 'resend_passcode');
}
