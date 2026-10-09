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

// The state that accepts the emailed code. Creating an address jumps straight
// here, which the docs do not mention: they describe email_create returning to
// profile_init, and that only happens when verification is not required.
const PASSCODE_STATE = 'passcode_confirmation';

export interface FlowState {
  name: string;
  csrf_token: string;
  actions: Record<
    string,
    | {
        href: string;
        inputs?: Record<string, { error?: { message?: string } } | undefined>;
      }
    | undefined
  >;
  payload?: {
    user?: { emails?: { id: string; address: string; is_verified?: boolean }[] };
  };
  error?: { code?: string; message?: string };
}

export class FlowError extends Error {}

/**
 * Whatever Hanko says went wrong, from the state or from the field itself.
 *
 * A rejected value comes back as HTTP 200 with the complaint attached to the
 * input, not as an error response, so this looks in both places.
 */
function errorIn(state: FlowState, action?: string): string | null {
  const fromState = state.error?.message || state.error?.code;
  if (fromState) return fromState;
  const inputs = action ? state.actions?.[action]?.inputs : undefined;
  for (const input of Object.values(inputs || {})) {
    if (input?.error?.message) return input.error.message;
  }
  return null;
}

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
  const state = await startProfileFlow();
  const existing = findEmail(state, address);

  if (existing?.is_verified) throw new FlowError('already_verified');

  // An address already on the account but unverified: ask for a code for it.
  // A new one: creating it sends the code on its own, because the server
  // requires verification. Either way we end up in the state that takes the
  // code — and with a new address Hanko answers with an empty payload, so the
  // state name is what tells us it worked, not the address coming back.
  const next = existing
    ? await runAction(state, 'email_verify', { email_id: existing.id })
    : await runAction(state, 'email_create', { email: address });

  if (next.name === PASSCODE_STATE) return next;

  // Did not reach it: surface what Hanko said, and only blame a taken address
  // when it actually says so.
  const complaint = errorIn(next, existing ? 'email_verify' : 'email_create');
  throw new FlowError(
    complaint && /exist|taken|already|in use/i.test(complaint)
      ? 'email_taken'
      : complaint || 'rejected',
  );
}

/**
 * Submit the code. Throws when Hanko rejects it.
 *
 * A wrong or expired code keeps the flow in the passcode state with the
 * complaint on the field, so staying there is the failure, not an error reply.
 */
export async function submitCode(state: FlowState, code: string): Promise<void> {
  const result = await runAction(state, 'verify_passcode', { code });
  if (result.name === PASSCODE_STATE || errorIn(result, 'verify_passcode')) {
    throw new FlowError(errorIn(result, 'verify_passcode') || 'wrong_code');
  }
}

/** Ask for another code, returning the state that accepts the new one. */
export async function resendCode(state: FlowState): Promise<FlowState> {
  const result = await runAction(state, 'resend_passcode');
  if (result.name !== PASSCODE_STATE) throw new FlowError('resend_failed');
  return result;
}
