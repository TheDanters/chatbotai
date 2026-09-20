const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const resetBtn = document.getElementById("reset-btn");
const suggestions = document.getElementById("suggestions");
const widget = document.getElementById("chat-widget");
const launcher = document.getElementById("chat-launcher");
const closeBtn = document.getElementById("chat-close");
const openButtons = document.querySelectorAll("[data-open-chat]");

const WELCOME_MESSAGE =
  "Hai! Aku Mentor AI. Aku siap menjelaskan konsep AI, machine learning, LLM, " +
  "sampai prompt engineering dengan bahasa yang mudah. Mau mulai dari topik apa?";

let conversation = [];

function openChat() {
  widget.classList.add("open");
  launcher.classList.add("active");
  widget.setAttribute("aria-hidden", "false");
  input.focus();
}

function closeChat() {
  widget.classList.remove("open");
  launcher.classList.remove("active");
  widget.setAttribute("aria-hidden", "true");
}

function toggleChat() {
  if (widget.classList.contains("open")) {
    closeChat();
  } else {
    openChat();
  }
}

function appendMessage(role, text) {
  const el = document.createElement("div");
  el.classList.add("message", role === "user" ? "user" : "bot");
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
  return el;
}

function appendThinking() {
  const el = document.createElement("div");
  el.classList.add("message", "bot", "thinking");
  el.innerHTML =
    'Tutor sedang berpikir <span class="typing"><span></span><span></span><span></span></span>';
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
  return el;
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  input.disabled = isLoading;
  if (!isLoading) input.focus();
}

const API_BASE =
  window.API_BASE ||
  (window.location.protocol === "file:" ? "http://localhost:3000" : "");

async function sendToBackend(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation: payload }),
    });
  } catch (networkError) {
    throw new Error(
      "Tidak dapat terhubung ke server. Jalankan server dengan `npm start`, " +
        "lalu buka aplikasi melalui http://localhost:3000 (jangan buka file HTML langsung)."
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data.message || "";
    } catch (_) {
      /* respons bukan JSON */
    }
    throw new Error(
      detail
        ? `Gagal mendapatkan respons dari server. (${detail})`
        : "Failed to get response from server."
    );
  }

  return response.json();
}

async function handleSubmit(userMessage) {
  appendMessage("user", userMessage);
  conversation.push({ role: "user", text: userMessage });

  const thinkingEl = appendThinking();
  setLoading(true);

  try {
    const data = await sendToBackend(conversation);
    const reply = data.result;

    if (reply) {
      thinkingEl.classList.remove("thinking");
      thinkingEl.textContent = reply;
      conversation.push({ role: "model", text: reply });
    } else {
      thinkingEl.textContent = "Sorry, no response received.";
    }
  } catch (error) {
    console.error(error);
    thinkingEl.textContent =
      error.message || "Failed to get response from server.";
  } finally {
    setLoading(false);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function resetChat() {
  conversation = [];
  chatBox.innerHTML = "";
  appendMessage("bot", WELCOME_MESSAGE);
  if (widget.classList.contains("open")) input.focus();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  handleSubmit(userMessage);
});

suggestions.addEventListener("click", function (e) {
  const button = e.target.closest("button[data-prompt]");
  if (!button) return;
  handleSubmit(button.dataset.prompt);
});

resetBtn.addEventListener("click", resetChat);

launcher.addEventListener("click", toggleChat);
closeBtn.addEventListener("click", closeChat);
openButtons.forEach((button) => button.addEventListener("click", openChat));

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && widget.classList.contains("open")) closeChat();
});

document.getElementById("year").textContent = new Date().getFullYear();

resetChat();
