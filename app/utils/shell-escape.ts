/**
 * Escape a string for safe use in cmd.exe.
 *
 * cmd.exe metacharacters: ^ & | < > % ! "
 * Each is escaped by prefixing with ^, except:
 * - % is doubled (%%)
 * - ! is escaped with ^! (works even with delayed expansion)
 * - " is escaped with ^"
 * The result is wrapped in double quotes after escaping each dangerous
 * character individually, providing both character-level and quote-level
 * protection for cmd.exe argument passing.
 */
export function escapeCmdExe(data: string): string {
  let result = '';
  for (const ch of data) {
    switch (ch) {
      case '%':
        result += '%%';
        break;
      case '^':
      case '&':
      case '|':
      case '<':
      case '>':
      case '!':
      case '"':
        result += `^${ch}`;
        break;
      default:
        result += ch;
        break;
    }
  }
  return `"${result}"`;
}

/**
 * Escape a string for safe use in POSIX shells (bash, zsh, etc).
 *
 * Wraps the string in single quotes and escapes embedded single quotes
 * with the pattern: end quote, escaped quote, start quote ('\'')
 */
export function escapePosix(data: string): string {
  return `'${data.replace(/'/g, `'\\''`)}'`;
}

/**
 * Escape a string for safe use in PowerShell.
 *
 * Wraps the string in single quotes and doubles embedded single quotes.
 */
export function escapePowerShell(data: string): string {
  return `'${data.replace(/'/g, "''")}'`;
}

/**
 * Escape data for a given shell.
 */
export function escapeForShell(data: string, shell: string | undefined | null): string {
  if (!shell) {
    return escapePosix(data);
  }
  if (shell.endsWith('cmd.exe')) {
    return escapeCmdExe(data);
  }
  if (shell.endsWith('pwsh.exe') || shell.endsWith('powershell.exe')) {
    return escapePowerShell(data);
  }
  return escapePosix(data);
}
