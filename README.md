# Juru — Asisten Bahasa Inggris

Aplikasi web untuk penutur bahasa Indonesia yang bekerja dengan bahasa Inggris.

- **Terjemahkan:** Inggris ↔ Indonesia, dengan pilihan nada **formal** atau **santai**
- **Perbaiki:** tulisan bahasa Inggrismu dirapikan, lengkap dengan letak setiap kesalahan, seharusnya bagaimana, alasannya, dan artinya dalam bahasa Indonesia
- **Pahami:** penjelasan maksud sebuah kalimat, idiom, atau email, termasuk nada dan ungkapan pentingnya
- **Input suara:** tekan ikon mikrofon untuk mendikte (Chrome, Edge, atau Safari)
- **Pilih AI-nya sendiri:** Gemini, ChatGPT (OpenAI), atau Claude (Anthropic)
- **Bisa dipasang di HP:** punya ikon di layar utama, terbuka layar penuh, dan tetap terbuka walau sedang offline

Aplikasinya ada di `index.html`, ditambah `manifest.webmanifest`, `sw.js`, dan folder `icons/` supaya bisa dipasang di HP. Tanpa server dan tanpa proses build.

## Mengaktifkan GitHub Pages

1. Buka **Settings → Pages** di repo ini
2. Di bagian **Build and deployment**, pilih **Source: Deploy from a branch**
3. Pilih branch **main** dan folder **/ (root)**, lalu tekan **Save**
4. Tunggu 1–2 menit. Aplikasinya bisa dibuka di `https://rsukmanagara.github.io/juru/`

## Memasang di HP

- **iPhone:** buka aplikasinya di Safari, ketuk tombol Bagikan, pilih **Tambah ke Layar Utama**, lalu ketuk **Tambah**. Isi ulang API key sekali saat pertama membukanya dari layar utama, karena aplikasi yang dipasang di iPhone punya penyimpanan sendiri.
- **Android:** buka di Chrome, lalu ketuk **Pasang** di banner atas. Bisa juga lewat menu ⋮ → **Instal aplikasi**.

Fitur AI tetap butuh internet, tapi aplikasinya sendiri tetap bisa dibuka saat offline.

## Menyiapkan API key

Buka aplikasinya, tekan ikon kunci di kanan atas, lalu isi minimal satu key:

| AI | Tempat ambil key | Biaya |
| --- | --- | --- |
| Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Ada kuota gratis dengan batas per menit dan per hari |
| ChatGPT | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Bayar sesuai pemakaian, isi saldo dulu |
| Claude | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) | Bayar sesuai pemakaian, isi saldo dulu |

Langganan ChatGPT Plus, Gemini Advanced, atau Claude Pro **tidak** termasuk akses API. API key dibuat dan ditagih terpisah.

Tekan **Tes koneksi** untuk memastikan key-nya benar. Tes ini juga memuat daftar model yang tersedia untuk key-mu, dan model mana pun dari daftar itu bisa kamu isi di kolom **Model lain**.

## Server Juru: cukup PIN di setiap perangkat

Supaya tidak perlu mengisi API key di setiap HP atau laptop, pasang **Server Juru** (gratis, di Cloudflare Workers). API key disimpan rahasia di server, dan perangkat cukup diisi PIN. Panduan lengkapnya ada di [`worker/README.md`](worker/README.md).

## Keamanan

- API key **hanya disimpan di browser** (localStorage) di perangkat yang kamu pakai, dan dikirim langsung ke Google, OpenAI, atau Anthropic. Key **tidak** masuk ke repo ini.
- **Jangan pernah menulis API key di dalam kode.** Repo ini publik, dan key yang bocor bisa dipakai orang lain atas tagihanmu.
- Jangan mengisi key di komputer umum. Kalau sudah terlanjur, tekan **Hapus semua key**.
- Batasi pemakaian dari dasbor masing-masing penyedia, misalnya dengan batas tagihan bulanan.
- Siapa pun yang membuka link aplikasi ini harus memakai key-nya sendiri. Untuk membagikan aplikasi tanpa membagikan key, perlu server perantara kecil (misalnya Cloudflare Workers) yang menyimpan key secara rahasia.

## Catatan

- Kuota gratis Gemini bisa dipakai Google untuk meningkatkan produknya. Jangan memasukkan teks rahasia lewat jalur gratis.
- Nama model AI cepat berganti. Kalau sebuah model tidak tersedia lagi, pilih model lain atau isi nama model yang baru di pengaturan.
- Hasil dibuat oleh AI dan bisa keliru. Periksa lagi untuk tulisan yang penting.
