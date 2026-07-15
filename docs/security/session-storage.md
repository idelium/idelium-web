# Web session security

The web client sends API requests with credentials enabled so the API can migrate
to an `HttpOnly`, `Secure`, `SameSite=Lax` cookie without another client change.
The current API login contract also returns a bearer token and session identifier,
so the approved compatibility fallback stores them in `sessionStorage`. This limits
persistence to the browser tab but does not protect them from script injection.

The fallback therefore depends on the following controls:

- deploy a restrictive Content Security Policy and do not allow inline or
  untrusted scripts;
- never include credentials, authorization headers, session identifiers, or
  protected response bodies in logs or analytics;
- clear client state on logout and on the first `401` response;
- keep server-side authorization and tenant ownership checks on every request;
- migrate the API to an opaque cookie session, then stop returning bearer tokens
  to browser JavaScript.

Route guards only improve navigation behavior. They are not an authorization
boundary.
