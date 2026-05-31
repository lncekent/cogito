export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, mode, count, level } = req.body;

    const prompt = `You are a quiz generator. Based on the following text, generate ${count} ${mode} questions at ${level} difficulty level. Return ONLY a valid JSON array, no markdown, no explanation, no backticks.

Text: ${text.substring(0, 3000)}

${
  mode === "flashcard"
    ? `Format: [{"front": "term or concept", "back": "definition or explanation"}]`
    : `Format: [{"question": "...", "answer": "...", "options": ["...", "...", "...", "..."]}]`
}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cogito-five.vercel.app",
          "X-Title": "Cogito",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-8b-instruct:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    const rawText = data.choices[0].message.content;
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    res.status(200).json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
