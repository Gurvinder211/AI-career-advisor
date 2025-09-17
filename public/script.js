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

// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', function () {
  const body = document.body;
  const currentTheme = body.getAttribute('data-bs-theme');
  body.setAttribute('data-bs-theme', currentTheme === 'light' ? 'dark' : 'light');
  this.textContent = currentTheme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Skill Gap Analysis (calls /api/skills-analysis)
document.getElementById('analyseBtn').addEventListener('click', async function () {
  const skills = document.getElementById('currentSkills').value.trim();
  const role = document.getElementById('targetRole').value.trim();
  const resultDiv = document.getElementById('analysisResult');

  if (!skills || !role) {
    resultDiv.innerHTML = '<div class="alert alert-warning">Please enter both your skills and target role.</div>';
    return;
  }

  // show loading
  resultDiv.innerHTML = `<div class="text-center text-muted">Analysing… ⏳</div>`;

  try {
    const res = await fetch("/api/skills-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills, role })
    });

    if (!res.ok) throw new Error("Server error");
    const data = await res.json();

    // show AI result
    resultDiv.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Skill Gaps & Recommendations</h5>
          <p class="card-text">${(data.analysis || "")
            .replace(/\n/g, "<br>")}</p>
        </div>
      </div>
      <button class="btn btn-outline-secondary mt-2" onclick="exportAnalysis()">Export</button>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<div class="alert alert-danger">Error contacting server.</div>`;
  }
});

function exportAnalysis() {
  const text = document.getElementById('analysisResult').innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skills-analysis.txt";
  a.click();
  URL.revokeObjectURL(url);
}


// ChatBot Skill Gap Analysis
document.getElementById('chatbotSkillBtn').addEventListener('click', function () {
  document.getElementById('featureResult').innerHTML = `
    <div class="alert alert-primary">
      <strong>ChatBot Skill Gap Analysis:</strong><br>
      Start a chat in the chat window to get personalized skill gap advice!
    </div>
  `;
});

// Job Market Trend Maker
document.getElementById('trendBtn').addEventListener('click', function () {
  document.getElementById('featureResult').innerHTML = `
    <div class="alert alert-info">
      <strong>Job Market Trends:</strong><br>
      Trending roles: Frontend Developer, Data Analyst, Cloud Engineer.<br>
      <em>More detailed trends coming soon...</em>
    </div>
  `;
});

// Mentor & Peer Connect
document.getElementById('connectBtn').addEventListener('click', function () {
  document.getElementById('featureResult').innerHTML = `
    <div class="alert alert-success">
      <strong>Mentor & Peer Connect:</strong><br>
      Find mentors and peers in your field.<br>
      <em>Connection feature coming soon...</em>
    </div>
  `;
});

// Optional: Clear feature result on new action
['chatbotSkillBtn', 'trendBtn', 'connectBtn'].forEach(id => {
  document.getElementById(id).addEventListener('click', function () {
    setTimeout(() => {
      document.getElementById('featureResult').scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });
});

