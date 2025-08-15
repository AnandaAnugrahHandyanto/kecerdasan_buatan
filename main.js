import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from "markdown-it";
import "./style.css";

let API_KEY = 'AIzaSyC9_12RrRvL_7i-t6NEbHd0qJXYVZsFb-g';

const form = document.getElementById("imageForm");
const promptInput = document.getElementById("promptInput");
const imageInput = document.getElementById("imageInput");
const chatHistory = document.getElementById("chat-history");
const sendButton = form.querySelector('.send-button');
const uploadBtn = document.getElementById("uploadBtn");
const micBtn = document.getElementById("micBtn");

const greetingScreen = document.getElementById("greeting-screen");
const chatScreen = document.getElementById("chat-screen");

const themeSelector = document.getElementById("themeSelector");
const settingsPanel = document.getElementById("settingsPanel");
const maxTokensInput = document.getElementById("maxTokens");
const sessionSelector = document.getElementById("sessionSelector");
const sessionNameInput = document.getElementById("sessionName");
const newSessionBtn = document.getElementById("newSessionBtn");
const deleteSessionBtn = document.getElementById("deleteSessionBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");
const saveChatBtn = document.getElementById("saveChatBtn");
const promptTemplate = document.getElementById("promptTemplate");
const suggestionChips = document.querySelector(".suggestion-chips");

let conversationHistory = [];

let md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
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
  setTimeout(() => { // Tambahkan setTimeout untuk penundaan kecil
    requestAnimationFrame(() => {
      if (chatHistory) { // Tambahkan pengecekan null/undefined
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    });
  }, 50); // Penundaan 50ms
}

function getTimeStamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
  });
}

const genAI = new GoogleGenerativeAI(API_KEY);
let chatSession;

function initializeChatSession() {
  const maxOutputTokens = parseInt(maxTokensInput.value || "2048"); // Default 2048 jika kosong
  chatSession = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      { category: HarmCategory.HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
  }).startChat({
    history: conversationHistory,
    generationConfig: {
      maxOutputTokens: maxOutputTokens,
    },
  });
}

initializeChatSession();

const sendMessage = async () => {
  const prompt = promptInput.value.trim();
  if (!prompt && (!imageInput || imageInput.files.length === 0)) return;

  if (greetingScreen && chatScreen) {
    greetingScreen.classList.remove("active");
    chatScreen.classList.add("active");
  }

  promptInput.disabled = true;
  sendButton.disabled = true;
  if (uploadBtn) uploadBtn.disabled = true;
  if (micBtn && (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window))) {
     micBtn.disabled = true;
  }

  const userDiv = document.createElement("div");
  userDiv.className = "chat user fade-in";
  const userContentDiv = document.createElement("div");
  userContentDiv.textContent = prompt;
  userDiv.appendChild(userContentDiv);
  userDiv.innerHTML += `<small>${getTimeStamp()}</small>`;
  chatHistory.appendChild(userDiv);

  const typingDiv = document.createElement("div");
  typingDiv.className = "chat ai typing-indicator fade-in";
  typingDiv.innerHTML = `<span></span><span></span><span></span>`;
  chatHistory.appendChild(typingDiv);
  scrollToBottom();

  const parts = [{ text: prompt }];

  let imageFile = null;
  if (imageInput && imageInput.files.length > 0) {
    imageFile = imageInput.files[0];
    const base64 = await toBase64(imageFile);
    parts.unshift({
      inlineData: {
        mimeType: imageFile.type,
        data: base64.split(',')[1],
      },
    });
    const imgPreview = document.createElement("img");
    imgPreview.src = base64;
    imgPreview.className = "image-preview";
    userContentDiv.appendChild(imgPreview);
  }

  conversationHistory.push({ role: "user", parts });
  initializeChatSession();

  try {
    const result = await chatSession.sendMessage(parts);
    const aiText = result.response.text();

    if (chatHistory.contains(typingDiv)) {
      chatHistory.removeChild(typingDiv);
    }

    const aiDiv = document.createElement("div");
    aiDiv.className = "chat ai fade-in";

    const contentDiv = document.createElement("div");
    contentDiv.className = "ai-content typing-text";
    aiDiv.appendChild(contentDiv);

    chatHistory.appendChild(aiDiv);
    scrollToBottom();

    typeTextSmoothly(contentDiv, aiText, 15, () => {
    contentDiv.innerHTML = md.render(aiText);
    hljs.highlightAll();
    });


    const timeStamp = document.createElement("small");
    timeStamp.textContent = getTimeStamp();
    aiDiv.appendChild(timeStamp);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "8px";
    buttonContainer.style.marginTop = "10px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => {
      const plainText = contentDiv.innerText;
      const newText = prompt("Edit Balasan AI:", plainText);
      if (newText !== null) {
        contentDiv.innerHTML = md.render(newText);
        hljs.highlightAll();
        const lastAiMessageIndex = conversationHistory.map(item => item.role).lastIndexOf("model");
        if (lastAiMessageIndex !== -1) {
          conversationHistory[lastAiMessageIndex].parts[0].text = newText;
        }
      }
    };
    buttonContainer.appendChild(editBtn);

    const speakBtn = document.createElement("button");
    speakBtn.textContent = "🔊 Dengarkan";
    speakBtn.className = "speak-btn";
    speakBtn.onclick = () => {
      const utterance = new SpeechSynthesisUtterance(contentDiv.innerText);
      speechSynthesis.speak(utterance);
    };
    buttonContainer.appendChild(speakBtn);
    aiDiv.appendChild(buttonContainer);

    chatHistory.appendChild(aiDiv);

    aiDiv.querySelectorAll('pre code').forEach(block => {
      const lang = block.className.split(' ').find(cls => cls.startsWith('language-'))?.replace('language-', '') || 'text';
      if (typeof hljs !== 'undefined' && hljs.getLanguage(lang) && !block.classList.contains('hljs')) {
        hljs.highlightElement(block);
      }

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

      const originalPre = block.parentElement;
      if (originalPre && originalPre.tagName === 'PRE') {
        originalPre.parentElement.replaceChild(wrapper, originalPre);
        wrapper.appendChild(label);
        wrapper.appendChild(copyBtn);
        wrapper.appendChild(originalPre);
      }
    });

    scrollToBottom();

    conversationHistory.push({ role: "model", parts: [{ text: aiText }] });
    promptInput.value = "";
    promptInput.style.height = 'auto';
    if (imageInput) imageInput.value = "";
    if (uploadBtn) uploadBtn.style.color = 'var(--gemini-light-text)';

    if (sessionSelector.value) {
      saveSession(sessionSelector.value, conversationHistory);
    }

  } catch (e) {
    if (chatHistory.contains(typingDiv)) {
      chatHistory.removeChild(typingDiv);
    }
    // const errorDiv = document.createElement("div");
    // errorDiv.className = "chat error fade-in";
    // errorDiv.textContent = "Error: " + e.message;
    chatHistory.appendChild(errorDiv);
    scrollToBottom();
    console.error("Gemini API Error:", e);
  } finally {
    promptInput.disabled = false;
    sendButton.disabled = false;
    if (uploadBtn) uploadBtn.disabled = false;
    if (micBtn) micBtn.disabled = false;
    promptInput.focus();
  }
};

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    sendMessage();
  });
}

if (promptInput) {
  promptInput.addEventListener("input", () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = promptInput.scrollHeight + 'px';

    if (greetingScreen && chatScreen && greetingScreen.classList.contains("active")) {
      greetingScreen.classList.remove("active");
      chatScreen.classList.add("active");
    }
  });
  promptInput.addEventListener("blur", () => {
    if (promptInput.value.trim() === "" && chatHistory.children.length === 0) {
      chatScreen.classList.remove("active");
      greetingScreen.classList.add("active");
    }
  });
}

if (uploadBtn && imageInput) {
  imageInput.addEventListener('change', () => {
    if (imageInput.files.length > 0) {
      uploadBtn.style.color = 'var(--gemini-accent-blue)';
    } else {
      uploadBtn.style.color = 'var(--gemini-light-text)';
    }
  });
}

if (micBtn) {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;

    micBtn.onclick = () => {
      micBtn.innerHTML = `<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3.03-2.43 5.5-5.46 5.5-3.03 0-5.5-2.47-5.5-5.5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.41 6-6.92h-1.7z"></path></svg>`;
      recognition.start();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      promptInput.value = transcript;
      promptInput.style.height = 'auto';
      promptInput.style.height = promptInput.scrollHeight + 'px';
      micBtn.innerHTML = `🎤`;
      
      if (promptInput.value.trim() !== "" && greetingScreen?.classList.contains("active")) {
        greetingScreen.classList.remove("active");
        chatScreen?.classList.add("active");
      }
    };

    recognition.onerror = () => {
      micBtn.innerHTML = `🎤`;
      console.error("Speech recognition error");
    };

    recognition.onend = () => {
        micBtn.innerHTML = `🎤`;
    };

  } else {
    micBtn.disabled = true;
    micBtn.title = "Browser tidak mendukung Speech Recognition.";
  }
}

if (suggestionChips) {
  suggestionChips.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const promptText = e.target.textContent;
      if (promptText) {
        promptInput.value = promptText;
        promptInput.focus();
        promptInput.style.height = 'auto';
        promptInput.style.height = promptInput.scrollHeight + 'px';
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }
    }
  });
}

if (themeSelector) {
  function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("selected-theme", theme);
  }
  themeSelector.addEventListener("change", () => {
    applyTheme(themeSelector.value);
  });
  const savedTheme = localStorage.getItem("selected-theme") || "minimal";
  themeSelector.value = savedTheme;
  applyTheme(savedTheme);
}

function saveSession(name, history) {
  if (name && history) {
    localStorage.setItem(`session:${name}`, JSON.stringify(history));
  }
}

function loadSession(name) {
  chatHistory.innerHTML = "";
  conversationHistory = [];
  const saved = JSON.parse(localStorage.getItem(`session:${name}`) || "[]");
  saved.forEach(msg => {
    const chatDiv = document.createElement("div");
    chatDiv.className = `chat ${msg.role} fade-in`;
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = md.render(msg.parts[0].text);
    chatDiv.appendChild(contentDiv);
    chatDiv.innerHTML += `<small>${getTimeStamp()}</small>`;
    chatHistory.appendChild(chatDiv);
  });
  conversationHistory = saved;
  chatHistory.querySelectorAll('pre code').forEach(block => {
    if (typeof hljs !== 'undefined' && !block.classList.contains('hljs')) {
      hljs.highlightElement(block);
    }
  });

  if (saved.length > 0) {
    greetingScreen?.classList.remove("active");
    chatScreen?.classList.add("active");
    scrollToBottom();
  } else {
    chatScreen?.classList.remove("active");
    greetingScreen?.classList.add("active");
  }
  initializeChatSession();
}

function updateSessionList() {
  if (!sessionSelector) return;
  sessionSelector.innerHTML = '<option value="">-- Pilih Sesi --</option>';
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

if (newSessionBtn) {
  newSessionBtn.onclick = () => {
    const name = sessionNameInput.value.trim();
    if (name) {
      saveSession(name, []);
      updateSessionList();
      sessionSelector.value = name;
      loadSession(name);
      sessionNameInput.value = "";
    } else {
      alert("Masukkan nama sesi!");
    }
  };
}

if (deleteSessionBtn) {
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
    chatScreen?.classList.remove("active");
    greetingScreen?.classList.add("active");
    initializeChatSession();
  };
}

if (sessionSelector) {
  sessionSelector.onchange = () => {
    loadSession(sessionSelector.value);
  };
  updateSessionList();
}

if (promptTemplate) {
  promptTemplate.onchange = () => {
    if (promptTemplate.value) {
      promptInput.value = promptTemplate.value;
      promptInput.focus();
      promptInput.style.height = 'auto';
      promptInput.style.height = promptInput.scrollHeight + 'px';

      if (greetingScreen?.classList.contains("active")) {
        greetingScreen.classList.remove("active");
        chatScreen?.classList.add("active");
      }
    }
  };
}

if (saveChatBtn) {
  saveChatBtn.onclick = () => {
    let chatContent = "";
    chatHistory.querySelectorAll('.chat').forEach(chatDiv => {
      const role = chatDiv.classList.contains('user') ? 'Anda' : 'AI';
      const text = chatDiv.querySelector('div')?.innerText || "";
      const time = chatDiv.querySelector('small')?.textContent || "";
      chatContent += `${role} (${time}):\n${text}\n\n`;
    });

    const blob = new Blob([chatContent], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chat-history.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };
}

if (exportBtn) {
  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(conversationHistory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
}

if (importBtn && importInput) {
  importBtn.onclick = () => {
    importInput.click();
  };

  importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const history = JSON.parse(reader.result);
        if (!Array.isArray(history) || !history.every(item => item.role && item.parts)) {
          throw new Error("Invalid chat history format.");
        }
        chatHistory.innerHTML = "";
        conversationHistory = [];
        history.forEach((msg) => {
          const chatDiv = document.createElement("div");
          chatDiv.className = `chat ${msg.role} fade-in`;
          const contentDiv = document.createElement("div");
          contentDiv.innerHTML = md.render(msg.parts[0].text);
          chatDiv.appendChild(contentDiv);
          chatDiv.innerHTML += `<small>${getTimeStamp()}</small>`;

          if (msg.role === "model") {
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "8px";
            buttonContainer.style.marginTop = "10px";

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";
            editBtn.onclick = () => {
                const plainText = contentDiv.innerText;
                const newText = prompt("Edit Balasan AI:", plainText);
                if (newText !== null) {
                    contentDiv.innerHTML = md.render(newText);
                    hljs.highlightAll();
                    const indexInHistory = history.indexOf(msg);
                    if (indexInHistory !== -1) {
                        conversationHistory[indexInHistory].parts[0].text = newText;
                        saveSession(sessionSelector.value, conversationHistory);
                    }
                }
            };
            buttonContainer.appendChild(editBtn);

            const speakBtn = document.createElement("button");
            speakBtn.textContent = "🔊 Dengarkan";
            speakBtn.className = "speak-btn";
            speakBtn.onclick = () => {
                const utterance = new SpeechSynthesisUtterance(contentDiv.innerText);
                speechSynthesis.speak(utterance);
            };
            buttonContainer.appendChild(speakBtn);
            chatDiv.appendChild(buttonContainer);
          }
          chatHistory.appendChild(chatDiv);
          conversationHistory.push(msg);
        });

        hljs.highlightAll();
        scrollToBottom();
        greetingScreen?.classList.remove("active");
        chatScreen?.classList.add("active");
        initializeChatSession();
      } catch (err) {
        alert("Gagal memuat file JSON atau format tidak valid: " + err.message);
        console.error("Import JSON error:", err);
      }
    };
    reader.readAsText(file);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
  updateSessionList();
  if (sessionSelector.value) {
    loadSession(sessionSelector.value);
  } else {
    greetingScreen?.classList.add("active");
    chatScreen?.classList.remove("active");
  }
});

function typeTextSmoothly(element, text, speed = 15, callback) {
  let index = 0;
  function typeChar() {
    if (index < text.length) {
      element.innerText += text.charAt(index);
      index++;
      setTimeout(typeChar, speed);
    } else {
      if (typeof callback === "function") callback();
    }
  }
  typeChar();
}

const aiMessage = document.createElement("div");
aiMessage.className = "chat ai";
aiMessage.textContent = aiResponse;
chatHistory.appendChild(aiMessage);

chatHistory.appendChild(aiMessage);
typeTextSmoothly(aiMessage, aiResponse);

