export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mode, count, difficulty, text, fileBase64, fileName, presetKey } =
    req.body;

  // Get the actual text content
  const contentText = text || presetKey || "";

  if (!contentText && !fileBase64) {
    return res.status(400).json({ error: "No content provided" });
  }

  try {
    const prompt = `You are a quiz generator. Based on the following text, generate ${count} ${mode} questions at ${difficulty} difficulty level. Return ONLY a valid JSON array, no markdown, no explanation, no backticks.

Text: ${contentText.substring(0, 3000)}

${
  mode === "flashcards"
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
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await response.json();

    // Safety check on OpenRouter response
    if (!data.choices || !data.choices[0]) {
      throw new Error(
        "OpenRouter returned empty response: " + JSON.stringify(data),
      );
    }

    const rawText = data.choices[0].message.content;
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    // Match what frontend expects
    res.status(200).json({
      success: true,
      questions,
      topic: fileName || presetKey || "Study Session",
      summary: `Generated ${count} ${mode} questions at ${difficulty} difficulty.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
