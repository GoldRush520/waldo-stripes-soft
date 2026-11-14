/**
 * Was a request sent by the game's own page?
 *
 * A server on this machine can be reached by any website that happens to be open in the same
 * browser. Requests that change something are therefore only accepted from the page this server
 * itself serves, or from a tool that is not a browser at all (it sends no origin; whoever runs it
 * already has this machine).
 */
type HeaderValue = string | readonly string[] | undefined;

export interface OriginHeaders {
  readonly host?: HeaderValue;
  readonly origin?: HeaderValue;
  readonly 'sec-fetch-site'?: HeaderValue;
}

export function fromOwnPage(headers: OriginHeaders): boolean {
  /* what the browser itself says about where the request came from */
  const site = headers['sec-fetch-site'];
  if (site !== undefined && site !== 'same-origin' && site !== 'none') return false;
  const { origin, host } = headers;
  if (origin === undefined) return true;
  if (typeof origin !== 'string' || typeof host !== 'string') return false;
  try {
    return new URL(origin).host === host.toLowerCase();
  } catch {
    /* "null" (a sandboxed frame, a local file) or anything else that is not an address */
    return false;
  }
}
