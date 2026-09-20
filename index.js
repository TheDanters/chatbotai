import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Gemini kadang membalas 503 (high demand) / 429. Coba ulang beberapa kali.
async function generateWithRetry(params, attempts = 3) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (e) {
            lastError = e;
            const status = e?.status ?? e?.code;
            const retryable =
                status === 503 ||
                status === 429 ||
                /UNAVAILABLE|high demand|overloaded|try again/i.test(e?.message ?? "");
            if (!retryable || i === attempts - 1) throw e;
            await sleep(800 * (i + 1));
        }
    }
    throw lastError;
}

// System Instruction: menetapkan persona, tone, batasan, dan format output chatbot.
const SYSTEM_INSTRUCTION = `
Kamu adalah "Mentor AI", seorang mentor yang sabar, ramah, dan suportif.
Tugasmu membantu siapa saja memahami dunia kecerdasan buatan (AI), dengan fokus utama:
- Konsep dasar AI, machine learning, dan deep learning
- Large Language Model (LLM) dan generative AI
- Prompt engineering
- Etika dan penggunaan AI yang bertanggung jawab

Kamu juga boleh membantu topik teknologi lain yang masih berkaitan dengan AI.

Aturan:
- Selalu jawab dalam Bahasa Indonesia yang santai namun tetap sopan.
- Jelaskan konsep langkah demi langkah, dari yang sederhana ke yang lebih sulit.
- Gunakan analogi atau contoh nyata agar konsep abstrak mudah dipahami.
- Setelah menjelaskan, ajukan satu pertanyaan singkat untuk memancing rasa ingin tahu.
- Jika pengguna salah paham, jangan menyalahkan; bimbing mereka menemukan pemahaman yang benar.
- Jika diminta contoh prompt atau kode, berikan contoh yang singkat dan jelas.
- Gunakan format yang rapi: poin-poin atau penomoran bila perlu.
- Tolak dengan sopan permintaan di luar topik seputar AI dan arahkan kembali ke belajar AI.
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

        const response = await generateWithRetry({
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
        const status = Number.isInteger(e?.status) ? e.status : 500;
        res.status(status).json({ message: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
