# Development Guidelines

## 專案資訊

- **專案名稱**: Hyper - A terminal built on web technologies
- **技術棧**: TypeScript 5.4.5, React 18.2.0, Redux 4.2.1, Electron 22.3.25, xterm.js 5.3.0, styled-jsx 5.1.2, Webpack 5, Babel 7, node-pty
- **專案結構**:
  - `/app` - Electron main process (config, plugins, sessions, menus, RPC, updater)
  - `/lib` - React renderer (components, containers, actions, reducers, store, utils)
  - `/cli` - CLI for plugin management (install, uninstall, list, search)
  - `/typings` - TypeScript type definitions
  - `/test` - Unit tests (AVA) and E2E tests (Playwright)
  - `/bin` - Build scripts (V8 snapshots, notarization)
  - `/build` - Application icons and platform-specific build assets

## 常用指令

- `yarn dev`: Watch mode (Webpack + TypeScript compiler in parallel)
- `yarn app`: Run Electron app via electronmon (use alongside `yarn dev`)
- `yarn build`: Production build (Webpack + tsc + Babel minification)
- `yarn lint`: ESLint (.js/.jsx/.ts/.tsx/.json)
- `yarn test`: Lint + unit tests
- `yarn test:unit`: AVA unit tests
- `yarn test:unit:watch`: AVA watch mode
- `yarn test:e2e`: Playwright E2E tests via AVA
- `yarn dist`: Distribution build (electron-builder)
- `yarn clean`: Remove node_modules
- `yarn generate-schema`: Generate JSON schema from TypeScript config types

---

## 環境管理

- **工具管理**: mise
- **配置檔**: mise.toml
- **初始化指令**: `mise install`
- **虛擬環境**: N/A (Node.js project)
- **虛擬環境啟用指令**: N/A

### 原則

- 使用 mise 統一管理語言 runtime 與開發工具，避免依賴系統全域安裝
- mise.toml 必須 commit 至版本控制，作為環境的 single source of truth
- 專案操作前應確認 mise 環境已啟用且工具版本正確
- 安裝依賴前應確認已啟用正確的環境
- 不直接使用系統全域的語言 runtime 或工具，所有操作應透過 mise 管理的版本執行

## 開發原則

- 遵循 KISS 原則（Keep It Short and Simple）
- 遵循 DRY 原則（Don't Repeat Yourself）
- 遵循 SOLID 原則
- 遵循領域 Best Practice，採用最新穩定的實作方案
- 專案需保持高可維護性、高可讀性、高強健性
- 程式碼與結構應讓協作者能快速理解專案現況與功能

## 程式碼品質

### 架構設計

- 低耦合、高內聚（Low Coupling, High Cohesion）
- 關注點分離（Separation of Concerns）
- 單一職責，每個模組 / 函式只做一件事
- 優先使用組合而非繼承（Composition over Inheritance）
- 依賴抽象而非具體實作（Dependency Inversion）

### 程式碼風格

- 命名清晰具描述性，避免縮寫與魔術數字
- 函式保持簡潔乾淨，單一函式不超過 50 行為佳
- 適當的錯誤處理與邊界條件檢查
- 適當的文件與註解，但不過度註解
- 避免深層巢狀，提早返回（Early Return）

### 強健性

- 防禦性程式設計，驗證輸入參數
- 完善的錯誤處理與日誌記錄
- 避免硬編碼，使用設定檔或環境變數
- 考慮並處理邊界情況與異常狀況

## 資安要求

- 不在程式碼中硬編碼敏感資訊（密碼、API Key、Token），除非為測試用途的假資料
- 所有使用者輸入需進行驗證與清理（Input Validation & Sanitization）
- 遵循最小權限原則（Principle of Least Privilege）
- 避免暴露敏感的錯誤訊息與堆疊追蹤
- 依賴套件需注意已知漏洞，保持更新
- 日誌記錄不得包含敏感資訊

## 工作流程

- **IMPORTANT**: 除非是非常簡單的小修改，所有變更必須建立新 branch 進行，完成後提交 Pull Request 供團隊 Code Review
- **IMPORTANT**: 同一次任務討論中產生的所有變更，應整合在同一個 Branch 與同一個 PR 中完成，不得切分為多個 Branch 或多個 PR
- 同一個 Branch 中的 commit 應保持原子性（Atomic Commits），每個 commit 對應一個邏輯上獨立的變更，並撰寫清晰的 commit message
- 所有調整需先與使用者確認後再執行
- 不接受臨時性的調整與方案
- 完成變動後執行 formatter 確保程式碼風格一致

## 執行變更前

- 理解相關模組的現有架構與設計決策
- 確認變更不會破壞現有功能與測試
- 評估變更的影響範圍

## Code Review 規範

### Review 重點

- 程式碼是否符合專案架構與設計原則
- 邏輯正確性與邊界條件處理
- 是否有潛在的效能問題或資安風險
- 命名與可讀性是否清晰
- 測試覆蓋是否足夠
- 是否有重複程式碼可抽取

### Review 產出

- PR 描述需清楚說明變更目的與影響範圍
- 如有破壞性變更（Breaking Changes）需明確標註
- 相關文件需同步更新

## 回應規範

- 資訊不足或不確定時，標明「不確定」或「需要查證」，不補齊或編造細節
- 需要釐清需求時，主動與使用者確認
- 準備好結論後，用另一個角度自我檢查，如發現錯誤或矛盾則修正並說明原因

## 品質要求

- 不產生不必要的中間檔案
- 不產生 "Generated with" / "Co-Authored-By" / "Powered by" 等無意義資訊
- 不使用 emoji / icon（除非設計師設計）

## 工具與資源

- 進行 Coding / Review 時，建議優先透過 context7 MCP 查詢相關文件與 Best Practice
- 必要的輔助工具無法使用時，可在詢問使用者後安裝
- 安裝工具時優先透過 mise，避免直接使用系統套件管理器安裝開發工具

## Formatter & Linter

### 工具清單

- **ESLint 8.57.0**: JS/TS/JSON linter with Prettier integration
  - Config: `.eslintrc.json`
  - Run: `yarn lint`
  - Plugins: @typescript-eslint, react, prettier, import, lodash, eslint-comments, jsonc, json-schema-validator
- **Prettier 3.2.5**: Code formatter (config embedded in `.eslintrc.json`)
  - Settings: printWidth 120, singleQuote true, trailingComma none, bracketSpacing false, semi true
- **EditorConfig**: `.editorconfig` (2-space indent, LF, UTF-8)

### lint-staged + Husky

- Project uses Husky for Git hooks and lint-staged for pre-commit checks
- Pre-commit: `.husky/pre-commit` runs `yarn lint-staged` (ESLint + Prettier on staged files)
- Pre-push: `.husky/pre-push` runs `yarn test` (lint + unit tests)
- lint-staged config: defined in `package.json` under `"lint-staged"` key
- Husky setup is handled automatically via `postinstall` script

### 格式化原則

- 所有程式碼提交前必須通過 formatter 與 linter 檢查
- formatter 與 linter 的配置檔應 commit 至版本控制
- 不同語言 / 檔案類型應使用對應的專用工具，避免一刀切

## Project-Specific Conventions

- Electron dual-process architecture: main process (`/app`) and renderer process (`/lib`)
- Plugin system using decorator pattern (decorateConfig, decorateMenu, decorateKeymaps, decorateComponent)
- IPC communication via typed RPC (`app/rpc.ts` <-> `lib/rpc.ts`, `lib/utils/rpc.ts`)
- Redux for state management (actions / reducers / store pattern in `/lib`)
- styled-jsx for scoped CSS in React components
- Package manager: Yarn (classic)
- V8 snapshots for startup performance optimization
- Config schema auto-generated from TypeScript types (`yarn generate-schema`)
