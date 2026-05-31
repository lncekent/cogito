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
    ? `Format: [{"question": "term, concept, or question", "answer": "definition, explanation, or answer", "hint": "optional hint if helpful"}]`
    : `Format: [{"question": "the question text", "options": ["option 1", "option 2", "option 3", "option 4"], "correctAnswerIndex": 0, "explanation": "explanation of why the correct option is right"}]`
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
    
    // Log the full raw response as requested
    console.log("Full raw OpenRouter response:", JSON.stringify(data, null, 2));

    // Safety check on OpenRouter response
    if (!data.choices || !data.choices[0]) {
      throw new Error(
        "OpenRouter returned empty response: " + JSON.stringify(data),
      );
    }

    const rawText = data.choices[0].message.content;
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    
    let rawQuestions;
    try {
      rawQuestions = JSON.parse(cleaned);
    } catch (parseError: any) {
      throw new Error(
        `Failed to parse JSON. Error: ${parseError.message}. Raw text returned: ${rawText}`
      );
    }

    if (!Array.isArray(rawQuestions)) {
      throw new Error("OpenRouter response did not contain a valid JSON array.");
    }

    // Map and sanitize items to match exactly what types.ts and App.tsx expect
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
        let correctIdx = typeof item.correctAnswerIndex === "number" ? item.correctAnswerIndex : 0;
        const options = Array.isArray(item.options) ? item.options : [];
        if (typeof item.correctAnswerIndex !== "number" && item.answer) {
          const foundIdx = options.findIndex((opt: string) => 
            opt.toLowerCase().trim() === item.answer.toLowerCase().trim()
          );
          if (foundIdx !== -1) {
            correctIdx = foundIdx;
          }
        }
        return {
          id,
          question: item.question || "",
          options,
          correctAnswerIndex: correctIdx,
          explanation: item.explanation || item.citation || `Correct answer: ${options[correctIdx] || ""}`,
        };
      }
    });

    // Match what frontend expects: { success: true, [flashcards or quiz]: questions, topic, summary }
    res.status(200).json({
      success: true,
      [mode === "flashcards" ? "flashcards" : "quiz"]: questions,
      topic: fileName || presetKey || "Study Session",
      summary: `Generated ${count} ${mode} questions at ${difficulty} difficulty.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
