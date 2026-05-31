export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mode, count, difficulty, text, fileName, presetKey } = req.body;

  // Frontend already extracts PDF text and sends it as "text"
  // No server-side PDF parsing needed!
  const contentText = text || presetKey || "";

  if (!contentText) {
    return res.status(400).json({
      error:
        "No content found. Please upload a readable PDF or paste your notes directly.",
    });
  }

  try {
    const prompt = `You are an expert quiz and flashcard generator for students.

STUDY MATERIAL:
${contentText.substring(0, 8000)}

INSTRUCTIONS:
- Generate exactly ${count} items based ONLY on the study material above
- Difficulty level: ${difficulty}
- Do NOT generate questions about JSON, arrays, formatting, or data structures
- Questions must be strictly about the actual content of the study material
- Return ONLY a valid JSON array with no markdown, no explanation, no backticks

${
  mode === "flashcards"
    ? `Format: [{"question": "concept or term from the material", "answer": "definition or explanation from the material", "hint": "optional helpful hint"}]`
    : `Format: [{"question": "question about the study material", "options": ["option 1", "option 2", "option 3", "option 4"], "correctAnswerIndex": 0, "explanation": "why this answer is correct based on the material"}]`
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
          model: "openai/gpt-oss-120b:free",
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]) {
      throw new Error(
        "OpenRouter returned empty response: " + JSON.stringify(data),
      );
    }

    const rawText = data.choices[0].message.content;
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let rawQuestions;
    try {
      rawQuestions = JSON.parse(cleaned);
    } catch (parseError: any) {
      throw new Error(
        `Failed to parse AI response as JSON. Raw response: ${rawText.substring(0, 500)}`,
      );
    }

    if (!Array.isArray(rawQuestions)) {
      throw new Error("AI response did not return a valid array of questions.");
    }

    const questions = rawQuestions.map((item: any, idx: number) => {
      const id = item.id || `gen-${mode}-${idx}-${Date.now()}`;

      if (mode === "flashcards") {
        return {
          id,
          question: item.question || item.front || "",
          answer: item.answer || item.back || "",
          hint: item.hint || "",
        };
      } else {
        const options = Array.isArray(item.options) ? item.options : [];
        let correctIdx =
          typeof item.correctAnswerIndex === "number"
            ? item.correctAnswerIndex
            : 0;

        if (typeof item.correctAnswerIndex !== "number" && item.answer) {
          const foundIdx = options.findIndex(
            (opt: string) =>
              opt.toLowerCase().trim() === item.answer.toLowerCase().trim(),
          );
          if (foundIdx !== -1) correctIdx = foundIdx;
        }

        return {
          id,
          question: item.question || "",
          options,
          correctAnswerIndex: correctIdx,
          explanation:
            item.explanation || `Correct answer: ${options[correctIdx] || ""}`,
        };
      }
    });

    res.status(200).json({
      success: true,
      [mode === "flashcards" ? "flashcards" : "quiz"]: questions,
      topic: fileName || presetKey || "Study Session",
      summary: `Generated ${count} ${mode} questions at ${difficulty} difficulty.`,
    });
  } catch (err: any) {
    console.error("Generation error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
