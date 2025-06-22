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
- Dibuat struktur `index.html`:
  - `#greeting-screen` untuk tampilan awal
  - `#chat-screen` untuk sesi chat aktif
  - Input prompt, tombol 🎤, 📎, dan kirim
- Sistem pemisahan antara **Greeting** dan **Chat History**
- Tombol ⚙️ awal (menggunakan `<details>`) diganti menjadi **sidebar geser dari kanan**
- Sidebar berisi:
  - Max Token
  - Tambah/Hapus Sesi
  - Export/Import JSON
  - Simpan Chat TXT
- Dilengkapi animasi `transition: right 0.3s ease`

### 🛠️ Perbaikan Bug
- Memindahkan logika tombol salin ke dalam blok AI response untuk mencegah error `aiDiv is not defined`.
- Menghilangkan overflow scroll horizontal pada bubble user & AI.
- Penyesuaian input & tampilan agar tetap nyaman digunakan di perangkat mobile.
- Greeting otomatis hilang saat:
  - Mengirim pesan
  - Memilih suggestion chip
  - Mulai mengetik
- CSS diperbaiki untuk mencegah scrollbar tidak perlu
- Setelah kirim chat:
  - Input prompt otomatis `focus()`
  - Scroll otomatis ke bawah

### 🎨 Perbaikan Tampilan
- Merubah total tampilan desain UI awal.
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
### 📌 1. Mode Chat Multi-Model
- Pilihan GPT, Gemini, Claude, dsb.

### 📌 2. Riwayat Chat Global
- Nama otomatis per sesi
- Daftar semua sesi tersimpan

### 📌 3. Penyempurnaan UI
- Mode minimal
- Sidebar geser di mobile
- Notifikasi kecil (toaster)

### 📌 4. Speech Recognition Canggih
- Teks interim saat bicara
- Dukungan multi-bahasa

### 📌 5. Dukungan Gambar & Visual
- Viewer gambar hasil AI
- Pratinjau visual di chat

### 📌 6. Export HTML / Markdown
- Simpan sesi sebagai `.html` atau `.md`

### 📌 7. Mode Offline / Cache
- Simpan prompt favorit
- PWA mode untuk offline

## 🧑‍💻 Dibuat oleh
Ananda A. Handyanto — 2025