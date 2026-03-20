# Electron Upgrade Plan: 22 -> 28 -> 32+

## Current State

- Electron 22.3.25 (EOL October 2023, Chromium 108, Node.js 16)
- electron-mksnapshot 29.3.0 (version mismatch with Electron 22)
- electron-builder ^24.13.3
- nodeIntegration: true, contextIsolation: false

## Compatibility Analysis

### APIs NOT affected (safe for upgrade)

Most Electron breaking changes between 22-32 do not affect Hyper:
- No usage of removed `scroll-touch-*` events (23)
- No usage of `setTrafficLightPosition()` (removed 28)
- No usage of `ipcRenderer.sendTo()` (removed 28)
- No usage of `BrowserView` (deprecated 30)
- No usage of `getPrinters()` (removed 27)
- Already using `render-process-gone` (replacing removed `renderer-process-crashed` in 29)
- No usage of WebSQL or navigation history APIs

### Blockers

1. **nodeIntegration + contextIsolation**: The plugin system requires `nodeIntegration: true`
   because plugins use `window.require()` in the renderer. Changing this would break
   every existing Hyper plugin.

2. **V8 Snapshots**: electron-mksnapshot must match the Electron major version exactly.
   The snapshot generation script (bin/mk-snapshot.js) may need rework.

3. **Native Modules**: node-pty and native-process-working-directory need rebuilding
   for each Electron version.

4. **Clipboard access**: Direct clipboard usage in renderer (term.tsx, paste.ts) works
   with nodeIntegration but violates security best practices.

## Recommended Upgrade Path

### Step 1: Fix electron-mksnapshot version (immediate)
- Update electron-mksnapshot to match current Electron 22
- Verify V8 snapshot generation works correctly

### Step 2: Upgrade to Electron 28 (LTS)
- Node.js 18 runtime (matches mise.toml better than Node 16)
- Update electron-builder to ^25.x
- Rebuild native modules
- Test V8 snapshot generation with mksnapshot 28.x
- Keep nodeIntegration: true for now (plugin compatibility)

### Step 3: Upgrade to Electron 32+ (current stable)
- Further native module rebuilds
- Update electron-builder if needed
- Consider enabling contextIsolation: true with contextBridge

### Step 4: Security architecture (long-term)
- Enable contextIsolation: true
- Move clipboard/shell access to preload via contextBridge
- Convert synchronous IPC to async
- This will break existing plugins - needs a migration guide

## Files Requiring Changes

| File | Change |
|------|--------|
| package.json | Electron version, electron-mksnapshot, electron-builder |
| app/ui/window.ts:50-54 | webPreferences (contextIsolation in Step 3) |
| app/preload.ts | Expand contextBridge API |
| lib/components/term.tsx | Move clipboard to preload API (Step 4) |
| lib/utils/paste.ts | Move clipboard to preload API (Step 4) |
| bin/mk-snapshot.js | Update for new mksnapshot version |

## Risk Assessment

- **Step 1**: Low risk, isolated change
- **Step 2**: Medium risk, major version jump but few API changes affect us
- **Step 3**: Medium risk, similar to Step 2
- **Step 4**: High risk, breaks plugin ecosystem, requires migration period
