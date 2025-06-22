import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from "markdown-it";
import { maybeShowApiKeyBanner } from "./gemini-api-banner";
import "./style.css";

let API_KEY = 'AIzaSyC9_12RrRvL_7i-t6NEbHd0qJXYVZsFb-g';

let form = document.querySelector("form");
let promptInput = document.querySelector("input[name='prompt']");
let imageInput = document.getElementById("imageInput");
let output = document.querySelector(".output");
let chatHistory = document.getElementById("chat-history");
let conversationHistory = [];

let md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}" data-lang="${lang}">` +
               hljs.highlight(str, { language: lang }).value +
               '</code></pre>';
      } catch (_) {}
    }
    return `<pre><code class="hljs">` + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  });
}

promptInput.addEventListener("input", scrollToBottom);

const themeSelector = document.getElementById("themeSelector");
function applyTheme(theme) {
  document.body.classList.remove("dark", "theme-cyberpunk", "theme-minimal");
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else if (theme === "cyberpunk") {
    document.body.classList.add("theme-cyberpunk");
  } else if (theme === "minimal") {
    document.body.classList.add("theme-minimal");
  }
  localStorage.setItem("selected-theme", theme);
}
themeSelector.addEventListener("change", () => {
  applyTheme(themeSelector.value);
});
const savedTheme = localStorage.getItem("selected-theme") || "light";
themeSelector.value = savedTheme;
applyTheme(savedTheme);

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: parseInt(document.getElementById("maxTokens").value || "100"),
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();
  const prompt = promptInput.value;
  output.textContent = "Lagi Loading nihhhhh...";

  const userDiv = document.createElement("div");
  userDiv.className = "chat user";
  userDiv.innerHTML = `<div>${prompt}</div><small>${getTimeStamp()}</small>`;
  chatHistory.appendChild(userDiv);

  const typingDiv = document.createElement("div");
  typingDiv.className = "chat ai typing-indicator fade-in";
  typingDiv.innerHTML = `<span></span><span></span><span></span>`;
  chatHistory.appendChild(typingDiv);
  scrollToBottom();

  const parts = [{ text: prompt }];

  if (imageInput.files.length > 0) {
    const file = imageInput.files[0];
    const base64 = await toBase64(file);
    parts.unshift({
      inlineData: {
        mimeType: file.type,
        data: base64.split(',')[1],
      },
    });
    const imgPreview = document.createElement("img");
    imgPreview.src = base64;
    imgPreview.className = "image-preview";
    userDiv.appendChild(imgPreview);
  }

  conversationHistory.push({ role: "user", parts });

  try {
    const result = await model.generateContent({ contents: conversationHistory });
    const aiText = result.response.text();
    chatHistory.removeChild(typingDiv);

    const aiDiv = document.createElement("div");
    aiDiv.className = "chat ai fade-in";

    const contentDiv = document.createElement("div");
    contentDiv.className = "ai-content";
    contentDiv.innerHTML = md.render(aiText);
    aiDiv.appendChild(contentDiv);

    const timeStamp = document.createElement("small");
    timeStamp.textContent = getTimeStamp();
    aiDiv.appendChild(timeStamp);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => {
      const plainText = contentDiv.innerText;
      const newText = prompt("Edit Balasan AI:", plainText);
      if (newText !== null) {
        contentDiv.innerHTML = md.render(newText);
        hljs.highlightAll();
      }
    };
    aiDiv.appendChild(editBtn);

    const speakBtn = document.createElement("button");
    speakBtn.textContent = "🔊 Dengarkan";
    speakBtn.className = "speak-btn";
    speakBtn.onclick = () => {
      const utterance = new SpeechSynthesisUtterance(contentDiv.innerText);
      speechSynthesis.speak(utterance);
    };
    aiDiv.appendChild(speakBtn);

    chatHistory.appendChild(aiDiv);
    hljs.highlightAll();
    scrollToBottom();

    aiDiv.querySelectorAll('pre code').forEach(block => {
      const lang = block.className.split('-')[1] || 'text';
      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';

      const label = document.createElement('div');
      label.className = 'code-lang-label';
      label.textContent = lang;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Salin';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(block.textContent);
        copyBtn.textContent = '✅ Tersalin!';
        setTimeout(() => copyBtn.textContent = 'Salin', 1500);
      };

      const pre = block.parentElement;
      pre.parentElement.replaceChild(wrapper, pre);
      wrapper.appendChild(label);
      wrapper.appendChild(copyBtn);
      wrapper.appendChild(pre);
    });

    conversationHistory.push({ role: "model", parts: [{ text: aiText }] });
    output.textContent = "";
    promptInput.value = "";
    imageInput.value = "";

    if (sessionSelector.value) {
      saveSession(sessionSelector.value, conversationHistory);
    }
  } catch (e) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "chat error";
    errorDiv.textContent = "Error: " + e.message;
    chatHistory.appendChild(errorDiv);
    scrollToBottom();
    output.textContent = "";
  }
};

function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
  });
}

function getTimeStamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

document.getElementById("saveChatBtn").onclick = () => {
  const blob = new Blob([chatHistory.innerText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chat-history.txt";
  a.click();
};

document.getElementById("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(conversationHistory)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chat-history.json";
  a.click();
};

document.getElementById("importBtn").onclick = () => {
  document.getElementById("importInput").click();
};

document.getElementById("importInput").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const history = JSON.parse(reader.result);
      chatHistory.innerHTML = "";
      conversationHistory.length = 0;
      history.forEach((msg) => {
        const div = document.createElement("div");
        div.className = "chat " + (msg.role === "user" ? "user" : "ai");
        div.innerText = msg.parts[0].text;
        chatHistory.appendChild(div);
        conversationHistory.push(msg);
      });
    } catch (err) {
      alert("Gagal memuat file JSON.");
    }
  };
  reader.readAsText(file);
};

const sessionSelector = document.getElementById("sessionSelector");
const sessionNameInput = document.getElementById("sessionName");
const newSessionBtn = document.getElementById("newSessionBtn");

function saveSession(name, history) {
  localStorage.setItem(`session:${name}`, JSON.stringify(history));
}

function loadSession(name) {
  chatHistory.innerHTML = "";
  conversationHistory = [];
  const saved = JSON.parse(localStorage.getItem(`session:${name}`) || "[]");
  saved.forEach(msg => {
    const div = document.createElement("div");
    div.className = "chat " + (msg.role === "user" ? "user" : "ai");
    div.innerText = msg.parts[0].text;
    chatHistory.appendChild(div);
  });
  conversationHistory = saved;
}

function updateSessionList() {
  sessionSelector.innerHTML = "";
  Object.keys(localStorage)
    .filter(k => k.startsWith("session:"))
    .forEach(k => {
      const name = k.split(":")[1];
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sessionSelector.appendChild(opt);
    });
}

newSessionBtn.onclick = () => {
  const name = sessionNameInput.value.trim();
  if (name) {
    saveSession(name, []);
    updateSessionList();
    sessionSelector.value = name;
    loadSession(name);
  }
};

const deleteSessionBtn = document.getElementById("deleteSessionBtn");
deleteSessionBtn.onclick = () => {
  const sessionToDelete = sessionSelector.value;
  if (!sessionToDelete) return alert("Pilih sesi yang ingin dihapus.");
  const confirmDelete = confirm(`Yakin ingin menghapus sesi "${sessionToDelete}"?`);
  if (!confirmDelete) return;
  localStorage.removeItem(`session:${sessionToDelete}`);
  updateSessionList();
  chatHistory.innerHTML = "";
  conversationHistory = [];
  sessionSelector.value = "";
};

sessionSelector.onchange = () => {
  loadSession(sessionSelector.value);
};
updateSessionList();

const promptTemplate = document.getElementById("promptTemplate");
promptTemplate.onchange = () => {
  if (promptTemplate.value) {
    promptInput.value = promptTemplate.value;
    promptInput.focus();
  }
};

const micBtn = document.getElementById("micBtn");
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.interimResults = false;

  micBtn.onclick = () => {
    micBtn.textContent = "🎙️...";
    recognition.start();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    promptInput.value = transcript;
    micBtn.textContent = "🎤";
  };

  recognition.onerror = () => {
    micBtn.textContent = "🎤";
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Browser tidak mendukung speech recognition";
}

maybeShowApiKeyBanner(API_KEY);
