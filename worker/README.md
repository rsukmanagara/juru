# Server Juru (Cloudflare Worker)

Server kecil yang menyimpan API key-mu secara rahasia. Dengan server ini, perangkat mana pun (HP, laptop, aplikasi yang dipasang di layar utama) cukup diisi **PIN**, tidak perlu API key.

Cara kerjanya: Juru mengirim permintaan ke server ini beserta PIN. Server mengecek PIN, menambahkan API key yang asli, meneruskannya ke Gemini, ChatGPT, atau Claude, lalu mengalirkan jawabannya kembali ke Juru. API key tidak pernah sampai ke browser.

Paket gratis Cloudflare Workers sudah lebih dari cukup untuk pemakaian pribadi.

## Memasang (±10 menit, sebaiknya dari laptop)

### 1. Buat akun Cloudflare
Daftar gratis di **dash.cloudflare.com/sign-up**, lalu verifikasi email.

### 2. Buat Worker
1. Di dasbor, buka **Workers & Pages** (atau **Compute → Workers**).
2. Tekan **Create**, lalu pilih **Start with Hello World!**
3. Isi nama **juru**, lalu tekan **Deploy**.

### 3. Tempel kode server
1. Tekan **Edit code**.
2. Hapus semua kode contoh, lalu tempel seluruh isi file [`worker.js`](worker.js) dari repo ini.
3. Tekan **Deploy**.

### 4. Isi rahasia
Buka Worker **juru → Settings → Variables and Secrets**, lalu tekan **Add** untuk setiap baris berikut:

| Nama | Tipe | Isi |
| --- | --- | --- |
| `JURU_PIN` | **Secret** | PIN pilihanmu. Minimal 6 karakter, campuran huruf dan angka lebih aman |
| `GEMINI_API_KEY` | **Secret** | API key dari aistudio.google.com/apikey |
| `ALLOWED_ORIGIN` | Text | `https://rsukmanagara.github.io` |
| `OPENAI_API_KEY` | **Secret** | Opsional, kalau mau ChatGPT juga |
| `ANTHROPIC_API_KEY` | **Secret** | Opsional, kalau mau Claude juga |

Pastikan tipenya **Secret** untuk PIN dan key, supaya nilainya tersembunyi setelah disimpan. Tekan **Deploy** atau **Save** kalau diminta.

### 5. Atur lokasi server (penting)
Buka **Settings → Runtime → Placement**, pilih **Region → Google Cloud Platform (GCP) → asia-southeast1**, lalu **Deploy**.

Tanpa pengaturan ini, permintaan dari sebagian jaringan seluler bisa dijalankan Cloudflare dari Hong Kong, dan Gemini menolaknya dengan pesan *"User location is not supported for the API use"*.

### 6. Salin alamat server
Alamat Worker-mu terlihat di halaman Worker, bentuknya seperti `https://juru.namaakunmu.workers.dev`.

### 7. Sambungkan Juru
Di Juru, ketuk ikon kunci → **Server Juru** → isi **Alamat server** dan **PIN** → **Tes koneksi** → **Simpan**.

Kalau alamat server sudah ditanamkan di aplikasi, perangkat baru cukup diisi PIN saja.

## Keamanan

- API key hanya ada di Cloudflare sebagai Secret, tidak di GitHub dan tidak di browser.
- Tanpa PIN yang benar, server menolak semua permintaan. Setiap PIN salah juga diperlambat supaya sulit ditebak.
- `ALLOWED_ORIGIN` membuat server hanya melayani situs Juru-mu.
- Server hanya meneruskan alamat yang dipakai Juru (membuat jawaban dan melihat daftar model), bukan seluruh API penyedia.
- Kalau PIN bocor, ganti `JURU_PIN` di Cloudflare. Semua perangkat lama otomatis tertolak sampai diisi PIN baru.
- Untuk berjaga-jaga, pasang batas pemakaian di dasbor Google AI Studio atau OpenAI.
