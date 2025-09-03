
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const exportBtn = document.getElementById("export-btn");
const clearBtn = document.getElementById("clear-btn");
const typingIndicator = document.getElementById("typing-indicator");
const themeToggle = document.getElementById("theme-toggle");

let chatHistory = [];

// Load chat history and theme on page load
window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  saved.forEach(msg => appendMessage(msg.sender, msg.text, false));

    chatHistory = saved;

  if (localStorage.getItem("darkMode") === "true") {
    document.body.setAttribute("data-bs-theme", "dark");
    themeToggle.textContent = "☀️ Light Mode";
  }
});

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });
exportBtn.addEventListener("click", exportChat);
clearBtn.addEventListener("click", clearChat);
themeToggle.addEventListener("click", toggleTheme);

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message); // appendMessage already saves
  userInput.value = "";

  typingIndicator.style.display = "block";

  try {
    const response = await fetch("/api/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await response.json();

    typingIndicator.style.display = "none";
    appendMessage("bot", data.reply || "Sorry, no response from AI."); // appendMessage already saves
  } catch (err) {
    console.error(err);
    typingIndicator.style.display = "none";
    appendMessage("bot", "Error connecting to server.");
  }
}

function appendMessage(sender, text, save = true) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  msgDiv.innerText = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) chatHistory.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function exportChat() {
  if (!chatHistory.length) return alert("No chat to export.");
  const content = chatHistory.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join("\n\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chat-history.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function clearChat() {
  if (!chatHistory.length) return;
  if (!confirm("Are you sure you want to delete the chat history?")) return;
  chatHistory = [];
  localStorage.removeItem("chatHistory");
  chatBox.innerHTML = "";
}

function toggleTheme() {
  const body = document.body;
  if (body.getAttribute("data-bs-theme") === "light") {
    body.setAttribute("data-bs-theme", "dark");
    themeToggle.textContent = "☀️ Light Mode";
    localStorage.setItem("darkMode", "true");
  } else {
    body.setAttribute("data-bs-theme", "light");
    themeToggle.textContent = "🌙 Dark Mode";
    localStorage.setItem("darkMode", "false");
  }
}


// Skills Gap Analysis

const analyseBtn = document.getElementById("analyseBtn");
const analysisResult = document.getElementById("analysisResult");

analyseBtn.addEventListener("click", async () => {
  const skills = document.getElementById("currentSkills").value.trim();
  const role = document.getElementById("targetRole").value.trim();
  if (!skills || !role) {
    analysisResult.innerHTML = `<div class="alert alert-warning">Please fill in both fields.</div>`;
    return;
  }

  analysisResult.innerHTML = `<div class="text-center text-muted">Analysing... ⏳</div>`;

  try {
    const res = await fetch("/api/skills-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills, role })
    });
    const data = await res.json();

    // For now just show the AI text
    renderAnalysis(data.analysis);
  } catch (err) {
    analysisResult.innerHTML = `<div class="alert alert-danger">Error contacting server.</div>`;
  }
});

function renderAnalysis(text) {
  /* You can parse text here if you want structured cards.
     For MVP, just show it in a styled card. */
  analysisResult.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title">Skill Gaps & Recommendations</h5>
        <p class="card-text">${text.replace(/\n/g, "<br>")}</p>
      </div>
    </div>
    <button class="btn btn-outline-secondary mt-2" onclick="exportAnalysis()">Export</button>
  `;
}

function exportAnalysis() {
  const text = analysisResult.innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skills-analysis.txt";
  a.click();
  URL.revokeObjectURL(url);
}

