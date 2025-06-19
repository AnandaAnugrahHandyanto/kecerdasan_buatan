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

### 🛠️ Perbaikan Bug
- Memindahkan logika tombol salin ke dalam blok AI response untuk mencegah error `aiDiv is not defined`.
- Menghilangkan overflow scroll horizontal pada bubble user & AI.
- Penyesuaian input & tampilan agar tetap nyaman digunakan di perangkat mobile.

### 🎨 Perbaikan Tampilan
- Perbaikan desain UI bubble chat, warna, padding, dan radius.
- Penyesuaian tema mode gelap agar semua elemen tetap terbaca dengan nyaman.
- Tampilan blok kode lebih modern: latar gelap, label atas, dan tombol salin yang interaktif.

---

## 🎯 Rencana Selanjutnya
- [ ] Menambahkan tombol “Edit” di setiap balasan AI.
- [ ] Menampilkan waktu (timestamp) pada setiap pesan.
- [ ] Menyimpan riwayat chat ke file lokal.
- [ ] Opsi pengaturan sistem prompt dan pengaturan lanjutan lainnya.

---

