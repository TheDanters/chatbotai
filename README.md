# Tutor Belajar AI

Chatbot pendidikan berbasis **Google Gemini AI** yang menjelaskan materi pelajaran
langkah demi langkah, memberi contoh, dan mengajak pengguna berpikir. Dibuat sebagai
proyek **Sesi 3 — Pembuatan Chatbot berbasis Gemini AI Model** (Hacktiv8).

Aplikasi terdiri dari **landing page** sebagai halaman utama, dengan antarmuka chatbot
yang terintegrasi langsung di dalamnya.

## Fitur

- Landing page responsif (hero, fitur, cara kerja, dan bagian chatbot).
- Chat multi-turn: riwayat percakapan ikut dikirim ke model agar konteks terjaga.
- **System Instruction** yang membentuk persona tutor (sabar, ramah, Bahasa Indonesia).
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

Buka [http://localhost:3000](http://localhost:3000) di browser. Landing page akan tampil,
scroll ke bagian **Coba Sekarang** atau klik **Mulai Belajar** untuk mulai berchat.

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
    { "role": "user", "text": "Jelaskan hukum Newton dengan bahasa sederhana." }
  ]
}
```

**Response sukses**

```json
{
  "result": "Tentu! Hukum Newton ada 3, kita bahas satu per satu ya..."
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
  -d '{"conversation":[{"role":"user","text":"Apa itu fotosintesis?"}]}'
```

## Konfigurasi Parameter Gemini

| Parameter     | Nilai | Keterangan                                              |
| ------------- | ----- | ------------------------------------------------------- |
| `temperature` | 0.7   | Tingkat kreativitas jawaban (0.0–2.0)                   |
| `topP`        | 0.95  | Nucleus sampling, membatasi keacakan (0.0–1.0)          |
| `topK`        | 40    | Membatasi pilihan ke K token paling mungkin (1–40)      |

**System Instruction** menetapkan persona "Tutor Belajar AI": menjawab dalam Bahasa
Indonesia yang santai namun sopan, menjelaskan bertahap, memberi contoh, memancing
siswa berpikir, dan menolak topik di luar edukasi.

## Alur Kerja

1. Pengguna mengetik pertanyaan di frontend.
2. Frontend mengirim `POST /api/chat` berisi riwayat percakapan.
3. Backend memformat pesan dan memanggil `generateContent()` pada Gemini.
4. Respons dikembalikan sebagai `{ result }` dan ditampilkan di antarmuka chat.

## Lisensi

ISC — dibuat untuk keperluan pembelajaran.
