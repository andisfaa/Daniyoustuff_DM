# DaniyouStuff.co — Website Pemesanan & Sewa Papan Akrilik Aesthetic

Website katalog dan layanan sewa papan akrilik aesthetic untuk berbagai momen spesial seperti wisuda, seminar hasil, ulang tahun, dan perayaan lainnya. Dibangun menggunakan **Python Django**, **Django Template Language**, dan **Custom CSS Design System**.

Tampilan antarmuka mengusung tema *warm earthy aesthetic* (`#EEEBDA`, `#715330`), tipografi elegan (*Playfair Display*, *Inter*, *DM Sans*), serta pengalaman pengguna yang responsif di perangkat mobile maupun desktop.

---

## ✨ Fitur Utama

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

## 🛠️ Teknologi yang Digunakan

- **Backend**: Python 3, Django Framework
- **Frontend**: HTML5, CSS3 (Custom Responsive Design System), JavaScript (Vanilla)
- **Database**: MySQL / SQLite
- **Static Assets & Deployment**: WhiteNoise, Gunicorn

---

## 🚀 Panduan Menjalankan Proyek

### 1. Kloning Repositori
```bash
git clone https://github.com/andisfaa/Daniyoustuff_DM.git
cd Daniyoustuff_DM
```

### 2. Buat & Aktifkan Virtual Environment
```bash
# Windows
python -m venv env
.\env\Scripts\activate

# macOS / Linux
python3 -m venv env
source env/bin/activate
```

### 3. Pasang Dependencies
```bash
pip install -r requirements.txt
```

### 4. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`, lalu sesuaikan konfigurasi database dan kunci rahasia aplikasi:
```bash
cp .env.example .env
```

### 5. Jalankan Migrasi Database
```bash
python manage.py migrate
```

### 6. Jalankan Server Pengembangan
```bash
python manage.py runserver
```

Buka peramban (browser) di alamat:  
👉 **http://127.0.0.1:8000/**

---

## 📁 Struktur Folder Proyek

```
Daniyoustuff_DM/
├── daniyou/                 # Konfigurasi utama Django (settings, urls, wsgi)
├── store/                   # Aplikasi inti (views, models, templatetags)
├── static/                  # Aset statis (CSS, gambar katalog, logo)
├── templates/               # Template antarmuka HTML
├── manage.py                # Command line utility Django
├── requirements.txt         # Daftar paket dan dependensi Python
├── Procfile                 # Konfigurasi deployment server
└── .env.example             # Contoh template konfigurasi environment
```

---

## 📄 Lisensi & Hak Cipta

Hak Cipta &copy; DaniyouStuff.co. Seluruh hak cipta dilindungi undang-undang.
