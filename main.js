import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from "markdown-it";
import { maybeShowApiKeyBanner } from "./gemini-api-banner";
import "./style.css";

let API_KEY = "AIzaSyC9_12RrRvL_7i-t6NEbHd0qJXYVZsFb-g";

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

// Dark mode toggle
const toggle = document.getElementById("darkModeToggle");
if (localStorage.getItem("dark-mode") === "true") {
  document.body.classList.add("dark");
  toggle.checked = true;
}
toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark-mode", toggle.checked);
});

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

form.onsubmit = async (ev) => {
  ev.preventDefault();
  const prompt = promptInput.value;
  output.textContent = "Lagi Loading nihhhhh...";

  const userDiv = document.createElement("div");
  userDiv.className = "chat user";
  userDiv.innerText = prompt;
  chatHistory.appendChild(userDiv);

  const typingDiv = document.createElement("div");
  typingDiv.className = "chat ai typing-indicator fade-in";
  typingDiv.innerHTML = `<span></span><span></span><span></span>`;
  chatHistory.appendChild(typingDiv);
  scrollToBottom();

  const parts = [{ text: prompt }];

  // Tambahkan gambar jika ada
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
    aiDiv.innerHTML = md.render(aiText);
    chatHistory.appendChild(aiDiv);
hljs.highlightAll(); // ini WAJIB agar syntax highlight aktif
scrollToBottom();


    hljs.highlightAll(); // render ulang block code yang baru dimasukkan ke DOM

    // ✅ Tambahkan tombol salin dan label bahasa
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
console.log('added copy button');

      wrapper.appendChild(pre);
    });

    conversationHistory.push({ role: "model", parts: [{ text: aiText }] });

    output.textContent = "";
    promptInput.value = "";
    imageInput.value = "";
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

maybeShowApiKeyBanner(API_KEY);
