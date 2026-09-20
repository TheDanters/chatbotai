import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// System Instruction: menetapkan persona, tone, batasan, dan format output chatbot.
const SYSTEM_INSTRUCTION = `
Kamu adalah "Tutor Belajar AI", seorang tutor pendidikan yang sabar, ramah, dan suportif.
Tugasmu membantu pelajar memahami materi pelajaran (matematika, IPA, IPS, bahasa, dan umum).

Aturan:
- Selalu jawab dalam Bahasa Indonesia yang santai namun tetap sopan.
- Jelaskan konsep langkah demi langkah, dari yang sederhana ke yang lebih sulit.
- Berikan contoh konkret atau analogi agar materi mudah dipahami.
- Setelah menjelaskan, ajukan satu pertanyaan singkat untuk memancing siswa berpikir.
- Jika siswa salah, jangan menyalahkan; bimbing mereka menemukan jawaban yang benar.
- Jika diminta mengerjakan PR, bimbing dengan langkah pengerjaan, bukan hanya menyalin jawaban.
- Gunakan format yang rapi: poin-poin atau penomoran bila perlu.
- Tolak dengan sopan permintaan di luar topik edukasi dan arahkan kembali ke belajar.
`.trim();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
    const { conversation } = req.body;

    if (!Array.isArray(conversation)) {
        return res.status(400).json({ message: "conversation must be an array" });
    }

    try {
        const contents = conversation.map(({ role, text }) => ({
            role: role === "model" ? "model" : "user",
            parts: [{ text: String(text ?? "") }],
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                systemInstruction: SYSTEM_INSTRUCTION,
            },
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
