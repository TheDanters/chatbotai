# Belajar AI

Mentor chatbot berbasis **Google Gemini AI** yang menjelaskan konsep kecerdasan
buatan (AI), machine learning, LLM, hingga prompt engineering dengan bahasa sederhana
dan contoh nyata. Dibuat sebagai proyek **Sesi 3 — Pembuatan Chatbot berbasis Gemini
AI Model** (Hacktiv8).

Aplikasi terdiri dari **landing page** sebagai halaman utama, dengan chatbot
berbentuk **widget mengambang di pojok kanan bawah** yang muncul saat ikonnya diklik.

## Fitur

- Landing page responsif (hero, fitur, cara kerja, dan CTA).
- Widget chat mengambang di pojok kanan bawah — buka/tutup lewat ikon, tombol CTA,
  atau tombol `Esc`.
- Chat multi-turn: riwayat percakapan ikut dikirim ke model agar konteks terjaga.
- **System Instruction** yang membentuk persona "Mentor AI" (sabar, ramah, Bahasa Indonesia).
- Konfigurasi parameter model: `temperature`, `topP`, `topK`.
- Indikator "sedang berpikir" dan penanganan error di sisi frontend.
- Tombol reset percakapan dan chip pertanyaan cepat.

## Teknologi

| Bagian    | Teknologi                                   |
| --------- | ------------------------------------------- |
| Backend   | Node.js, Express, `@google/genai`, `cors`, `dotenv` |
| Frontend  | HTML, CSS, Vanilla JavaScript               |
| Model AI  | Google Gemini (`gemini-3.6-flash`)          |

## Struktur Proyek

```
gemini-chatbot-api/
├── .env                  # GEMINI_API_KEY (tidak di-commit)
├── .gitignore
├── index.js              # Server Express + endpoint Gemini
├── package.json
└── public/               # Frontend (di-serve via express.static)
    ├── index.html        # Landing page + UI chatbot
    ├── style.css
    └── script.js
```

## Prasyarat

- Node.js v18 atau lebih baru
- Gemini API Key (dari Google AI Studio / Google Cloud)

## Instalasi

1. Clone repositori ini:

   ```bash
   git clone https://github.com/TheDanters/chatbotai.git
   cd chatbotai
   ```

2. Install dependency:

   ```bash
   npm install
   ```

3. Buat file `.env` di root proyek dan isi API key kamu:

   ```env
   GEMINI_API_KEY=your_credential_key
   ```

   Opsional, ganti model:

   ```env
   GEMINI_MODEL=gemini-3.6-flash
   PORT=3000
   ```

## Menjalankan Aplikasi

```bash
npm start
```

Buka [http://localhost:3000](http://localhost:3000) di browser. Landing page akan tampil;
klik ikon chat di **pojok kanan bawah** (atau tombol **Mulai Belajar**) untuk membuka chatbot.

Mode pengembangan (auto-reload):

```bash
npm run dev
```

## API

### `POST /api/chat`

Menerima riwayat percakapan dan mengembalikan respons dari model Gemini.

**Request body**

```json
{
  "conversation": [
    { "role": "user", "text": "Jelaskan apa itu kecerdasan buatan (AI) dengan bahasa sederhana." }
  ]
}
```

**Response sukses**

```json
{
  "result": "Gampang! AI itu payung besarnya, machine learning salah satu caranya..."
}
```

**Response error**

| Status | Body                                | Penyebab                          |
| ------ | ----------------------------------- | --------------------------------- |
| 400    | `{ "message": "conversation must be an array" }` | Body tidak valid     |
| 500    | `{ "message": "<pesan error>" }`    | Gagal memproses di Gemini         |

### Contoh `curl`

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversation":[{"role":"user","text":"Apa perbedaan AI, machine learning, dan deep learning?"}]}'
```

## Konfigurasi Parameter Gemini

| Parameter     | Nilai | Keterangan                                              |
| ------------- | ----- | ------------------------------------------------------- |
| `temperature` | 0.7   | Tingkat kreativitas jawaban (0.0–2.0)                   |
| `topP`        | 0.95  | Nucleus sampling, membatasi keacakan (0.0–1.0)          |
| `topK`        | 40    | Membatasi pilihan ke K token paling mungkin (1–40)      |

**System Instruction** menetapkan persona "Mentor AI": menjawab dalam Bahasa
Indonesia yang santai namun sopan, menjelaskan bertahap, memberi analogi, memancing
rasa ingin tahu, dan menolak topik di luar seputar AI.

## Alur Kerja

1. Pengguna mengetik pertanyaan di frontend.
2. Frontend mengirim `POST /api/chat` berisi riwayat percakapan.
3. Backend memformat pesan dan memanggil `generateContent()` pada Gemini.
4. Respons dikembalikan sebagai `{ result }` dan ditampilkan di antarmuka chat.

## Troubleshooting

**Chat menampilkan "Failed to fetch" / "Tidak dapat terhubung ke server".**
Pastikan aplikasi diakses lewat server Express, bukan dengan membuka file HTML
langsung (double-click):

1. Jalankan `npm start`.
2. Buka `http://localhost:3000` di browser (bukan `file:///.../index.html`).

Jika server berjalan di port lain, set `window.API_BASE` sebelum `script.js` dimuat,
misalnya tambahkan di `index.html`:

```html
<script>window.API_BASE = "http://localhost:3001";</script>
```

**Respons lambat atau error 503 (high demand).**
Model Gemini kadang sedang padat. Server otomatis mencoba ulang beberapa kali;
jika masih gagal, coba lagi beberapa saat kemudian.

## Lisensi

ISC — dibuat untuk keperluan pembelajaran.
