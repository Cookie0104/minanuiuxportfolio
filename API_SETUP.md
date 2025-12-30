# 留言功能 API 設置說明

## 概述

留言功能現在支援兩種模式：
1. **僅本地儲存**（預設）：留言儲存在瀏覽器的 localStorage
2. **伺服器同步**：留言上傳到您的後端 API

## 如何啟用伺服器同步

### 步驟 1: 修改 API 端點

打開 `comments.js` 文件，找到以下行：

```javascript
const API_BASE_URL = ""; // 留空則只使用 localStorage
```

將空字串替換為您的 API 端點 URL，例如：

```javascript
const API_BASE_URL = "https://your-api.com/api/comments";
```

### 步驟 2: 設置後端 API

您的後端 API 需要支援以下端點：

#### GET `/api/comments` - 獲取所有留言

**請求：**
```
GET /api/comments
```

**回應：**
```json
[
  {
    "id": "1",
    "name": "訪客",
    "message": "這是一個留言",
    "time": "2025-01-15 14:30",
    "createdAt": "2025-01-15T14:30:00.000Z"
  }
]
```

#### POST `/api/comments` - 創建新留言

**請求：**
```
POST /api/comments
Content-Type: application/json

{
  "name": "訪客",
  "message": "這是一個留言",
  "time": "2025-01-15 14:30",
  "createdAt": "2025-01-15T14:30:00.000Z"
}
```

**回應：**
```json
{
  "id": "1",
  "name": "訪客",
  "message": "這是一個留言",
  "time": "2025-01-15 14:30",
  "createdAt": "2025-01-15T14:30:00.000Z"
}
```

## 後端 API 範例

### Node.js + Express 範例

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let comments = [];

// 獲取所有留言
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// 創建新留言
app.post('/api/comments', (req, res) => {
  const { name, message, time, createdAt } = req.body;
  const newComment = {
    id: Date.now().toString(),
    name: name || "訪客",
    message,
    time,
    createdAt: createdAt || new Date().toISOString(),
  };
  comments.push(newComment);
  res.json(newComment);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Python + Flask 範例

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

comments = []

@app.route('/api/comments', methods=['GET'])
def get_comments():
    return jsonify(comments)

@app.route('/api/comments', methods=['POST'])
def create_comment():
    data = request.json
    new_comment = {
        'id': str(int(datetime.now().timestamp())),
        'name': data.get('name', '訪客'),
        'message': data.get('message'),
        'time': data.get('time'),
        'createdAt': data.get('createdAt', datetime.now().isoformat())
    }
    comments.append(new_comment)
    return jsonify(new_comment), 201

if __name__ == '__main__':
    app.run(port=3000)
```

## 使用第三方服務

### 選項 1: Firebase Realtime Database

1. 在 Firebase 控制台創建專案
2. 啟用 Realtime Database
3. 修改 `API_BASE_URL` 為 Firebase REST API 端點

### 選項 2: Supabase

1. 在 Supabase 創建專案
2. 創建 `comments` 表
3. 使用 Supabase REST API 端點

### 選項 3: Formspree / Web3Forms

這些服務主要用於表單提交，需要額外設置來顯示留言列表。

## 注意事項

1. **CORS 設置**：確保您的後端 API 允許來自您網站域名的跨域請求
2. **安全性**：建議添加驗證和速率限制，防止濫用
3. **備份**：即使啟用伺服器同步，留言仍會備份到 localStorage
4. **錯誤處理**：如果伺服器請求失敗，系統會自動回退到 localStorage

## 測試

設置完成後，可以：
1. 打開瀏覽器開發者工具（F12）
2. 查看 Network 標籤
3. 提交留言，確認請求是否成功發送到您的 API

