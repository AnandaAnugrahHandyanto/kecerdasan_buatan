# Catatan Perubahan (Changelog)

Semua perubahan penting pada proyek ini didokumentasikan di sini.

---

## [Belum Dirilis]

### ✨ Fitur Baru
- **Setup awal proyek**: integrasi Gemini API, input prompt, dan tampilan awal bubble chat.
- **Dukungan upload gambar**: pengguna dapat memilih gambar, melihat preview, dan mengirim ke AI.
- **Tampilan riwayat chat**: semua percakapan ditampilkan berurutan dengan auto-scroll ke bawah.
- **Mode Gelap (Dark Mode)**: toggle tersedia di header, disimpan di localStorage.
- **Animasi "sedang mengetik"**: AI menampilkan animasi titik-titik saat proses loading jawaban.
- **Highlight kode otomatis**: semua blok kode ditampilkan dengan syntax highlighting menggunakan `highlight.js`.
- **Label bahasa dan tombol salin**: setiap blok kode kini menampilkan jenis bahasa dan tombol “Salin”.
- Tambah **multichat session**: simpan/load percakapan via localStorage
- Tambah **prompt preset/template**: dropdown untuk gaya prompt
- Tambah **input suara (speech to text)** menggunakan Web Speech API
- Tambah **ekspor chat** ke `.md`, `.txt`, dan `.json`
- Tambah **tombol Edit** dan **Dengarkan** di setiap balasan AI
- Tambah **dropdown tema UI** (dark, minimal, cyberpunk, dll)

### 🛠️ Perbaikan Bug
- Memindahkan logika tombol salin ke dalam blok AI response untuk mencegah error `aiDiv is not defined`.
- Menghilangkan overflow scroll horizontal pada bubble user & AI.
- Penyesuaian input & tampilan agar tetap nyaman digunakan di perangkat mobile.

### 🎨 Perbaikan Tampilan
- Perbaikan desain UI bubble chat, warna, padding, dan radius.
- Penyesuaian tema mode gelap agar semua elemen tetap terbaca dengan nyaman.
- Tampilan blok kode lebih modern: latar gelap, label atas, dan tombol salin yang interaktif.

---
## 🗓️ 2025-06-22

### ✅ Commit: Inisialisasi Telegram Bot
```
feat: add working Telegram bot using Gemini API
```

### 📁 Perubahan
- Menambahkan `bot.js` berisi logika dasar Telegram bot
- Menambahkan `.env` untuk konfigurasi token dan API key
- Menambahkan `package.json` untuk dependensi:
  - `node-telegram-bot-api`
  - `@google/generative-ai`
  - `dotenv`

## 🎯 Rencana Selanjutnya
### 1. ✨ Menyimpan Riwayat Percakapan per Pengguna (Telegram)
- Tujuan: agar tiap pengguna bisa lanjutkan percakapan mereka
- Teknologi: Gunakan JSON per `chatId`, atau database ringan (lowdb)

### 2. 🧠 Dukungan Perintah Khusus
- Contoh: `/help`, `/clear`, `/model`, `/prompt`
- Bisa pakai regex atau perintah TelegramBotAPI

### 3. 🌐 Webhook Support
- Tujuan: Bisa deploy di server seperti Vercel/Render dengan webhook
- Alternatif polling

### 4. 🔄 Integrasi Langchain atau RAG
- Bisa tanya berdasarkan dokumen lokal (PDF/Markdown)
- Butuh middleware tambahan

### 5. 🗣️ Mode Suara (Text-to-Speech Response)
- Bot kirim voice message bukan teks saja
- Pakai `gTTS` atau API seperti Google Cloud Text-to-Speech
---

## 🧑‍💻 Dibuat oleh
Ananda A. Handyanto — 2025