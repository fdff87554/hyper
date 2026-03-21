# Development Guidelines

## 專案資訊

- **專案名稱**: Hyper
- **專案簡述**: 基於 Web 技術的現代終端模擬器，fork 自 Vercel Hyper 進行持續維護與安全更新
- **技術棧**: TypeScript 5.4.5, React 18.2.0, Redux 4.2.1, Electron 22.3.25, xterm.js 5.5.0, styled-jsx 5.1.2, Webpack 5.91.0, Babel 7.24.4, node-pty
- **專案結構**:

```
app/           # Electron main process (config, plugins, sessions, menus, RPC)
  config/      # Configuration system (schema, migration, initialization)
  keymaps/     # Keyboard shortcut mappings
  menus/       # Electron menu definitions
  plugins/     # Plugin loading & management
  ui/          # React components for settings UI
  utils/       # Main process utilities
lib/           # React renderer process (UI)
  actions/     # Redux action creators
  components/  # React UI components (terminal, tabs, header, etc.)
  containers/  # Redux-connected components
  reducers/    # Redux state reducers
  store/       # Redux store configuration
  utils/       # Renderer utilities
cli/           # CLI for plugin management (install, uninstall, list, search)
typings/       # TypeScript type definitions
test/          # Unit tests (AVA) and E2E tests (Playwright)
bin/           # Build scripts (notarization, version bump)
build/         # Platform-specific build assets (icons, entitlements)
```

## 常用指令

- `yarn build`: 建置專案（Webpack + tsc）
- `yarn test`: 執行測試（lint + unit tests）
- `yarn lint`: 執行 linting（ESLint）
- `yarn lint --fix`: 自動修正 linting 問題並格式化程式碼（ESLint + Prettier）
- `yarn dev`: Watch mode 開發（Webpack + TypeScript compiler 並行）
- `yarn app`: 透過 electronmon 執行 Electron app（搭配 `yarn dev` 使用）
- `yarn test:unit`: AVA 單元測試
- `yarn test:unit:watch`: AVA watch mode
- `yarn test:e2e`: Playwright E2E 測試
- `yarn dist`: Distribution build（electron-builder）
- `yarn clean`: 清除 node_modules 與 renderer 編譯產出（`node_modules/`, `app/node_modules/`, `app/renderer/`）
- `yarn generate-schema`: 從 TypeScript config types 產生 JSON schema

## 環境管理

- **工具管理**: mise（配置檔: `mise.toml`）
- **初始化**: `mise install && yarn install`
- **虛擬環境**: N/A（Node.js 專案，JS 生態系工具由 Yarn devDependencies 管理）

### 原則

- Node.js runtime 透過 mise 管理，不使用系統全域安裝
- mise.toml 必須 commit 至版本控制，作為環境的 single source of truth
- JS 生態系工具（ESLint、Prettier、TypeScript 等）由 Yarn 管理，不重複加入 mise

## 程式碼品質

- 遵循 SOLID、DRY、KISS 原則
- 優先使用 Composition over Inheritance
- 依賴抽象而非具體實作（Dependency Inversion）
- 配置使用設定檔或環境變數，不 hardcode

### Functions

- 函式保持短小，單一函式不超過 50 行，只做一件事
- 函式內維持同一抽象層級（Levels of Abstraction），不混合高低層級操作
- 函式參數越少越好，0-2 個為佳；超過 3 個應封裝為物件或使用 Options Pattern
- 函式不產生隱藏的 Side Effects，不修改傳入參數或全域狀態
- 遵循 Command Query Separation：查詢不改變狀態，命令不返回資料
- 用 Polymorphism 替代重複的 switch/if-else 條件分支鏈
- 使用 Early Return，避免深層巢狀
- 不使用 Magic Number，提取為具名常數
- Error Handling 邏輯獨立處理，不與業務邏輯混寫在同一函式中
- 驗證所有輸入參數，處理邊界情況與異常狀況

### Writing Process

- 先寫出能正確運作的實作，再逐步重構至符合以上品質標準
- 重構時保持功能不變，每次只改善一個面向

## 資安要求

- 不在程式碼中 hardcode 敏感資訊（密碼、API Key、Token），測試用假資料除外
- 所有使用者輸入需進行 Input Validation & Sanitization
- 遵循 Principle of Least Privilege
- 不暴露敏感的錯誤訊息與 stack trace
- 依賴套件注意已知漏洞，保持更新
- 日誌不得包含敏感資訊

## 工作流程

- **IMPORTANT**: 除非是非常簡單的小修改，所有變更必須建立新 branch，完成後提交 Pull Request 供 Code Review
- **IMPORTANT**: 同一次任務的所有變更，整合在同一個 Branch 與同一個 PR 中完成
- 每個 commit 對應一個邏輯上獨立的變更（Atomic Commits），撰寫清晰的 commit message
- 所有調整需先與使用者確認後再執行，不接受臨時性的方案
- 完成變動後執行 formatter 確保風格一致

### 執行變更前

- 理解相關模組的現有架構與設計決策
- 確認變更不會破壞現有功能與測試
- 評估變更的影響範圍

### Code Review

- 確認程式碼符合專案架構與本文件的品質標準
- 檢查邏輯正確性、邊界條件、效能與資安風險
- 檢查是否有重複程式碼可抽取
- PR 描述需清楚說明變更目的與影響範圍
- Breaking Changes 需明確標註，相關文件同步更新

## 專案特殊規範

- Electron dual-process 架構：main process (`/app`) 負責 config、plugins、sessions、menus、RPC；renderer process (`/lib`) 負責 React UI
- Plugin 系統使用 decorator pattern（`decorateConfig`, `decorateMenu`, `decorateKeymaps`, `decorateComponent`）
- IPC 通訊透過 typed RPC（`app/rpc.ts` <-> `lib/rpc.ts`, `lib/utils/rpc.ts`）
- Redux 狀態管理（actions / reducers / store pattern in `/lib`）
- styled-jsx 用於 React components 的 scoped CSS
- Package manager: Yarn (classic)，不使用 npm
- Config schema 自動從 TypeScript types 產生（`yarn generate-schema`）
- 進行 Coding / Review 時，優先透過 context7 MCP 查詢相關文件與 Best Practice
- 必要的輔助工具無法使用時，詢問使用者後安裝，優先透過 mise 管理

## Formatter & Linter

### 工具清單

- **ESLint 8.57.0**: JS/TS/JSON linter with Prettier integration
  - Config: `.eslintrc.json`
  - Run: `yarn lint` / `yarn lint --fix`
  - Plugins: @typescript-eslint, react, prettier, import, lodash, eslint-comments, jsonc, json-schema-validator
- **Prettier 3.2.5**: Code formatter
  - JS/TS 檔案：透過 eslint-plugin-prettier 套用，設定嵌入 `.eslintrc.json` 的 `prettier/prettier` rule（printWidth: 120, singleQuote: true, trailingComma: none, bracketSpacing: false, semi: true）
  - 非 JS 檔案（JSON/CSS/MD/YAML）：lint-staged 透過 `prettier --write` CLI 執行，使用 Prettier 預設值 + `.editorconfig`（專案無獨立 `.prettierrc`）
- **EditorConfig**: `.editorconfig`（2-space indent, LF, UTF-8, trim trailing whitespace）

### Husky + lint-staged

- Pre-commit hook（`.husky/pre-commit`）: `yarn lint-staged`
  - `*.{js,jsx,ts,tsx}`: `eslint --fix`
  - `*.{json,css,md,yaml,yml}`: `prettier --write`
- Pre-push hook（`.husky/pre-push`）: `yarn test`（lint + unit tests）
- lint-staged config 定義在 `package.json` 的 `"lint-staged"` key
- Husky 由 `postinstall` script 自動安裝
- 所有程式碼提交前必須通過 formatter 與 linter 檢查
- 程式碼風格問題交由工具處理，AI 專注於邏輯與架構

## 回應與品質規範

- 資訊不足或不確定時，標明「不確定」或「需要查證」，不補齊或編造細節
- 需要釐清需求時，主動與使用者確認
- 準備好結論後，用另一個角度自我檢查，如發現錯誤或矛盾則修正並說明原因
- 不產生不必要的中間檔案
- **IMPORTANT**: 不產生 "Generated with" / "Co-Authored-By" / "Powered by" 等標記
- 不使用 emoji / icon（除非設計師指定）
