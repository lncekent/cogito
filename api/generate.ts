import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, mode, count, level } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are a quiz generator. Based on the following text, generate ${count} ${mode} questions at ${level} difficulty level. Return ONLY valid JSON array, no markdown, no explanation.
    
Text: ${text}

Format:
[{
  "question": "...",
  "answer": "...",
  "options": ["...", "...", "...", "..."]
}]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleaned = response.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    res.status(200).json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
