import { marked } from "marked";

function appendMessage(sender, text, save = true) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");
  msgDiv.classList.add(sender === "user" ? "user-msg" : "bot-msg");

  if (sender === "bot") {
    // Parse markdown to HTML with marked
    msgDiv.innerHTML = marked.parse(text, {
      gfm: true, // enable GitHub Flavored Markdown
      breaks: true, // line breaks as <br>
    });
  } else {
    msgDiv.innerText = text;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) {
    chatHistory.push({ sender, text });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }
}
