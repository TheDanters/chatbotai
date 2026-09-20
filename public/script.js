const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const resetBtn = document.getElementById("reset-btn");
const suggestions = document.getElementById("suggestions");

const WELCOME_MESSAGE =
  "Hai! Aku Tutor Belajar AI. Tanyakan materi pelajaran apa pun, " +
  "nanti aku jelaskan langkah demi langkah. Mau mulai dari topik apa?";

let conversation = [];

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

async function sendToBackend(payload) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation: payload }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from server.");
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
  input.focus();
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

document.getElementById("year").textContent = new Date().getFullYear();

resetChat();
