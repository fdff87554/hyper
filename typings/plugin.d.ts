import type {App, BrowserWindow, MenuItemConstructorOptions} from 'electron';

import type {configOptions} from './config';

export interface MainProcessPlugin {
  _name: string;
  _version?: string;

  // Lifecycle hooks
  onApp?: (app: App) => void;
  onWindow?: (win: BrowserWindow) => void;
  onWindowClass?: (win: BrowserWindow) => void;
  onUnload?: (app: App) => void;

  // Decorators
  decorateConfig?: (config: configOptions) => configOptions;
  decorateMenu?: (menu: MenuItemConstructorOptions[]) => MenuItemConstructorOptions[];
  decorateKeymaps?: (keymaps: Record<string, string[]>) => Record<string, string[]>;
  decorateEnv?: (env: Record<string, string>) => Record<string, string>;
  decorateBrowserOptions?: <T>(opts: T) => T;
  decorateWindowClass?: <T>(opts: T) => T;
  decorateSessionOptions?: <T>(opts: T) => T;
  decorateSessionClass?: <T>(cls: T) => T;

  // Deprecated
  extendKeymaps?: unknown;

  // Allow arbitrary extension methods for forward compatibility
  [key: string]: unknown;
}
