/* ============================================
   ビジネスメール アシスタント — Side Panel Logic
   Gemini API 版
   ============================================ */

const BASE_SYSTEM_PROMPT = `あなたはプロのWEBディレクターとして振る舞い、ユーザーが書いた文章を最適で丁寧なビジネスメール文に直す役割を担います。

## ルール
- メールの目的に合わせて、相手に配慮しながらも伝えるべき内容は的確に伝える
- ことを荒立てず、穏便に案件を進行するための表現に重点を置く
- 必要に応じてクッション言葉や丁寧語を活用し、トーンは常に誠実かつ落ち着いたものとする
- 情報が不足している場合は、自ら補完して自然なメール文を提案する
- 件名（Subject）も提案する
- 宛名や署名が不明な場合は「◯◯様」「（署名）」のようにプレースホルダーで示す
- 出力はメール本文のみ。余計な説明や前置きは不要
- メールの冒頭には適切な挨拶文を入れる
- メールの末尾には適切な結びの言葉を入れる`;

function buildSystemPrompt() {
  let prompt = BASE_SYSTEM_PROMPT;
  if (userName) {
    prompt += `\n- メール末尾の署名には「${userName}」を使用する`;
  }
  if (greeting) {
    prompt += `\n- メール冒頭の挨拶は「${greeting}」で始める`;
  }
  return prompt;
}

// ---- DOM Elements ----
const settingsScreen = document.getElementById("settings-screen");
const chatScreen = document.getElementById("chat-screen");
const apiKeyInput = document.getElementById("api-key-input");
const userNameInput = document.getElementById("user-name-input");
const greetingSelect = document.getElementById("greeting-select");
const modelSelect = document.getElementById("model-select");
const saveSettingsBtn = document.getElementById("save-settings-btn");
const toggleKeyBtn = document.getElementById("toggle-key-visibility");
const openSettingsBtn = document.getElementById("open-settings-btn");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

// ---- State ----
let apiKey = "";
let userName = "";
let greeting = "お疲れ様です。";
let model = "gemini-2.5-flash-lite";
let isGenerating = false;

// ---- Initialization ----
async function init() {
  const stored = await chrome.storage.local.get(["apiKey", "userName", "greeting", "model"]);
  if (stored.apiKey) {
    apiKey = stored.apiKey;
    userName = stored.userName || "";
    greeting = stored.greeting ?? "お疲れ様です。";
    model = stored.model || "gemini-2.5-flash-lite";
    showChatScreen();
  } else {
    showSettingsScreen();
  }
}

function showSettingsScreen() {
  settingsScreen.classList.remove("hidden");
  chatScreen.classList.add("hidden");
  apiKeyInput.value = apiKey;
  userNameInput.value = userName;
  greetingSelect.value = greeting;
  modelSelect.value = model;
}

function showChatScreen() {
  settingsScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  messageInput.focus();
}

// ---- Settings ----
saveSettingsBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    apiKeyInput.style.boxShadow =
      "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light), 0 0 0 2px rgba(245, 101, 101, 0.3)";
    apiKeyInput.focus();
    setTimeout(() => {
      apiKeyInput.style.boxShadow = "";
    }, 2000);
    return;
  }

  apiKey = key;
  userName = userNameInput.value.trim();
  greeting = greetingSelect.value;
  model = modelSelect.value;
  await chrome.storage.local.set({ apiKey, userName, greeting, model });
  showChatScreen();
});

toggleKeyBtn.addEventListener("click", () => {
  const isPassword = apiKeyInput.type === "password";
  apiKeyInput.type = isPassword ? "text" : "password";
});

openSettingsBtn.addEventListener("click", () => {
  showSettingsScreen();
});

// ---- Input Handling ----
// Enter = 改行（送信しない）
messageInput.addEventListener("keydown", (e) => {
  // Ctrl+Enter or Cmd+Enter で送信
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    handleSend();
  }
  // 通常の Enter は改行（デフォルト動作のまま）
});

// テキストエリアの自動リサイズ
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + "px";
});

sendBtn.addEventListener("click", handleSend);

// ---- Example Chips ----
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    messageInput.value = chip.dataset.text;
    messageInput.style.height = "auto";
    messageInput.style.height =
      Math.min(messageInput.scrollHeight, 200) + "px";
    messageInput.focus();
  });
});

// ---- Send Message ----
async function handleSend() {
  const text = messageInput.value.trim();
  if (!text || isGenerating) return;

  // ウェルカムカードを削除
  const welcomeCard = messagesContainer.querySelector(".welcome-card");
  if (welcomeCard) welcomeCard.remove();

  // ユーザーメッセージを追加
  addMessage("user", text);

  // 入力をクリア
  messageInput.value = "";
  messageInput.style.height = "auto";

  // ローディング表示
  const loadingEl = addLoading();
  isGenerating = true;
  sendBtn.disabled = true;

  try {
    // ストリーミングでAPI呼び出し
    const assistantEl = addMessage("assistant", "");
    const contentEl = assistantEl.querySelector(".message-content");
    loadingEl.remove();

    await streamResponse(text, (chunk) => {
      contentEl.textContent += chunk;
      scrollToBottom();
    });

    // コピーボタンを追加
    addCopyButton(assistantEl, contentEl.textContent);
  } catch (error) {
    loadingEl.remove();
    addError(getErrorMessage(error));
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// ---- Gemini API Call with Streaming ----
async function streamResponse(userMessage, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt() }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(`API Error: ${response.status}`);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE イベントをパース
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        // Gemini のレスポンス構造: candidates[0].content.parts[0].text
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          onChunk(text);
        }
      } catch {
        // JSON パースエラーは無視（不完全なチャンクの可能性）
      }
    }
  }
}

// ---- UI Helpers ----
function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "あなた" : "ビジネスメール";

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  wrapper.appendChild(label);
  wrapper.appendChild(content);
  messagesContainer.appendChild(wrapper);
  scrollToBottom();

  return wrapper;
}

function addCopyButton(messageEl, text) {
  const actions = document.createElement("div");
  actions.className = "message-actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn";
  copyBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
    コピー
  `;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        コピーしました
      `;
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          コピー
        `;
      }, 2000);
    } catch {
      // フォールバック
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  });

  actions.appendChild(copyBtn);
  messageEl.appendChild(actions);
}

function addLoading() {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "ビジネスメール";

  const dots = document.createElement("div");
  dots.className = "loading-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";

  wrapper.appendChild(label);
  wrapper.appendChild(dots);
  messagesContainer.appendChild(wrapper);
  scrollToBottom();

  return wrapper;
}

function addError(message) {
  const wrapper = document.createElement("div");
  wrapper.className = "error-message";
  wrapper.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;
  messagesContainer.appendChild(wrapper);
  scrollToBottom();
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getErrorMessage(error) {
  if (error.status === 400) {
    return "リクエストエラー。API キーまたはモデル名を確認してください。";
  }
  if (error.status === 403) {
    return "API キーが無効、またはこのモデルへのアクセス権がありません。設定を確認してください。";
  }
  if (error.status === 429) {
    return "リクエストが多すぎます。しばらく待ってからもう一度お試しください。";
  }
  if (error.status >= 500) {
    return "サーバーエラーが発生しました。しばらく待ってからもう一度お試しください。";
  }
  if (error.message?.includes("Failed to fetch")) {
    return "ネットワークエラー。インターネット接続を確認してください。";
  }
  return `エラーが発生しました: ${error.message || "不明なエラー"}`;
}

// ---- Start ----
init();
