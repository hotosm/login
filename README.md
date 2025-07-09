# HOTOSM Login (SSO)

Centralized login across all HOTOSM applications.

For context behind this decision, see here:
[https://docs.hotosm.org/decisions/0011-sso-auth/](https://docs.hotosm.org/decisions/0011-sso-auth/)

## Rough Plan

- Host centralised SSO at `login.hotosm.org`.
  - We configure OAuth providers here **once** (instead of every tool):
    OSM & Google as primary targets, more if needed.
- Within the [hotosm/ui](https://github.com/hotosm/ui) developer components,
  we include a `<hot-header>` component, that wraps the auth logic for
  integrating with this centralised auth provider.
- Every tool embeds the `hot-header` in the **frontend**, with standardised auth
  across all tools.
  - This means the login flow looks and feel the same.
  - Plus the cookie is shared across tools, meaning if you sign into one tool,
    you are automatically signed in them all.
- Every tool removed any custom logic for authentication from their **backend**.
  Instead, we have a very simple auth check that can determine if the user
  is authenticated to use the API or not.

Example Python:

```python
def validate_session_token(token: str) -> Tuple[bool, Optional[str]]:
    """
    Validates a session token with the Hanko API.
    Returns a tuple of (is_valid: bool, error_message: Optional[str])
    """
    try:
        response = requests.post(
            f"https://login.hotosm.org/sessions/validate",
            json={"session_token": token}
        )

        if response.status_code != 200:
            return False, "Invalid token"

        validation_data = response.json()
        if not validation_data.get("is_valid", False):
            return False, "Invalid token"

        return True, None

    except requests.Timeout:
        return False, "Authentication service timeout"
    except requests.RequestException:
        return False, "Authentication service unavailable"
```
