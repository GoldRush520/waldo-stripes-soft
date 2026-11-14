/** "Share on X" link for a finished run (pure; no DOM access). */
import { formatRunTime } from '../../shared/leaderboard';
import { isLocalHost } from '../dev/debugParams';

/** The page address without query or fragment, so debug switches and seeds are never shared. */
export function cleanPageUrl(href: string): string {
  try {
    const url = new URL(href);
    return `${url.origin}${url.pathname}`;
  } catch {
    return href;
  }
}

export function shareText(timeMs: number): string {
  return `I found Waldo in ${formatRunTime(timeMs)} in Waldo Stripes Soft. Can you beat my time?`;
}

/** endings of names that only exist on a home or office network */
const PRIVATE_SUFFIXES = ['.local', '.internal', '.lan', '.home', '.home.arpa', '.localdomain'];
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/;

/** An IPv4 address written in IPv6 form ("::ffff:c0a8:105", "::ffff:192.168.1.5") as plain IPv4, else null. */
function mappedIpv4(host: string): string | null {
  const dotted = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(host);
  if (dotted) return dotted[1] ?? null;
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(host);
  if (!hex) return null;
  const high = Number.parseInt(hex[1] ?? '', 16);
  const low = Number.parseInt(hex[2] ?? '', 16);
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

/** Loopback, "this network", the private ranges, link-local and carrier-shared addresses. */
function isPrivateIpv4(address: string): boolean {
  const parts = IPV4.exec(address);
  if (!parts) return false;
  const a = Number(parts[1]);
  const b = Number(parts[2]);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

/**
 * True for a host name only this machine or its own network can open: loopback, the private and
 * link-local address ranges, and names without a public domain. Such an address means nothing to
 * anyone else and should not end up in a public post.
 */
export function isPrivateAddress(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (isLocalHost(host) || PRIVATE_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  const v4 = mappedIpv4(host) ?? host;
  if (IPV4.test(v4)) return isPrivateIpv4(v4);
  /* IPv6: link-local (fe80::/10) and unique local (fc00::/7) */
  if (host.includes(':')) return /^fe[89ab]/.test(host) || /^f[cd]/.test(host);
  /* a bare machine name ("my-laptop") */
  return !host.includes('.');
}

/** True when the page is served from an address nobody outside could open. */
function onThisMachine(href: string): boolean {
  try {
    return isPrivateAddress(new URL(href).hostname);
  } catch {
    return false;
  }
}

/**
 * X's post composer, pre-filled with the time. A link back to the game is added only when the
 * game is on an address other people can reach (never this machine's or a home network's).
 */
export function shareUrl(timeMs: number, pageHref: string): string {
  const text = shareText(timeMs);
  const fields: Record<string, string> = onThisMachine(pageHref) ? { text } : { text, url: cleanPageUrl(pageHref) };
  const params = new URLSearchParams(fields);
  return `https://x.com/intent/post?${params.toString()}`;
}
