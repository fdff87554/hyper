const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'ssh:']);

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}
