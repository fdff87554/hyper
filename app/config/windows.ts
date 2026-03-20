import {existsSync} from 'fs';
import {isAbsolute} from 'path';

import type {BrowserWindow} from 'electron';

import Config from 'electron-store';
import {getWorkingDirectoryFromPID} from 'native-process-working-directory';

import type Session from '../session';

export type PersistedTab = {
  cwd: string;
};

export const defaults = {
  windowPosition: [50, 50] as [number, number],
  windowSize: [540, 380] as [number, number]
};

// local storage
const cfg = new Config({defaults});

export function get() {
  const position = cfg.get('windowPosition', defaults.windowPosition);
  const size = cfg.get('windowSize', defaults.windowSize);
  return {position, size};
}

export function getPersistedTabs(): PersistedTab[] {
  return cfg.get('tabs', []) as PersistedTab[];
}

export function recordState(win: BrowserWindow) {
  cfg.set('windowPosition', win.getPosition());
  cfg.set('windowSize', win.getSize());

  // Persist tab CWDs for layout restoration
  const sessions: Map<string, Session> = win.sessions;
  const tabs: PersistedTab[] = [];
  for (const session of sessions.values()) {
    let cwd = '';
    const pid = session.pty?.pid;
    if (pid !== undefined) {
      try {
        cwd = getWorkingDirectoryFromPID(pid) || '';
      } catch {
        // Process may have already exited
      }
    }
    if (cwd && isAbsolute(cwd) && existsSync(cwd)) {
      tabs.push({cwd});
    }
  }
  cfg.set('tabs', tabs);
}

export function clearPersistedTabs() {
  cfg.delete('tabs');
}
