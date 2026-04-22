# 🥋 Sistem Informasi Kejuaraan Karate Provinsi Bengkulu

Platform resmi informasi dan pendaftaran kejuaraan karate Provinsi Bengkulu, dikelola oleh FORKI Bengkulu.

---

## 📁 Struktur File

```
karatechamp-bengkulu/
├── index.html          ← Halaman utama
├── css/
│   └── style.css       ← Semua styling & tema (dark mode included)
├── js/
│   ├── data.js         ← Data seed & konstanta
│   ├── utils.js        ← Helper functions, storage, toast, dark mode
│   ├── auth.js         ← Login, register, logout
│   ├── events.js       ← Tampilan event, detail, pendaftaran
│   ├── admin.js        ← Panel admin: dashboard, event, peserta
│   └── app.js          ← Routing halaman & inisialisasi
└── README.md           ← Dokumentasi ini
```

---

## 🔐 Akun Demo

| Role    | Username | Password   |
|---------|----------|------------|
| Peserta | `user`   | `user123`  |
| Admin   | `admin`  | `admin123` |

> Data disimpan di **localStorage** browser — tidak ada backend/server.

---

## ✨ Fitur Lengkap

### 👤 Untuk Peserta
- Daftar akun & login
- Halaman profil dengan edit nama, HP, dojo
- Browse event dengan filter kategori, status, wilayah, dan pencarian
- Daftar event (auto pre-fill dari profil)
- Lihat riwayat pendaftaran event sendiri
- Tampilan detail event lengkap (foto, deadline countdown, lokasi)

### 🛡️ Untuk Admin
- Login terpisah dengan akses terbatas
- **Dashboard** dengan 6 stat card, 3 chart (peserta per event, status, kategori), dan daftar pendaftar terbaru
- **Kelola Event**: tambah, edit, hapus, publish/draft, upload foto poster
- **Data Peserta**: filter per event, pencarian, export CSV
- Notifikasi deadline otomatis (badge "X Hari Lagi" muncul jika < 7 hari)

### 🎨 UI & UX
- **Dark Mode** toggle (preferensi disimpan di localStorage)
- **Fully Responsive** — mobile, tablet, desktop
- Ticker berjalan di halaman landing
- Filter wilayah kabupaten/kota Bengkulu
- Upload foto/poster event (base64, maks 3MB)
- Animasi toast notification
- Konfirmasi dialog sebelum hapus data

---

## 🚀 Cara Jalankan Lokal

### Metode 1 — Live Server (VS Code)
1. Install ekstensi **Live Server** oleh Ritwick Dey
2. Buka folder project di VS Code
3. Klik kanan `index.html` → **"Open with Live Server"**
4. Browser terbuka otomatis di `http://127.0.0.1:5500`

### Metode 2 — Python HTTP Server
```bash
cd karatechamp-bengkulu
python -m http.server 8000
# Buka: http://localhost:8000
```

### Metode 3 — Buka langsung
Double-klik `index.html` di File Explorer untuk membukanya di browser.

---

## 🌐 Tutorial Upload ke GitHub & Dapatkan Link (GitHub Pages)

Ikuti langkah-langkah berikut untuk mempublikasikan website ini secara **gratis** menggunakan GitHub Pages. Tidak perlu bayar hosting!

---

### Langkah 1 — Buat Akun GitHub (jika belum punya)

1. Buka **https://github.com** di browser
2. Klik tombol **"Sign up"** di pojok kanan atas
3. Isi:
   - **Username**: misalnya `forki-bengkulu` (ini akan muncul di URL)
   - **Email**: email aktif Anda
   - **Password**: buat password yang kuat
4. Verifikasi email yang dikirim ke inbox Anda
5. Selesai — akun GitHub Anda sudah aktif!

---

### Langkah 2 — Buat Repository Baru

1. Setelah login, klik tombol **"+"** di pojok kanan atas
2. Pilih **"New repository"**
3. Isi form berikut:
   - **Repository name**: `karate-bengkulu` *(atau nama lain sesuai keinginan)*
   - **Description**: `Sistem Informasi Kejuaraan Karate Provinsi Bengkulu`
   - Pilih **"Public"** *(harus Public agar GitHub Pages bisa aktif)*
   - ❌ Jangan centang "Add a README file" (kita akan upload file sendiri)
4. Klik **"Create repository"**

---

### Langkah 3 — Upload File Project

1. Di halaman repository yang baru dibuat, klik **"uploading an existing file"**  
   *(atau klik tombol "Add file" → "Upload files")*

2. **Drag & drop** seluruh isi folder project Anda ke area upload:
   ```
   index.html
   css/
     └── style.css
   js/
     ├── data.js
     ├── utils.js
     ├── auth.js
     ├── events.js
     ├── admin.js
     └── app.js
   README.md
   ```
   
   > **⚠️ Penting:** Pastikan `index.html` ada di **root/akar** repository (bukan di dalam folder lain).

3. Tunggu upload selesai (progress bar akan muncul)

4. Di bagian bawah, pada **"Commit changes"**:
   - Isi pesan commit: `Upload awal website karate bengkulu`
   - Klik **"Commit changes"**

---

### Langkah 4 — Aktifkan GitHub Pages

1. Di halaman repository Anda, klik **"Settings"** (tab paling kanan)
2. Scroll ke bawah, cari bagian **"Pages"** di sidebar kiri
3. Di bagian **"Branch"**, klik dropdown yang bertuliskan `None`
4. Pilih **`main`** (atau `master` jika tertulis master)
5. Pastikan folder tetap `/root`
6. Klik **"Save"**

---

### Langkah 5 — Dapatkan Link Website

1. Setelah klik Save, halaman akan refresh
2. Akan muncul kotak hijau/biru bertuliskan:  
   **"Your site is live at https://USERNAME.github.io/NAMA-REPO/"**

3. **Format URL GitHub Pages Anda:**
   ```
   https://USERNAME.github.io/NAMA-REPO/
   ```
   Contoh:
   ```
   https://forki-bengkulu.github.io/karate-bengkulu/
   ```

4. Klik link tersebut — website Anda sudah **online dan bisa diakses siapa saja!** 🎉

> **⏰ Catatan:** Kadang butuh waktu 1–5 menit setelah aktivasi untuk website bisa diakses. Refresh halaman jika belum muncul.

---

### Langkah 6 — Update File (Jika Ada Perubahan)

Jika Anda ingin mengubah konten website setelah diupload:

**Cara A — Upload ulang via web:**
1. Buka repository di GitHub
2. Klik file yang ingin diubah (misal `js/data.js`)
3. Klik ikon **pensil (✏️)** untuk edit langsung
4. Edit isi file
5. Klik **"Commit changes"**
6. Website otomatis update dalam 1–2 menit

**Cara B — Upload file baru:**
1. Klik **"Add file"** → **"Upload files"**
2. Upload file yang sudah diperbarui
3. GitHub akan otomatis menggantikan file lama
4. Klik **"Commit changes"**

---

### 🔗 Cara Membagikan Link

Setelah website online, Anda bisa membagikan link:
```
https://USERNAME.github.io/NAMA-REPO/
```

Link ini bisa:
- ✅ Dibagikan via WhatsApp, Instagram, Telegram
- ✅ Dibuka di HP maupun komputer
- ✅ Diakses dari seluruh Indonesia (bahkan dunia)
- ✅ GRATIS selamanya (selama repository bersifat Public)

---

## 💡 Tips & Pengembangan

| Fitur | Deskripsi |
|-------|-----------|
| **Domain Custom** | Bisa pakai domain sendiri (cth: `karatebengkulu.id`) via pengaturan Pages |
| **Reset Data** | DevTools → Application → Local Storage → Clear All |
| **Ubah Warna** | Edit variabel di `:root` di `css/style.css` |
| **Tambah Event Dummy** | Edit array `SEED_EVENTS` di `js/data.js` |
| **Tambah Halaman** | Buat `<div class="page" id="page-baru">` di HTML, panggil `showPage('page-baru')` |

---

## 📝 Catatan Teknis

- Semua data tersimpan di **localStorage** browser pengguna
- Upload foto event disimpan sebagai **base64** di localStorage (maks 3MB per foto)
- Tidak ada backend — 100% frontend statis
- Kompatibel dengan semua browser modern (Chrome, Firefox, Edge, Safari)

---

*Dikembangkan untuk FORKI Provinsi Bengkulu — Memajukan Karate Bengkulu* 🥋
