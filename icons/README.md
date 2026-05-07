# PWA 圖示製作指南

## 已建立的圖示

✅ 已建立 `icon.svg` 向量圖示

## 需要的 PNG 檔案

您需要將 SVG 轉換成以下尺寸的 PNG：

| 檔案 | 尺寸 | 用途 |
|------|------|------|
| `icon-192.png` | 192x192 | 小尺寸圖示 |
| `icon-512.png` | 512x512 | 大尺寸圖示 |
| `icon-maskable.png` | 512x512 | 遮罩圖示 |

## 快速轉換方式

### 方法 1：使用線上工具（推薦）

1. 前往 https://cloudconvert.com/svg-to-png
2. 上傳 `icon.svg`
3. 設定尺寸為 192x192，下載為 `icon-192.png`
4. 再次設定尺寸為 512x512，下載為 `icon-512.png`
5. `icon-maskable.png` 可直接使用 `icon-512.png`

### 方法 2：使用命令列工具

如果您有 ImageMagick：
```bash
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 512x512 icon-512.png
cp icon-512.png icon-maskable.png
```

### 方法 3：使用 Python PIL

```python
from PIL import Image
import subprocess

# 先將 SVG 轉為 PNG
subprocess.run(['inkscape', '-w', '192', '-h', '192', '-o', 'icon-192.png', 'icon.svg'])
subprocess.run(['inkscape', '-w', '512', '-h', '512', '-o', 'icon-512.png', 'icon.svg'])
```

## 圖示設計說明

- 主題色：#4CAF50（配合網站主題）
- 包含元素：房屋（不動產）+ 試卷（考試）
- 設計簡潔，縮放後仍然清晰

## 圖示預覽

```
┌─────────────────────────┐
│                         │
│         屋頂            │
│        ╱    ╲           │
│      ┌──────┐          │
│      │ 窗   窗│          │
│      │   門   │          │
│      └──────┘          │
│      ▔▔▔▔▔▔▔          │
│      ┃📄題庫┃           │
│      ▁▁▁▁▁▁▁          │
└─────────────────────────┘
```
