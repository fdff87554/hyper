import {existsSync} from 'fs';
import {isAbsolute} from 'path';

import type {BrowserWindow} from 'electron';

import Config from 'electron-store';
import {getWorkingDirectoryFromPID} from 'native-process-working-directory';

import type Session from '../session';

export type PersistedTab = {
  cwd: string;
};

type WindowStoreSchema = {
  windowPosition: [number, number];
  windowSize: [number, number];
  tabs: PersistedTab[];
};

export const defaults = {
  windowPosition: [50, 50] as [number, number],
  windowSize: [540, 380] as [number, number]
};

// local storage
const cfg = new Config<WindowStoreSchema>({defaults});

export function get() {
  const position = cfg.get('windowPosition', defaults.windowPosition);
  const size = cfg.get('windowSize', defaults.windowSize);
  return {position, size};
}

export function getPersistedTabs(): PersistedTab[] {
  return cfg.get('tabs', []);
}

export function recordState(win: BrowserWindow) {
  cfg.set('windowPosition', win.getPosition());
  cfg.set('windowSize', win.getSize());

  // Persist tab CWDs for layout restoration.
  // Deduplicate by CWD to avoid split panes creating duplicate tabs on restore.
  const sessions: Map<string, Session> = win.sessions;
  const tabs: PersistedTab[] = [];
  const seenCwds = new Set<string>();
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
    if (cwd && isAbsolute(cwd) && existsSync(cwd) && !seenCwds.has(cwd)) {
      seenCwds.add(cwd);
      tabs.push({cwd});
    }
  }
  cfg.set('tabs', tabs);
}

export function clearPersistedTabs() {
  cfg.delete('tabs');
}
