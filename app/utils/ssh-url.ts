const VALID_HOSTNAME = /^[a-zA-Z0-9._-]+$/;
const VALID_IPV6 = /^\[[\da-fA-F:]+\]$/;
const VALID_USERNAME = /^[a-zA-Z0-9._-]*$/;

export type ParsedSSHUrl = {
  hostname: string;
  username: string;
  port: string;
};

export function parseSSHUrl(sshUrl: string): ParsedSSHUrl | null {
  let parsed: URL;
  try {
    parsed = new URL(sshUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'ssh:') {
    return null;
  }

  let hostname = parsed.hostname;
  if (!hostname || (!VALID_HOSTNAME.test(hostname) && !VALID_IPV6.test(hostname))) {
    return null;
  }
  if (VALID_IPV6.test(hostname)) {
    hostname = hostname.slice(1, -1);
  }

  const username = decodeURIComponent(parsed.username);
  if (username && !VALID_USERNAME.test(username)) {
    return null;
  }

  const port = parsed.port;
  if (port && (!/^\d+$/.test(port) || Number(port) > 65535)) {
    return null;
  }

  return {hostname, username, port};
}

export function buildSSHCommand(parsed: ParsedSSHUrl): string {
  let command = 'ssh';
  if (parsed.username) {
    command += ` ${parsed.username}@${parsed.hostname}`;
  } else {
    command += ` ${parsed.hostname}`;
  }
  if (parsed.port) {
    command += ` -p ${parsed.port}`;
  }
  return command;
}
