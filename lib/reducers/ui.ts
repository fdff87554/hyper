import {release} from 'os';

import {produce} from 'immer';

import {CONFIG_LOAD, CONFIG_RELOAD} from '../../typings/constants/config';
import {NOTIFICATION_MESSAGE, NOTIFICATION_DISMISS} from '../../typings/constants/notifications';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_SET_ACTIVE,
  SESSION_SET_CWD
} from '../../typings/constants/sessions';
import {
  UI_FONT_SIZE_SET,
  UI_FONT_SIZE_RESET,
  UI_FONT_SMOOTHING_SET,
  UI_WINDOW_MAXIMIZE,
  UI_WINDOW_UNMAXIMIZE,
  UI_WINDOW_GEOMETRY_CHANGED,
  UI_ENTER_FULLSCREEN,
  UI_LEAVE_FULLSCREEN
} from '../../typings/constants/ui';
import {UPDATE_AVAILABLE} from '../../typings/constants/updater';
import type {uiState, IUiReducer} from '../../typings/hyper';
import {decorateUIReducer} from '../utils/plugins';

const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(navigator.platform) || process.platform === 'win32';

const allowedCursorShapes = new Set(['BEAM', 'BLOCK', 'UNDERLINE']);
const allowedCursorBlinkValues = new Set([true, false]);
const allowedBells = new Set(['SOUND', 'false', false]);
const allowedHamburgerMenuValues = new Set([true, false, ''] as const);
const allowedWindowControlsValues = new Set([true, false, 'left']);

// Populate `config-default.js` from this :)
const initial: uiState = {
  cols: null,
  rows: null,
  scrollback: 1000,
  activeUid: null,
  cursorColor: '#F81CE5',
  cursorAccentColor: '#000',
  cursorShape: 'BLOCK',
  cursorBlink: false,
  borderColor: '#333',
  selectionColor: 'rgba(248,28,229,0.3)',
  fontSize: 12,
  padding: '12px 14px',
  fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
  uiFontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSizeOverride: null,
  fontSmoothingOverride: 'antialiased',
  fontWeight: 'normal',
  fontWeightBold: 'bold',
  imageSupport: true,
  lineHeight: 1,
  letterSpacing: 0,
  css: '',
  termCSS: '',
  openAt: {},
  resizeAt: 0,
  colors: {
    black: '#000000',
    red: '#C51E14',
    green: '#1DC121',
    yellow: '#C7C329',
    blue: '#0A2FC4',
    magenta: '#C839C5',
    cyan: '#20C5C6',
    white: '#C7C7C7',
    lightBlack: '#686868',
    lightRed: '#FD6F6B',
    lightGreen: '#67F86F',
    lightYellow: '#FFFA72',
    lightBlue: '#6A76FB',
    lightMagenta: '#FD7CFC',
    lightCyan: '#68FDFE',
    lightWhite: '#FFFFFF'
  },
  activityMarkers: {},
  notifications: {
    font: false,
    resize: false,
    updates: false,
    message: false
  },
  fullScreen: false,
  foregroundColor: '#fff',
  backgroundColor: '#000',
  maximized: false,
  updateVersion: null,
  updateNotes: null,
  updateReleaseUrl: null,
  updateCanInstall: null,
  _lastUpdate: null,
  messageText: null,
  messageURL: null,
  messageDismissable: null,
  bell: 'SOUND',
  bellSoundURL: null, // directly relates to the value in the configuration file
  bellSound: null, // A base64 encoded binary string representation of the audio data from the bellSoundURL
  copyOnSelect: false,
  modifierKeys: {
    altIsMeta: false,
    cmdIsMeta: false
  },
  showHamburgerMenu: '',
  showWindowControls: '',
  quickEdit: false,
  webGLRenderer: true,
  webLinksActivationKey: '',
  macOptionSelectionMode: 'vertical',
  disableLigatures: true,
  screenReaderMode: false,
  defaultProfile: '',
  profiles: []
};

const reducer: IUiReducer = (state = initial, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case CONFIG_LOAD:
      case CONFIG_RELOAD: {
        const {config, now} = action;

        // unset the user font size override if the
        // font size changed from the config
        if (config.scrollback) {
          draft.scrollback = config.scrollback;
        }

        if (state.fontSizeOverride && config.fontSize !== state.fontSize) {
          draft.fontSizeOverride = null;
        }

        if (config.fontSize) {
          draft.fontSize = config.fontSize;
        }

        if (config.fontFamily) {
          draft.fontFamily = config.fontFamily;
        }

        if (config.uiFontFamily) {
          draft.uiFontFamily = config.uiFontFamily;
        }

        if (config.fontWeight) {
          draft.fontWeight = config.fontWeight;
        }

        if (config.fontWeightBold) {
          draft.fontWeightBold = config.fontWeightBold;
        }

        if (Number.isFinite(config.lineHeight)) {
          draft.lineHeight = config.lineHeight;
        }

        if (Number.isFinite(config.letterSpacing)) {
          draft.letterSpacing = config.letterSpacing;
        }

        if (config.cursorColor) {
          draft.cursorColor = config.cursorColor;
        }

        if (config.cursorAccentColor) {
          draft.cursorAccentColor = config.cursorAccentColor;
        }

        if (allowedCursorShapes.has(config.cursorShape)) {
          draft.cursorShape = config.cursorShape;
        }

        if (allowedCursorBlinkValues.has(config.cursorBlink)) {
          draft.cursorBlink = config.cursorBlink;
        }

        if (config.borderColor) {
          draft.borderColor = config.borderColor;
        }

        if (config.selectionColor) {
          draft.selectionColor = config.selectionColor;
        }

        if (typeof config.padding !== 'undefined' && config.padding !== null) {
          draft.padding = config.padding;
        }

        if (config.foregroundColor) {
          draft.foregroundColor = config.foregroundColor;
        }

        if (config.backgroundColor) {
          draft.backgroundColor = config.backgroundColor;
        }

        if (config.css || config.css === '') {
          draft.css = config.css;
        }

        if (config.termCSS) {
          draft.termCSS = config.termCSS;
        }

        if (allowedBells.has(config.bell)) {
          draft.bell = (config.bell as any) === 'false' ? false : config.bell;
        }

        if (config.bellSoundURL !== state.bellSoundURL) {
          draft.bellSoundURL = config.bellSoundURL || initial.bellSoundURL;
        }

        if (config.bellSound !== state.bellSound) {
          draft.bellSound = config.bellSound || initial.bellSound;
        }

        if (typeof config.copyOnSelect !== 'undefined' && config.copyOnSelect !== null) {
          draft.copyOnSelect = config.copyOnSelect;
        }

        if (config.colors) {
          if (JSON.stringify(state.colors) !== JSON.stringify(config.colors)) {
            draft.colors = config.colors;
          }
        }

        if (config.modifierKeys) {
          draft.modifierKeys = config.modifierKeys;
        }

        if (allowedHamburgerMenuValues.has(config.showHamburgerMenu)) {
          draft.showHamburgerMenu = config.showHamburgerMenu;
        }

        if (allowedWindowControlsValues.has(config.showWindowControls)) {
          draft.showWindowControls = config.showWindowControls;
        }

        if (process.platform === 'win32' && (config.quickEdit === undefined || config.quickEdit === null)) {
          draft.quickEdit = true;
        } else if (typeof config.quickEdit !== 'undefined' && config.quickEdit !== null) {
          draft.quickEdit = config.quickEdit;
        }

        if (config.webGLRenderer !== undefined) {
          draft.webGLRenderer = config.webGLRenderer;
        }

        if (config.webLinksActivationKey !== undefined) {
          draft.webLinksActivationKey = config.webLinksActivationKey;
        }

        if (config.macOptionSelectionMode) {
          draft.macOptionSelectionMode = config.macOptionSelectionMode;
        }

        if (config.disableLigatures !== undefined) {
          draft.disableLigatures = config.disableLigatures;
        }

        if (config.screenReaderMode !== undefined) {
          draft.screenReaderMode = config.screenReaderMode;
        }

        const buildNumber = parseInt(release().split('.').at(-1) || '0', 10);
        if (isWindows && !Number.isNaN(buildNumber) && buildNumber > 0) {
          const useConpty = typeof config.useConpty === 'boolean' ? config.useConpty : buildNumber >= 18309;
          draft.windowsPty = {
            backend: useConpty ? 'conpty' : 'winpty',
            buildNumber
          };
        }

        if (config.imageSupport !== undefined) {
          draft.imageSupport = config.imageSupport;
        }

        if (config.defaultProfile !== undefined) {
          draft.defaultProfile = config.defaultProfile;
        }

        if (config.profiles !== undefined) {
          draft.profiles = config.profiles;
        }

        draft._lastUpdate = now ?? null;
        break;
      }

      case SESSION_ADD:
        draft.activeUid = action.uid;
        draft.openAt[action.uid] = action.now;
        break;

      case SESSION_RESIZE:
        // only care about the sizes
        // of standalone terms (i.e. not splits):
        if (!action.isStandaloneTerm) {
          break;
        }

        draft.rows = action.rows;
        draft.cols = action.cols;
        draft.resizeAt = action.now;
        break;

      case SESSION_PTY_EXIT:
        delete draft.openAt[action.uid];
        delete draft.activityMarkers[action.uid];
        break;

      case SESSION_SET_ACTIVE:
        draft.activeUid = action.uid;
        draft.activityMarkers[action.uid] = false;
        break;

      case SESSION_PTY_DATA:
        // ignore activity markers for current tab
        if (action.uid === state.activeUid) {
          break;
        }

        // if first data events after open, ignore
        if (action.now - state.openAt[action.uid] < 1000) {
          break;
        }

        // ignore activity markers that are within
        // proximity of a resize event, since we
        // expect to get data packets from the resize
        // of the ptys as a result
        if (!state.resizeAt || action.now - state.resizeAt > 1000) {
          draft.activityMarkers[action.uid] = true;
        }
        break;

      case SESSION_SET_CWD:
        if (action.uid === state.activeUid) {
          draft.cwd = action.cwd;
        }
        break;

      case UI_FONT_SIZE_SET:
        draft.fontSizeOverride = action.value;
        break;

      case UI_FONT_SIZE_RESET:
        draft.fontSizeOverride = null;
        break;

      case UI_FONT_SMOOTHING_SET:
        draft.fontSmoothingOverride = action.fontSmoothing;
        break;

      case UI_WINDOW_MAXIMIZE:
        draft.maximized = true;
        break;

      case UI_WINDOW_UNMAXIMIZE:
        draft.maximized = false;
        break;

      case UI_WINDOW_GEOMETRY_CHANGED: {
        const isMax = action.isMaximized;
        if (state.maximized !== isMax) {
          draft.maximized = isMax;
        }
        break;
      }

      case NOTIFICATION_DISMISS:
        draft.notifications[action.id as keyof typeof state.notifications] = false;
        break;

      case NOTIFICATION_MESSAGE:
        draft.messageText = action.text;
        draft.messageURL = action.url;
        draft.messageDismissable = action.dismissable === true;
        break;

      case UPDATE_AVAILABLE:
        draft.updateVersion = action.version;
        draft.updateNotes = action.notes || '';
        draft.updateReleaseUrl = action.releaseUrl;
        draft.updateCanInstall = !!action.canInstall;
        break;

      case UI_ENTER_FULLSCREEN:
        draft.fullScreen = true;
        break;

      case UI_LEAVE_FULLSCREEN:
        draft.fullScreen = false;
        break;
    }

    // Show a notification if any of the font size values have changed
    if (CONFIG_LOAD !== action.type) {
      if (draft.fontSize !== state.fontSize || draft.fontSizeOverride !== state.fontSizeOverride) {
        draft.notifications.font = true;
      }
    }

    if (state.cols !== null && state.rows !== null && (state.rows !== draft.rows || state.cols !== draft.cols)) {
      draft.notifications.resize = true;
    }

    if (state.messageText !== draft.messageText || state.messageURL !== draft.messageURL) {
      draft.notifications.message = true;
    }

    if (state.updateVersion !== draft.updateVersion) {
      draft.notifications.updates = true;
    }
  });
};

export default decorateUIReducer(reducer);
