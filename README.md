# 不動產營業員線上測驗

![Static Badge](https://img.shields.io/badge/Platform-GitHub%20Pages-blue)
![Static Badge](https://img.shields.io/badge/PWA-Ready-brightgreen)
![Static Badge](https://img.shields.io/badge/License-MIT-yellow)

> 📚 不動產營業員證照考試線上練習系統 — 可自建題庫、隨機抽題、模擬考試

## 🚀 快速開始

### 安裝方式（直接使用）

1. 前往 GitHub Pages 網址即可開始使用
2. 或 clone 此專案到本地

```bash
git clone https://github.com/kevincsl/real-estate-exam.git
cd real-estate-exam
# 直接用瀏覽器開啟 index.html 即可
```

### 安裝為 PWA（可離線使用）

1. 在網站中點擊「安裝 App」按鈕
2. 或使用瀏覽器地址列右側的「安裝」選項
3. 安裝後可離線使用所有功能

## 📖 功能特色

| 功能 | 說明 |
|------|------|
| 📚 題庫管理 | 匯入、自建題庫，分類管理 |
| 🎲 隨機練習 | 從題庫隨機抽取題目練習 |
| 📝 模擬考試 | 仿照正式考試時間與題數 |
| 📊 錯題複習 | 自動收集答錯的題目 |
| 📱 PWA 支援 | 可安裝到桌面，支援離線使用 |
| 📐 RWD 設計 | 完全支援手機、平板、桌機 |

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Vanilla JavaScript（無框架） |
| 樣式方案 | CSS3 + CSS Variables |
| PWA | Service Worker + Web App Manifest |
| 部署平台 | GitHub Pages |
| 存儲 | LocalStorage（題庫、進度） |

## 📁 專案結構

```
real-estate-exam/
├── index.html          # 主頁面
├── css/
│   └── style.css       # 樣式檔案
├── js/
│   ├── app.js          # 主程式
│   ├── questions.js    # 題庫資料
│   ├── storage.js      # LocalStorage 管理
│   └── pwa.js          # PWA 服務
├── manifest.json       # PWA 設定
├── sw.js              # Service Worker
├── icons/             # 圖示資源
└── README.md
```

## 🎯 使用方式

### 建立題庫

1. 點擊「題庫管理」
2. 選擇「新增題目」或「匯入題庫」
3. 填寫題目內容與選項
4. 標記正確答案

### 開始練習

1. 選擇「隨機練習」模式
2. 設定題目數量
3. 開始答題，系統即時回饋對錯

### 模擬考試

1. 選擇「模擬考試」模式
2. 系統隨機抽取 50 題
3. 計時 30 分鐘
4. 考試結束後顯示成績與錯題

### 錯題複習

1. 進入「錯題本」
2. 重新練習所有答錯過的題目
3. 鞏固記憶，提高通過率

## 🔧 開發指南

### 本地開發

```bash
# Clone 專案
git clone https://github.com/kevincsl/real-estate-exam.git

# 使用任一字元編輯器開啟
code .

# 用瀏覽器直接開啟 index.html
# 或使用 VS Code Live Server 擴展
```

### 部署到 GitHub Pages

1. Fork 此專案到您的 GitHub
2. 前往 Settings → Pages
3. Source 選擇 `main` branch
4. 幾分鐘後即可透過 `https://YOUR_USERNAME.github.io/real-estate-exam` 訪問

### 新增題目格式

```javascript
{
  id: 1,
  category: "不動產法規",
  question: "關於不動產經紀業的敘述，何者正確？",
  options: [
    "選項 A",
    "選項 B",
    "選項 C",
    "選項 D"
  ],
  answer: 0  // 正確答案索引 0-3
}
```

## 🔒 安全考量

- 所有資料儲存在本地 LocalStorage，不上傳至任何伺服器
- 無需註冊登入，隱私完全保護
- PWA 資料隔離存儲

## 📊 考試規則（預設）

| 項目 | 設定值 |
|------|--------|
| 題數 | 50 題 |
| 時間 | 30 分鐘 |
| 及格分數 | 85 分（答對 43 題）|

可自行在設定中調整

## 🤝 貢獻指南

歡迎提交 Pull Request 豐富題庫！

1. Fork 此專案
2. 建立功能分支 (`git checkout -b add/questions-2024`)
3. 新增或修正題目
4. 提交並推送到您的分支
5. 創建 Pull Request

## 📄 授權

MIT License

---

**祝您考試順利！🏆**
