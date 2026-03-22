// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/order */
import type Client from '../lib/utils/rpc';

declare global {
  interface Window {
    __rpcId: string;
    rpc: Client;
    focusActiveTerm: (uid?: string) => void;
    profileName: string;
  }

  const snapshotResult: {
    customRequire: {
      (module: string): NodeModule;
      cache: Record<string, {exports: NodeModule}>;
      definitions: Record<string, {exports: any}>;
    };
    setGlobals(global: any, process: any, window: any, document: any, console: any, require: any): void;
  };

  const __non_webpack_require__: NodeRequire;
}

export type ITermGroup = {
  uid: string;
  sessionUid: string | null;
  parentUid: string | null;
  direction: 'HORIZONTAL' | 'VERTICAL' | null;
  sizes: number[] | null;
  children: string[];
};

export type ITermGroups = Record<string, ITermGroup>;

export type ITermState = {
  termGroups: ITermGroups;
  activeSessions: Record<string, string>;
  activeRootGroup: string | null;
};

export type cursorShapes = 'BEAM' | 'UNDERLINE' | 'BLOCK';
import type {FontWeight, IWindowsPty, Terminal} from '@xterm/xterm';
import type {ColorMap, configOptions} from './config';

export type uiState = {
  _lastUpdate: number | null;
  activeUid: string | null;
  activityMarkers: Record<string, boolean>;
  backgroundColor: string;
  bell: 'SOUND' | false;
  bellSoundURL: string | null;
  bellSound: string | null;
  borderColor: string;
  colors: ColorMap;
  cols: number | null;
  copyOnSelect: boolean;
  css: string;
  cursorAccentColor: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: cursorShapes;
  cwd?: string;
  disableLigatures: boolean;
  fontFamily: string;
  fontSize: number;
  fontSizeOverride: null | number;
  fontSmoothingOverride: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  foregroundColor: string;
  fullScreen: boolean;
  imageSupport: boolean;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  maximized: boolean;
  messageDismissable: null | boolean;
  messageText: string | null;
  messageURL: string | null;
  modifierKeys: {
    altIsMeta: boolean;
    cmdIsMeta: boolean;
  };
  notifications: {
    font: boolean;
    message: boolean;
    resize: boolean;
    updates: boolean;
  };
  openAt: Record<string, number>;
  padding: string;
  quickEdit: boolean;
  resizeAt: number;
  rows: number | null;
  screenReaderMode: boolean;
  scrollback: number;
  selectionColor: string;
  showHamburgerMenu: boolean | '';
  showWindowControls: boolean | 'left' | '';
  termCSS: string;
  uiFontFamily: string;
  updateCanInstall: null | boolean;
  updateNotes: string | null;
  updateReleaseUrl: string | null;
  updateVersion: string | null;
  webGLRenderer: boolean;
  webLinksActivationKey: 'ctrl' | 'alt' | 'meta' | 'shift' | '';
  windowsPty?: IWindowsPty;
  defaultProfile: string;
  profiles: configOptions['profiles'];
};

export type session = {
  cleared: boolean;
  cols: number | null;
  cwd?: string;
  pid: number | null;
  resizeAt?: number;
  rows: number | null;
  search: boolean;
  shell: string | null;
  title: string;
  uid: string;
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
  activeUid?: string;
  profile: string;
};

export type sessionState = {
  sessions: Record<string, session>;
  activeUid: string | null;
  write?: {uid: string; data: string};
};

export type ITermGroupReducer = Reducer<ITermState, HyperActions>;

export type IUiReducer = Reducer<uiState, HyperActions>;

export type ISessionReducer = Reducer<sessionState, HyperActions>;

import type {Middleware, Reducer, Dispatch} from '@reduxjs/toolkit';

type PropsMapper<P> = (state: HyperState, ownProps: P) => Record<string, unknown>;
type DispatchMapper<P> = (dispatch: Dispatch, ownProps: P) => Record<string, unknown>;
type PropsGetter<P> = (uid: string, parentProps: Record<string, unknown>, props: P) => P;

export type hyperPlugin = {
  getTabProps: PropsGetter<TabProps>;
  getTabsProps: PropsGetter<TabsProps>;
  getTermGroupProps: PropsGetter<TermGroupOwnProps>;
  getTermProps: PropsGetter<TermProps>;
  mapHeaderDispatch: DispatchMapper<Record<string, unknown>>;
  mapHyperDispatch: DispatchMapper<Record<string, unknown>>;
  mapHyperTermDispatch: DispatchMapper<Record<string, unknown>>;
  mapNotificationsDispatch: DispatchMapper<Record<string, unknown>>;
  mapTermsDispatch: DispatchMapper<Record<string, unknown>>;
  mapHeaderState: PropsMapper<Record<string, unknown>>;
  mapHyperState: PropsMapper<Record<string, unknown>>;
  mapHyperTermState: PropsMapper<Record<string, unknown>>;
  mapNotificationsState: PropsMapper<Record<string, unknown>>;
  mapTermsState: PropsMapper<Record<string, unknown>>;
  middleware: Middleware;
  onRendererUnload: () => void;
  onRendererWindow: (window: Window) => void;
  reduceSessions: ISessionReducer;
  reduceTermGroups: ITermGroupReducer;
  reduceUI: IUiReducer;
};

export type HyperState = {
  ui: uiState;
  sessions: sessionState;
  termGroups: ITermState;
};

import type {UIActions} from './constants/ui';
import type {ConfigActions} from './constants/config';
import type {SessionActions} from './constants/sessions';
import type {NotificationActions} from './constants/notifications';
import type {UpdateActions} from './constants/updater';
import type {TermGroupActions} from './constants/term-groups';
import type {InitActions} from './constants';
import type {TabActions} from './constants/tabs';

export type HyperActions = (
  | UIActions
  | ConfigActions
  | SessionActions
  | NotificationActions
  | UpdateActions
  | TermGroupActions
  | InitActions
  | TabActions
) & {effect?: () => void};

import type configureStore from '../lib/store/configure-store';
export type HyperDispatch = ReturnType<typeof configureStore>['dispatch'];

import type {ReactNode} from 'react';
type extensionProps = Partial<{
  customChildren: ReactNode;
  customChildrenBefore: ReactNode;
  customCSS: string;
  customInnerChildren: ReactNode;
}>;

import type {HeaderConnectedProps} from '../lib/containers/header';
export type HeaderProps = HeaderConnectedProps & extensionProps;

import type {HyperConnectedProps} from '../lib/containers/hyper';
export type HyperProps = HyperConnectedProps & extensionProps;

import type {NotificationsConnectedProps} from '../lib/containers/notifications';
export type NotificationsProps = NotificationsConnectedProps & extensionProps;

import type Terms from '../lib/components/terms';
import type {TermsConnectedProps} from '../lib/containers/terms';
export type TermsProps = TermsConnectedProps & extensionProps & {ref_: (terms: Terms | null) => void};

export type StyleSheetProps = {
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  foregroundColor: string;
} & extensionProps;

export type TabProps = {
  borderColor: string;
  hasActivity: boolean;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onClose: () => void;
  onSelect: () => void;
  text: string;
} & extensionProps;

export type ITab = {
  uid: string;
  title: string;
  isActive: boolean;
  hasActivity: boolean;
};

export type TabsProps = {
  tabs: ITab[];
  borderColor: string;
  backgroundColor: string;
  onChange: (uid: string) => void;
  onClose: (uid: string) => void;
  fullScreen: boolean;
  defaultProfile: string;
  profiles: configOptions['profiles'];
  openNewTab: (profile: string) => void;
} & extensionProps;

export type NotificationProps = {
  backgroundColor: string;
  color?: string;
  dismissAfter?: number;
  onDismiss: () => void;
  text?: string | null;
  userDismissable?: boolean | null;
  userDismissColor?: string;
} & extensionProps;

export type SplitPaneProps = {
  borderColor: string;
  direction: 'horizontal' | 'vertical';
  onResize: (sizes: number[]) => void;
  sizes?: number[] | null;
  children: ReactNode[];
};

import type Term from '../lib/components/term';

export type TermGroupOwnProps = {
  cursorAccentColor?: string;
  fontSmoothing?: string;
  parentProps: TermsProps;
  ref_: (uid: string, term: Term | null) => void;
  termGroup: ITermGroup;
  terms: Record<string, Term | null>;
} & Pick<
  TermsProps,
  | 'activeSession'
  | 'backgroundColor'
  | 'bell'
  | 'bellSound'
  | 'bellSoundURL'
  | 'borderColor'
  | 'colors'
  | 'copyOnSelect'
  | 'cursorBlink'
  | 'cursorColor'
  | 'cursorShape'
  | 'disableLigatures'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'fontWeightBold'
  | 'foregroundColor'
  | 'letterSpacing'
  | 'lineHeight'
  | 'macOptionSelectionMode'
  | 'modifierKeys'
  | 'onActive'
  | 'onContextMenu'
  | 'onCloseSearch'
  | 'onCwd'
  | 'onData'
  | 'onOpenSearch'
  | 'onResize'
  | 'onTitle'
  | 'padding'
  | 'quickEdit'
  | 'screenReaderMode'
  | 'scrollback'
  | 'selectionColor'
  | 'sessions'
  | 'uiFontFamily'
  | 'webGLRenderer'
  | 'webLinksActivationKey'
  | 'windowsPty'
  | 'imageSupport'
>;

import type {TermGroupConnectedProps} from '../lib/components/term-group';
export type TermGroupProps = TermGroupConnectedProps & TermGroupOwnProps;

export type SearchBoxProps = {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  results: {resultIndex: number; resultCount: number} | undefined;
  toggleCaseSensitive: () => void;
  toggleWholeWord: () => void;
  toggleRegex: () => void;
  next: (searchTerm: string) => void;
  prev: (searchTerm: string) => void;
  close: () => void;
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
  selectionColor: string;
  font: string;
};

import type {FitAddon} from '@xterm/addon-fit';
import type {SearchAddon} from '@xterm/addon-search';
export type TermProps = {
  backgroundColor: string;
  bell: 'SOUND' | false;
  bellSound: string | null;
  bellSoundURL: string | null;
  borderColor: string;
  cleared: boolean;
  colors: ColorMap;
  cols: number | null;
  copyOnSelect: boolean;
  cursorAccentColor?: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: cursorShapes;
  disableLigatures: boolean;
  fitAddon: FitAddon | null;
  fontFamily: string;
  fontSize: number;
  fontSmoothing?: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  foregroundColor: string;
  imageSupport: boolean;
  isTermActive: boolean;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  modifierKeys: {altIsMeta: boolean; cmdIsMeta: boolean};
  onActive: () => void;
  onCloseSearch: () => void;
  onContextMenu: (selection: any) => void;
  onCursorMove?: (cursorFrame: {x: number; y: number; width: number; height: number; col: number; row: number}) => void;
  onCwd?: (cwd: string) => void;
  onData: (data: string) => void;
  onOpenSearch: () => void;
  onResize: (cols: number, rows: number) => void;
  onTitle: (title: string) => void;
  padding: string;
  quickEdit: boolean;
  rows: number | null;
  screenReaderMode: boolean;
  scrollback: number;
  search: boolean;
  searchAddon: SearchAddon | null;
  selectionColor: string;
  term: Terminal | null;
  uid: string;
  uiFontFamily: string;
  webGLRenderer: boolean;
  webLinksActivationKey: 'ctrl' | 'alt' | 'meta' | 'shift' | '';
  windowsPty?: IWindowsPty;
  ref_: (uid: string, term: Term | null) => void;
} & extensionProps;

// Utility types

export type Assignable<T, U> = {[k in keyof U]: k extends keyof T ? T[k] : U[k]} & Partial<T>;
