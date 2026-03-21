// TODO: This module is currently unused because no release infrastructure
// exists yet (no GitHub Releases, no release workflow in CI).
// Re-enable by calling updater(window) in app/ui/window.ts when:
// 1. A GitHub Release workflow is configured in CI
// 2. The feed URL format is verified against update.electronjs.org
// 3. Linux update path is handled (update.electronjs.org only supports macOS/Windows)
// See: https://github.com/fdff87554/hyper/issues/7

// Packages
import electron, {app} from 'electron';
import type {BrowserWindow, AutoUpdater} from 'electron';

import retry from 'async-retry';
import ms from 'ms';

// Utilities
import autoUpdaterLinux from './auto-updater-linux';
import {getDefaultProfile} from './config';
import {version} from './package.json';
import {getDecoratedConfig} from './plugins';

const {platform} = process;
const isLinux = platform === 'linux';

const autoUpdater: AutoUpdater = isLinux ? autoUpdaterLinux : electron.autoUpdater;

const getDecoratedConfigWithRetry = async () => {
  return await retry(() => {
    const content = getDecoratedConfig(getDefaultProfile());
    if (!content) {
      throw new Error('No config content loaded');
    }
    return content;
  });
};

const checkForUpdates = async () => {
  const config = await getDecoratedConfigWithRetry();
  if (!config.disableAutoUpdates) {
    autoUpdater.checkForUpdates();
  }
};

let isInit = false;

// TODO: Re-add canary/stable channel distinction when release infrastructure
// supports multiple channels. The buildFeedUrl should differentiate between
// stable and canary feeds (e.g., include/exclude prereleases).
const buildFeedUrl = (currentVersion: string) => {
  const archSuffix = process.arch === 'arm64' || app.runningUnderARM64Translation ? '_arm64' : '';
  return `https://update.electronjs.org/fdff87554/hyper/${isLinux ? 'deb' : platform}${archSuffix}/${currentVersion}`;
};

async function init() {
  autoUpdater.on('error', (err) => {
    console.error('Error fetching updates', `${err.message} (${err.stack})`);
  });

  const feedURL = buildFeedUrl(version);

  autoUpdater.setFeedURL({url: feedURL});

  setTimeout(() => {
    void checkForUpdates();
  }, ms('10s'));

  setInterval(() => {
    void checkForUpdates();
  }, ms('30m'));

  isInit = true;
}

const updater = (win: BrowserWindow) => {
  if (!isInit) {
    void init();
  }

  const {rpc} = win;

  const onupdate = (ev: Event, releaseNotes: string, releaseName: string, date: Date, updateUrl: string) => {
    const releaseUrl = updateUrl || `https://github.com/fdff87554/hyper/releases/tag/${releaseName}`;
    rpc.emit('update available', {releaseNotes, releaseName, releaseUrl, canInstall: !isLinux});
  };

  if (isLinux) {
    autoUpdater.on('update-available', onupdate);
  } else {
    autoUpdater.on('update-downloaded', onupdate);
  }

  rpc.once('quit and install', () => {
    autoUpdater.quitAndInstall();
  });

  win.on('close', () => {
    if (isLinux) {
      autoUpdater.removeListener('update-available', onupdate);
    } else {
      autoUpdater.removeListener('update-downloaded', onupdate);
    }
  });
};

export default updater;
