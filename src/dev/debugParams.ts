/**
 * Debugging switches in the page address (?dev, ?seed=, ?quality=, ?noStatics=1 ...) expose where
 * Waldo is, replay a known scene or strip the town away. They are for development and measurement,
 * so they only take effect on your own machine; if the game is ever put on a public host they are
 * all ignored there.
 */

/** True for the addresses a local dev or preview server is reached at. */
export function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]' || host.endsWith('.localhost');
}

/** The switches that apply for this address: the real query on a local host, none anywhere else. */
export function debugParams(location: { readonly hostname: string; readonly search: string }): URLSearchParams {
  return isLocalHost(location.hostname) ? new URLSearchParams(location.search) : new URLSearchParams();
}
