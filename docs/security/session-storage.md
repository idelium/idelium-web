# Web session security

The web client authenticates through an opaque `HttpOnly`, `Secure`,
`SameSite=Lax` session cookie. Browser JavaScript does not receive or persist a
bearer token or session identifier. The session store contains only a non-sensitive
authentication hint and the selected customer and project identifiers.

The browser session depends on the following controls:

- deploy a restrictive Content Security Policy and do not allow inline or
  untrusted scripts;
- never include credentials, authorization headers, session identifiers, or
  protected response bodies in logs or analytics;
- clear client state on logout and on the first `401` response;
- keep server-side authorization and tenant ownership checks on every request;
- acquire a CSRF cookie before login and send credentials on API requests;
- use `POST` for logout and invalidate the server-side session.

Route guards only improve navigation behavior. They are not an authorization
boundary.
