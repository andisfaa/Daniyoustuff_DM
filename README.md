# DaniyouStuff.co — Python Flask Website

Website DaniyouStuff.co yang dibangun 100% menggunakan bahasa **Python (Flask + Jinja2 + CSS Global Design System)** di dalam virtual environment `envsifaa`.

Tampilan UI/UX, warna palet (*warm earthy aesthetic* `#EEEBDA`, `#715330`, `#AAAAAA`), font (*Playfair Display*, *Inter*, *DM Sans*), animasi floating boards & orbs, serta seluruh aset foto katalog disesuaikan persis dari website React sebelumnya.

---

## 🚀 Cara Menjalankan

### Cara 1: Menggunakan file Batch (Paling Mudah)
Cukup double-click file:
```
d:\DANIYOU PROJECT\envsifaa\run.bat
```

### Cara 2: Melalui Terminal / PowerShell
```powershell
cd "d:\DANIYOU PROJECT\envsifaa"
.\Scripts\python.exe app.py
```

Buka browser di:
👉 **http://127.0.0.1:5000/**

---

## 📁 Struktur Proyek di `envsifaa`

```
envsifaa/
├── app.py                     # Server backend Flask (routes, context, cart session, auth demo, integrasi WA)
├── run.bat                    # Script cepat untuk menjalankan server
├── static/
│   ├── css/
│   │   └── style.css          # Design system lengkap (warm earthy, responsive, animasi)
│   └── img/                   # Direktori utama aset foto lokal
│       ├── LOGO DANIYOUSTUFF.CO.png
│       └── Katalog Daniyou/
│           ├── PAPAN BULAT/      # 9 Foto Papan Bulat
│           ├── PAPAN KUBAH/      # 9 Foto Papan Kubah
│           ├── PAPAN FLOWERBOX/  # 2 Foto Flowerbox
│           └── PAPAN BESAR/      # 4 Foto Papan Besar
└── templates/
    ├── base.html              # Layout utama (Navbar glassmorphism, search & cart badge + Footer)
    ├── index.html             # Halaman Beranda (Hero, Highlights, Featured, Cara Kerja Fullscreen, Testimoni)
    ├── catalog.html           # Halaman Katalog (Sidebar filter, mini kalender 7 kolom rapi, search, sorting)
    ├── product_detail.html    # Halaman Detail Produk (Gallery thumbnails, kustom teks, direct order WA)
    ├── about.html             # Halaman About & Portfolio Gallery (Foto asli katalog + Lightbox popup)
    ├── login.html             # Halaman Masuk / Daftar (Panel split + dekorasi foto floating aman)
    ├── cart.html              # Halaman Keranjang Belanja (Ringkasan sewa + Checkout otomatis ke WhatsApp)
    └── order_tracking.html    # Halaman Lacak Status Pesanan
```

---

## ✨ Fitur & Pembaruan Terkini

1. **Aset Gambar Lokal Terpusat di `static/img/`**:
   - Seluruh 24 foto katalog dan logo DaniyouStuff.co disimpan di `envsifaa/static/img/`.
   - Dapat diakses baik via Flask static URL (`/static/img/...`) maupun custom route (`/img/...`) dengan status HTTP 200 OK.
2. **Integrasi WhatsApp Dinamis Sesuai Varian & Teks Kustom**:
   - **Halaman Detail Produk**: Tombol *Pesan via WhatsApp* secara otomatis merangkai pesan chat berisi nama produk, ukuran, varian warna/model terpilih, nama/gelar wisudawan, ucapan acara, tanggal acara, serta catatan khusus.
   - **Halaman Keranjang Sewa**: Tombol *Checkout via WhatsApp* merangkum seluruh item keranjang beserta seluruh varian dan teks kustom tiap produk, rincian biaya sewa, dan total pembayaran.
3. **Mini Kalender 7 Kolom Rapi**:
   - Menggunakan format grid matriks 7 kolom (`Min` - `Sab`).
   - Menyertakan tanggal overflow dari bulan sebelumnya dan berikutnya dengan warna abu-abu lembut (*muted*).
   - Tanggal yang dipilih ditampilkan dengan highlight lingkaran solid cokelat tua (`#715330`) elegan dan angka putih di tengah.
   - Dilengkapi navigasi bulan `<` dan `>`.
4. **Section "Cara Kerja" Full Screen (*100vh*)**:
   - Section *Pesan Sekarang, Foto Besok* memiliki tinggi penuh layar (*min-height: 100vh*) dengan tata letak vertikal presisi di tengah.
   - Angka langkah `01`, `02`, `03`, `04` berwarna putih solid kontras tinggi (`font-weight: 800`) dengan bayangan halus, sangat tajam dan mudah dibaca.
   - Dilengkapi aturan seleksi teks (`::selection`) bersih berwarna emas tanpa distorsi warna.
5. **Halaman About & Portofolio Bersih**:
   - Memperbaiki duplikasi banner CTA (hanya ada satu banner penutup yang proporsional di atas footer).
   - Filter tab kategori portofolio dan modal Lightbox untuk memperbesar foto resolusi penuh.
6. **Halaman Masuk / Daftar Rapi**:
   - Tata letak panel kiri menggunakan flexbox aman dengan margin proporsional sehingga 3 lingkaran foto papan melayang tidak terpotong tepi layar atau tertimpa oleh kotak formulir login.
