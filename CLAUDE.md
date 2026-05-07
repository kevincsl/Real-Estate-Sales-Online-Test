# CLAUDE.md - 不動產營業員線上測驗

> 此檔案提供關於此專案的開發規範和上下文。

## 專案概覽

- **名稱**: 不動產營業員線上測驗
- **類型**: 純前端 Web 應用（單一 HTML 檔或多檔案）
- **技術**: Vanilla JavaScript，無框架依賴
- **部署**: GitHub Pages（Static Hosting）
- **目標用戶**: 準備報考不動產營業員證照的考生

## 技術棧

| 類別 | 技術 |
|------|------|
| 程式語言 | HTML5 + CSS3 + JavaScript ES6+ |
| PWA | Service Worker + Web App Manifest |
| 存儲 | LocalStorage |
| 部署 | GitHub Pages |

## 專案結構

```
real-estate-exam/
├── index.html              # 主頁面（所有功能在同一頁）
├── css/
│   └── style.css           # 樣式檔案
├── js/
│   ├── app.js             # 主程式邏輯
│   ├── questions.js       # 題庫資料結構
│   └── storage.js         # LocalStorage 管理
├── manifest.json          # PWA 設定
├── sw.js                  # Service Worker
└── icons/                 # PWA 圖示
```

## 核心功能

### 1. 題庫管理
- 題目結構：`{ id, category, question, options[], answer }`
- 支援分類（不動產法規、土地法、估價等）
- 匯入/匯出題庫（JSON 格式）

### 2. 練習模式
- 隨機抽取 N 題
- 立即顯示對錯
- 記錄錯題到 LocalStorage

### 3. 模擬考試
- 50 題，30 分鐘計時
- 不可回上一題
- 最後統一顯示成績

### 4. 錯題複習
- 從 LocalStorage 讀取錯題記錄
- 重新練習

### 5. PWA 功能
- 可安裝到桌面/手機
- 支援離線使用
- 顯示「安裝 App」按鈕

## 快速指令

```bash
# 開啟專案（直接用瀏覽器）
open index.html

# 或使用 VS Code Live Server
npx live-server
```

## 開發規範

### ✅ 應該做的事
- 所有 JavaScript 使用 ES6+ 語法
- CSS 使用 CSS Variables 管理主題
- 響應式設計優先（Mobile First）
- 所有使用者資料存 LocalStorage
- PWA 功能保持更新

### ❌ 不應該做的事
- 不要使用任何後端或伺服器
- 不要上傳任何使用者資料
- 不要引入大型框架（jQuery, Bootstrap 等）
- 不要在程式碼中 hardcode 敏感資訊

## PWA 設定要點

### manifest.json 必要欄位
```json
{
  "name": "不動產營業員線上測驗",
  "short_name": "房仲考試",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [...]
}
```

### Service Worker 策略
- Cache-first 策略用於靜態資源
- Network-first 策略用於動態內容（如有）

## RWD 斷點

```css
/* 手機優先 */
@media (min-width: 768px) { /* 平板 */ }
@media (min-width: 1024px) { /* 桌機 */ }
```

## 考試設定（可調整）

| 設定 | 預設值 |
|------|--------|
| 總題數 | 50 題 |
| 及格分數 | 85 分（43 題）|
| 考試時間 | 30 分鐘 |

## 常見問題

### Q: 如何新增題目？
A: 在 `js/questions.js` 中新增物件，或使用 UI 介面匯入。

### Q: 題庫會不見嗎？
A: 題庫存在 LocalStorage，建議定期匯出備份。

### Q: 可以離線使用嗎？
A: 安裝 PWA 後可完全離線使用。

### Q: 如何部署更新？
A: 推送程式碼到 GitHub，GitHub Pages 會自動更新。
