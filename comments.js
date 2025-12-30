const STORAGE_KEY = "portfolio-comments";

// API 配置 - 請將此 URL 替換為您的後端 API 端點
// 範例: "https://your-api.com/api/comments"
const API_BASE_URL = ""; // 留空則只使用 localStorage，填入 API URL 則會上傳到伺服器

// 是否啟用伺服器同步（當 API_BASE_URL 有值時自動啟用）
const USE_SERVER = API_BASE_URL !== "";

function getStoredComments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse stored comments", e);
    return [];
  }
}

function storeComments(comments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

// 從伺服器獲取留言
async function fetchCommentsFromServer() {
  if (!USE_SERVER) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch comments from server", e);
    // 如果伺服器請求失敗，回退到 localStorage
    return getStoredComments();
  }
}

// 發送留言到伺服器
async function saveCommentToServer(comment) {
  if (!USE_SERVER) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (e) {
    console.error("Failed to save comment to server", e);
    return false;
  }
}

function formatTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

async function renderComments() {
  const listEl = document.getElementById("comment-list");
  const emptyEl = document.getElementById("no-comments");
  
  // 如果啟用伺服器，從伺服器獲取；否則從 localStorage 獲取
  const comments = USE_SERVER ? await fetchCommentsFromServer() : getStoredComments();

  listEl.innerHTML = "";

  if (!comments.length) {
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";

  // 按時間排序（最新的在前）
  const sortedComments = [...comments].sort((a, b) => {
    return new Date(b.time || b.createdAt) - new Date(a.time || a.createdAt);
  });

  sortedComments.forEach((c) => {
    const li = document.createElement("li");
    li.className = "comment-item";

    const header = document.createElement("div");
    header.className = "comment-header";

    const nameSpan = document.createElement("span");
    nameSpan.className = "comment-name";
    nameSpan.textContent = c.name || "訪客";

    const timeSpan = document.createElement("span");
    timeSpan.className = "comment-time";
    timeSpan.textContent = c.time || c.createdAt || "";

    header.appendChild(nameSpan);
    header.appendChild(timeSpan);

    const messageP = document.createElement("p");
    messageP.className = "comment-message";
    messageP.textContent = c.message;

    li.appendChild(header);
    li.appendChild(messageP);

    listEl.appendChild(li);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!message) {
    alert("請輸入留言內容");
    messageInput.focus();
    return;
  }

  const now = new Date();
  const comment = {
    name: name || "訪客",
    message,
    time: formatTime(now),
    createdAt: now.toISOString(),
  };

  // 顯示載入狀態
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "送出中...";

  if (USE_SERVER) {
    // 發送到伺服器
    const success = await saveCommentToServer(comment);
    if (success) {
      // 同時儲存到 localStorage 作為備份
      const comments = getStoredComments();
      comments.unshift(comment);
      storeComments(comments);
      alert("留言已成功送出！");
    } else {
      // 如果伺服器失敗，儲存到 localStorage
      const comments = getStoredComments();
      comments.unshift(comment);
      storeComments(comments);
      alert("留言已儲存到本機（伺服器連線失敗）");
    }
  } else {
    // 只儲存到 localStorage
    const comments = getStoredComments();
    comments.unshift(comment);
    storeComments(comments);
  }

  // 恢復按鈕狀態
  submitBtn.disabled = false;
  submitBtn.textContent = originalText;

  // 重新渲染留言列表
  await renderComments();

  // 清空表單
  nameInput.value = "";
  messageInput.value = "";
  messageInput.focus();
}

function handleClear() {
  if (!confirm("確定要清除這台裝置上所有的留言嗎？")) return;
  storeComments([]);
  renderComments();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("comment-form");
  const clearBtn = document.getElementById("clear-comments");
  const formHint = document.getElementById("form-hint");

  // 更新提示文字
  if (formHint) {
    if (USE_SERVER) {
      formHint.textContent = "留言會上傳到伺服器並儲存在本機瀏覽器中。";
    } else {
      formHint.textContent = "留言會儲存在本機瀏覽器中，僅供展示使用。";
    }
  }

  if (form) form.addEventListener("submit", handleSubmit);
  if (clearBtn) clearBtn.addEventListener("click", handleClear);

  renderComments();
});












