# Plugin Development

## Workflow

### Run Hyper in dev mode
Hyper can be run in dev mode by cloning this repository and following the ["Contribute" section of our README](https://github.com/fdff87554/hyper#contribute).

In dev mode you'll get more output and access to React/Redux dev-tools in Electron.

Be sure to use the `canary` branch.

### Create a dev config file
Copy your config file `hyper.json` to the root of your cloned repository. Hyper, in dev mode, will use this copied config file. That means that you can continue to use your main installation of Hyper with your day-to-day configuration.
After the first run, Hyper, in dev mode, will have created a new `plugins` directory in your repository directory.

### Setup your plugin
Go to your recently created `<repository_root>/plugins/local` directory and create/clone your plugin repo. An even better method on macOS/Linux is to add a symlink to your plugin directory.

Edit your dev config file, and add your plugin name (directory name in your `local` directory) in the `localPlugins` array.
```js
module.exports = {
  config: {
    ...
  },
  plugins: [],
  localPlugins: ['hyper-awesome-plugin'],
  ...
}
```

### Running your plugin
To load, your plugin should expose at least one API method. All possible methods are listed in the [Extension Points](#extension-points) section below and in [`app/plugins/extensions.ts`](app/plugins/extensions.ts).

After launching Hyper in dev mode, run `yarn run app`, it should log that your plugin has been correctly loaded: `Plugin hyper-awesome-plugin (0.1.0) loaded.`. Name and version printed are the ones in your plugins `package.json` file.

When you put a `console.log()` in your plugin code, it will be displayed in the Electron dev-tools, but only if it is located in a renderer method, like component decorators. If it is located in the Electron main process method, like the `onApp` handler, it will be displayed in your terminal where you ran `yarn run app` or in your VSCode console.

## Extension Points

Hyper exposes 38 extension points (plus 1 deprecated alias). They are grouped below by category.

**Source:** [`app/plugins/extensions.ts`](app/plugins/extensions.ts)

### Lifecycle Hooks (Main Process)

| Method | Signature | Description |
|--------|-----------|-------------|
| `onApp` | `(app: Electron.App) => void` | Called when the app is ready. Use for app-level setup. |
| `onWindow` | `(window: BrowserWindow) => void` | Called after a window is created and plugins are loaded. |
| `onWindowClass` | `(window: BrowserWindow) => void` | Called during window construction, before plugins are loaded. |
| `onRendererWindow` | `(window: Window) => void` | Called in the renderer process when the window loads. |
| `onUnload` | `(app: Electron.App) => void` | Called before plugins are cleared from cache (e.g., on reload). |

### Configuration & Environment

| Method | Signature | Description |
|--------|-----------|-------------|
| `decorateConfig` | `(config: configOptions) => configOptions` | Modify the Hyper configuration object. |
| `decorateKeymaps` | `(keymaps: Record<string, string>) => Record<string, string>` | Add or modify keyboard shortcuts. |
| `decorateEnv` | `(env: Record<string, string>) => Record<string, string>` | Modify environment variables passed to shell sessions. |
| `decorateBrowserOptions` | `(options: BrowserWindowConstructorOptions) => BrowserWindowConstructorOptions` | Modify Electron BrowserWindow options. |

### Session Management (Main Process)

| Method | Signature | Description |
|--------|-----------|-------------|
| `decorateSessionClass` | `(Session: typeof Session) => typeof Session` | Wrap the Session class (PTY management). |
| `decorateSessionOptions` | `(options: sessionOptions) => sessionOptions` | Modify options passed to new sessions. |
| `decorateWindowClass` | `(options: {uid: string}) => {uid: string}` | Modify window class options during construction. |

### Component Decorators (Renderer)

These follow the Higher-Order Component (HOC) pattern. Each receives the original component and returns a decorated version.

| Method | Component | Description |
|--------|-----------|-------------|
| `decorateHyper` | `Hyper` | The root application component. |
| `decorateHeader` | `Header` | The window title bar / tab bar header. |
| `decorateTerms` | `Terms` | The container for all terminal groups (tabs). |
| `decorateTermGroup` | `TermGroup` | A single terminal group (can contain splits). |
| `decorateSplitPane` | `SplitPane` | The split pane divider component. |
| `decorateTerm` | `Term` | An individual terminal instance. |
| `decorateTab` | `Tab` | A single tab in the tab bar. |
| `decorateTabs` | `Tabs` | The tab bar container. |
| `decorateNotification` | `Notification` | A single notification. |
| `decorateNotifications` | `Notifications` | The notifications container. |
| `decorateHyperTerm` | `Hyper` | **Deprecated.** Alias for `decorateHyper`. |

### Menu

| Method | Signature | Description |
|--------|-----------|-------------|
| `decorateMenu` | `(menu: MenuItemConstructorOptions[]) => MenuItemConstructorOptions[]` | Modify the application menu template. |

### Props Getters (Renderer)

These modify props passed to components. Return the modified props object.

| Method | Target Component | Description |
|--------|-----------------|-------------|
| `getTermProps` | `Term` | Modify props passed to each terminal instance. |
| `getTabProps` | `Tab` | Modify props passed to each tab. |
| `getTabsProps` | `Tabs` | Modify props passed to the tabs container. |
| `getTermGroupProps` | `TermGroup` | Modify props passed to each terminal group. |

### State/Dispatch Mappers (Renderer, Redux)

These work like Redux `mapStateToProps` and `mapDispatchToProps`. They allow plugins to inject additional state or dispatch functions into components.

#### State Mappers

| Method | Target Component | Description |
|--------|-----------------|-------------|
| `mapTermsState` | `Terms` | Map additional Redux state to Terms props. |
| `mapHeaderState` | `Header` | Map additional Redux state to Header props. |
| `mapNotificationsState` | `Notifications` | Map additional Redux state to Notifications props. |
| `mapHyperTermState` | `Hyper` | Map additional Redux state to Hyper props. |

#### Dispatch Mappers

| Method | Target Component | Description |
|--------|-----------------|-------------|
| `mapTermsDispatch` | `Terms` | Map additional dispatch actions to Terms props. |
| `mapHeaderDispatch` | `Header` | Map additional dispatch actions to Header props. |
| `mapNotificationsDispatch` | `Notifications` | Map additional dispatch actions to Notifications props. |
| `mapHyperTermDispatch` | `Hyper` | Map additional dispatch actions to Hyper props. |

### Redux Middleware & Reducers (Renderer)

| Method | Signature | Description |
|--------|-----------|-------------|
| `middleware` | `Middleware` | Add Redux middleware for intercepting actions. |
| `reduceUI` | `(state, action) => state` | Extend the UI reducer. |
| `reduceSessions` | `(state, action) => state` | Extend the sessions reducer. |
| `reduceTermGroups` | `(state, action) => state` | Extend the term groups reducer. |

## Recipes

### Components
You can decorate almost all Hyper components with a Higher-Order Component (HOC). To understand their architecture, the easiest way is to use React dev-tools to dig in to their hierarchy.

Multiple plugins can decorate the same Hyper component. Thus, `Component` passed as first argument to your decorator function could possibly not be an original Hyper component but a HOC of a previous plugin. If you need to retrieve a reference to a real Hyper component, you can pass down a `onDecorated` handler.
```js
exports.decorateTerms = (Terms, {React}) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.terms = null;
      this.onDecorated = this.onDecorated.bind(this);
    }

    onDecorated(terms) {
      this.terms = terms;
      // Don't forget to propagate it to HOC chain
      if (this.props.onDecorated) this.props.onDecorated(terms);
    }

    render() {
      return React.createElement(
        Terms,
        Object.assign({}, this.props, {
          onDecorated: this.onDecorated
        })
      );
      // Or if you use JSX:
      // <Terms onDecorated={this.onDecorated} />
    }
  }
```
**Note:** You must execute `this.props.onDecorated` to not break the handler chain. Without this, you could break other plugins that decorate the same component.

### Keymaps
If you want to add some keymaps, you need to do 2 things:

#### Declare your key bindings
Use the `decorateKeymaps` API handler to modify existing keymaps and add yours with the following format `command: hotkeys`.
```js
// Adding Keymaps
exports.decorateKeymaps = keymaps => {
  const newKeymaps = {
    'pane:maximize': 'ctrl+shift+m',
    'pane:invert': 'ctrl+shift+i'
  }
  return Object.assign({}, keymaps, newKeymaps);
}
```
The command name can be whatever you want, but the following is better to respect the default naming convention: `<context>:<action>`.
Hotkeys are composed by [Mousetrap supported keys](https://craig.is/killing/mice#keys).

**Prefix feature**: if your command ends with `:prefix`, Hyper will automatically generate numbered variants. For example, `'pane:hide:prefix': 'ctrl+shift'` will generate:
```
{
  'pane:hide:1': 'ctrl+shift+1',
  'pane:hide:2': 'ctrl+shift+2',
  ...
  'pane:hide:8': 'ctrl+shift+8',
  'pane:hide:last': 'ctrl+shift+9'
}
```
`9` is replaced by `last` for convenience when you have more than 9 items.


#### Register a handler for your commands
##### Renderer/Window
Most of time, you'll want to execute some sort of handler in context of the renderer, like dispatching a Redux action.
To trigger these handlers, you'll have to register them with the `registerCommands` Terms method.
```js
this.terms.registerCommands({
  'pane:maximize': e => {
    this.props.onMaximizePane();
    // e parameter is React key event
    e.preventDefault();
  }
})
```

##### Main process
If there is no handler in the renderer for an existing command, an `rpc` message is emitted.
If you want to execute a handler in main process you have to subscribe to a message, for example:
```js
rpc.on('command pane:snapshot', () => {
  /* Awesome snapshot feature */
});
```

### Menu
Your plugin can expose a `decorateMenu` function to modify the Hyper menu template.
Check the [Electron documentation](https://electronjs.org/docs/api/menu-item) for more details about the different menu item types/options available.

Be careful, a click handler will be executed on the main process. If you need to trigger a handler in the render process you need to use an `rpc` message like this:
```js
exports.decorateMenu = (menu) => {
  const isMac = process.platform === 'darwin';
  const menuLabel = isMac ? 'Shell' : 'File';

  return menu.map(menuCategory => {
    if (menuCategory.label !== menuLabel) {
      return menuCategory;
    }
    return {
      ...menuCategory,
      submenu: [
        ...menuCategory.submenu,
        { type: 'separator' },
        {
          label: 'Clear all panes in all tabs',
          accelerator: 'ctrl+shift+y',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.rpc.emit('clear allPanes');
            }
          }
        }
      ]
    };
  });
}

/* Register a rpc handler on renderer side */
exports.decorateTerms = (Terms, { React }) => {
  return class extends React.Component {
    componentDidMount() {
      window.rpc.on('clear allPanes', () => {
        /* Awesome plugin feature */
      })
    }
  }
}
```

### Cursor
If your plugin needs to know cursor position/size, it can decorate the Term component and pass a handler. This handler will be called with each cursor move while passing back all information about the cursor.
```js
exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    onCursorMove (cursorFrame) {
      // Don't forget to propagate it to HOC chain
      if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);

      const { x, y, width, height, col, row } = cursorFrame;
      /* Awesome cursor feature */
    }
  }
}
```

### Require Electron
Hyper doesn't provide a reference to electron. However plugins can directly require electron.

```js
const electron = require('electron')
// or
const { dialog, Menu } = require('electron')
```

This is needed in order to allow show/hide to have proper return of focus.

## Hyper v2 breaking changes
Hyper v2 uses `xterm.js` instead of `hterm`. It means that PTY output renders now in a canvas element, not with a hackable DOM structure.
For example, plugins can't use TermCSS in order to modify text or link styles anymore. It is now required to use available configuration params that are passed down to `xterm.js`.

If your plugin was deeply linked with the `hterm` API (even public methods), it certainly doesn't work anymore.

If your plugin needs some unavailable API to tweak `xterm.js`, please open an issue. We'll be happy to expose some existing `xterm.js` API or implement new ones.
