import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit to handle PDF base64 payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Preset content samples in case user wants immediate interaction
const PRESET_TOPICS = {
  quantum: {
    topic: "Secrets of Quantum Mechanics",
    summary: "A fundamental theory in physics that describes the physical properties of nature at the scale of atoms and subatomic particles.",
    flashcards: [
      {
        id: "q1",
        question: "What is Superposition?",
        answer: "A core principle of quantum mechanics where a system can exist in multiple states or configurations simultaneously until it is measured.",
        hint: "Think of Schrodinger's Cat being both alive and dead."
      },
      {
        id: "q2",
        question: "What is Quantum Entanglement?",
        answer: "A phenomenon where two or more particles become interconnected such that the state of one instantly influences the state of the other, regardless of distance.",
        hint: "Einstein famously called this 'spooky action at a distance'."
      },
      {
        id: "q3",
        question: "What is the Uncertainty Principle?",
        answer: "Formulated by Werner Heisenberg, it states that it is impossible to simultaneously measure both the precise position and momentum of a particle.",
        hint: "The more precisely you know where something is, the less you know where it's going."
      },
      {
        id: "q4",
        question: "What is a Wave-Particle Duality?",
        answer: "The concept that every particle or quantum entity may be described as either a particle or a wave, exhibiting behaviors of both depending on measurement.",
        hint: "Light behaves like waves in a double-slit but knocks electrons out like bullets in photoelectric effect."
      },
      {
        id: "q5",
        question: "What is Quantum Tunneling?",
        answer: "A quantum mechanical process where a particle passes through a potential energy barrier that it classically could not surmount.",
        hint: "It allows fusion inside the Sun to happen at lower temperatures than expected."
      }
    ],
    quiz: [
      {
        id: "qq1",
        question: "Which thought experiment illustrates quantum superposition?",
        options: [
          "Schrodinger's Cat",
          "Maxwell's Demon",
          "Einstein's Elevator",
          "Newton's Bucket"
        ],
        correctAnswerIndex: 0,
        explanation: "Schrodinger's Cat represents a system in a superposition of states (alive and dead) until observed, highlighting the paradoxical nature of quantum measurements at macroscopic scales."
      },
      {
        id: "qq2",
        question: "Who formulated the Uncertainty Principle in quantum mechanics?",
        options: [
          "Albert Einstein",
          "Werner Heisenberg",
          "Max Planck",
          "Niels Bohr"
        ],
        correctAnswerIndex: 1,
        explanation: "Werner Heisenberg introduced the Uncertainty Principle in 1927, proving a mathematics-backed limit to how precisely we can know certain pairs of physical variables."
      },
      {
        id: "qq3",
        question: "What unit is commonly used to measure quantum information?",
        options: [
          "Byte",
          "Bit",
          "Qubit",
          "Quark"
        ],
        correctAnswerIndex: 2,
        explanation: "A qubit (quantum bit) is the basic unit of quantum information, which unlike a classical binary bit can exist in a superposition of both 0 and 1."
      },
      {
        id: "qq4",
        question: "What physical mechanism allows stars, like our Sun, to carry out nuclear fusion at their cores?",
        options: [
          "Quantum Tunneling",
          "Gravitational Expansion",
          "Acoustic Cavitation",
          "Electrolysis of Hydrogen"
        ],
        correctAnswerIndex: 0,
        explanation: "Quantum Tunneling permits protons to bypass the repulsive electrostatic forces keeping them apart, triggering stellar fusion without reaching infinite thermal thresholds."
      }
    ]
  },
  roman: {
    topic: "Ancient Roman Engineering Marvels",
    summary: "The Romans built legendary structures and systems using innovative techniques, custom materials, and revolutionary designs that endure to this day.",
    flashcards: [
      {
        id: "r1",
        question: "What made Roman concrete so uniquely durable?",
        answer: "The inclusion of volcanic ash (pozzolana), which triggered a chemical reaction when mixed with chemical seawater, growing stronger over centuries.",
        hint: "Originates from Pozzuoli, near Naples."
      },
      {
        id: "r2",
        question: "How did Roman aqueducts maintain a constant flow of water?",
        answer: "They relied entirely on gravity, utilizing a tiny, extraordinarily precise downward gradient (slope) over dozens of miles.",
        hint: "Simple downward angle calculation."
      },
      {
        id: "r3",
        question: "What key architectural shape did Romans master for weight distribution?",
        answer: "The Arch. It directed tensile stress outwards and downwards into sturdy support columns or abutments.",
        hint: "Curved visual structural component."
      },
      {
        id: "r4",
        question: "What is the Cloaca Maxima?",
        answer: "One of the world's earliest sewage and drainage systems, built in ancient Rome to drain the marshy lands and carry sewage to the Tiber.",
        hint: "Deep underground Roman health canal."
      }
    ],
    quiz: [
      {
        id: "rq1",
        question: "What key ingredient gave Roman concrete (opus caementicium) extreme underwater resilience?",
        options: [
          "Volcanic ash (pozzolana)",
          "Pulverized limestone dust",
          "Animal fat and marrow",
          "Crushed terra-cotta tiles"
        ],
        correctAnswerIndex: 0,
        explanation: "Volcanic ash reacting with seawater forms alumino-silicate hydrates, which crystalize inside microscopic cracks to self-heal and solidify the mix over millennia."
      },
      {
        id: "rq2",
        question: "The Roman Colosseum was built with a retractable awning to protect spectators. What was it called?",
        options: [
          "Auxilium",
          "Velarium",
          "Stradivarius",
          "Pnyx"
        ],
        correctAnswerIndex: 1,
        explanation: "The Velarium was a canvas canvas shade system spanned by complex rigging lines, operated by skilled Roman sailors."
      },
      {
        id: "rq3",
        question: "By what primary power source did Roman aqueducts run?",
        options: [
          "Manual siphon pumps",
          "Waterwheel leverage",
          "Continuous gravity gradients",
          "Steam expansion"
        ],
        correctAnswerIndex: 2,
        explanation: "roman aqueducts had no motorized components; they gravity-flowed water over massive distances through pristine surveying gradients as minor as 1 foot per 300."
      }
    ]
  },
  ocean: {
    topic: "The Biology of Deep-Sea Creatures",
    summary: "Life at high hydrostatic pressures, pitch-black levels, and extreme temperatures of the ocean abyss has evolved remarkable alternative functions.",
    flashcards: [
      {
        id: "o1",
        question: "What is Bioluminescence?",
        answer: "The biochemical production of light by living organisms, typically utilizing the lucifern-luciferase reaction to attract mates, lure prey, or startle predators.",
        hint: "90% of open-ocean deep creatures possess this."
      },
      {
        id: "o2",
        question: "What is Gigantism (abyssal gigantism)?",
        answer: "The tendency for deep-sea invertebrate species to grow significantly larger than their shallow-water relatives, likely due to low temperatures, high pressure, and scarce food.",
        hint: "Think of giant isopods and giant squids."
      },
      {
        id: "o3",
        question: "How do tube worms survive without sunlight near hydrothermal vents?",
        answer: "By hosting symbiotic chemosynthetic bacteria in an organ called the trophosome, generating energy from poisonous hydrogen sulfide.",
        hint: "Synthesis using sulfur atoms rather than solar photons."
      }
    ],
    quiz: [
      {
        id: "oq1",
        question: "What is the primary chemical reaction responsible for deep-sea bioluminescence?",
        options: [
          "Luciferin reacting with oxygen via the luciferase enzyme",
          "Sodium-potassium cellular pump activation",
          "Tritium and radium glowing synthesis",
          "Methane ionization via thermal vent heat"
        ],
        correctAnswerIndex: 0,
        explanation: "Bioluminescence is created by oxidizing the substrate 'luciferin' catalyzed by helper enzymes called 'luciferase', releasing cold green-blue light."
      },
      {
        id: "oq2",
        question: "Since hydrothermal vent systems are in total darkness, what process replaces photosynthesis as the primary bio-production method?",
        options: [
          "Pyrosynthesis",
          "Chemosynthesis",
          "Thermosynthesis",
          "Halosynthesis"
        ],
        correctAnswerIndex: 1,
        explanation: "Chemosynthesis uses chemical energy (frequently hydrogen sulfide) instead of light energy to produce glucose for food chains."
      }
    ]
  }
};

// Lazy initialize Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint to generate quizzes/flashcards
app.post("/api/generate", async (req, res) => {
  try {
    const { mode, difficulty, count, text, fileBase64, fileName, presetKey } = req.body;

    // Check if presetKey was selected
    if (presetKey && PRESET_TOPICS[presetKey as keyof typeof PRESET_TOPICS]) {
      const presetData = PRESET_TOPICS[presetKey as keyof typeof PRESET_TOPICS];
      // Simulate slight network latency for polished micro-interaction experience
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({
        success: true,
        topic: presetData.topic,
        summary: presetData.summary,
        flashcards: mode === 'flashcards' ? presetData.flashcards.slice(0, count) : undefined,
        quiz: mode === 'quiz' ? presetData.quiz.slice(0, count) : undefined,
      });
    }

    // Verify raw input
    if (!text && !fileBase64) {
      return res.status(400).json({
        success: false,
        error: "Please upload a study material PDF or paste study notes."
      });
    }

    // Initialize Gemini SDK
    let clientInstance;
    try {
      clientInstance = getGeminiClient();
    } catch (apiKeyErr: any) {
      return res.status(500).json({
        success: false,
        error: "API key is missing. Please configure your GEMINI_API_KEY in the Settings > Secrets pane on AI Studio.",
        needsKey: true
      });
    }

    // Prepare content parts for Gemini 3.5 Flash
    const contentParts: any[] = [];

    if (fileBase64) {
      // Remove any data-URI header prefix if it exists
      const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, "");
      contentParts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64
        }
      });
    }

    // Prompt instructions based on the selected mode
    let schemaObj: any;
    let systemInstruction = "";
    
    if (mode === 'flashcards') {
      systemInstruction = `You are an elite educational assistant that matches complex study material into highly effective flashcards.
Extract the core educational highlights, terminology, or processes from the text or PDF provided.
Ensure the questions are engaging and clear, and the answers are thoroughly detailed and accurate.
Set the conceptual level appropriate for difficulty: ${difficulty}. Easy means direct recall; Medium means conceptual understanding; Hard means practical application or advanced correlation.`;

      schemaObj = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "A high level clean title summarizing the material topic" },
          summary: { type: Type.STRING, description: "A short study overview of 1 or 2 sentences" },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A short random lowercase 4-character ID e.g. f932" },
                question: { type: Type.STRING, description: "Highly clear flashcard frontside question" },
                answer: { type: Type.STRING, description: "Detailed, exact and engaging backside answer" },
                hint: { type: Type.STRING, description: "An optional subtle clue to stimulate neural recall" }
              },
              required: ["id", "question", "answer"]
            }
          }
        },
        required: ["topic", "summary", "flashcards"]
      };

      contentParts.push({
        text: `From the attached materials, generate exactly ${count} flashcards of difficulty '${difficulty}'. Return JSON conforming to the schema.`
      });

    } else {
      systemInstruction = `You are a professional quiz maker specializing in clean, objective, pedagogy-proven multiple-choice tests.
Formulate clear question items from the text or PDF materials.
Generate exactly 4 options. Only ONE option must be correct. The other three must be plausible distractor options related to the subject.
Provide detailed educational explanations explaining exactly why the specified answer index is correct and why other key choices might be incorrect.
Scale difficulty: ${difficulty}.`;

      schemaObj = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "A high level clean title summarizing the material topic" },
          summary: { type: Type.STRING, description: "A short study overview of 1 or 2 sentences" },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A short random lowercase 4-character ID e.g. q923" },
                question: { type: Type.STRING, description: "The multiple choice question text" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 options"
                },
                correctAnswerIndex: {
                  type: Type.INTEGER,
                  description: "0, 1, 2, or 3 index of the correct option"
                },
                explanation: {
                  type: Type.STRING,
                  description: "Comprehensive review citation / logic why the answer is correct"
                }
              },
              required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
            }
          }
        },
        required: ["topic", "summary", "quiz"]
      };

      contentParts.push({
        text: `From the attached materials, generate exactly ${count} multiple choice questions of difficulty '${difficulty}'. Return JSON conforming to the schema.`
      });
    }

    if (text) {
      contentParts.push({
        text: `Pasted study text:\n\n${text}`
      });
    }

    // Call Gemini 3.5 Flash (the recommended model for basic structured tasks)
    const geminiRes = await clientInstance.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schemaObj,
        temperature: 0.15 // Low temperature for higher accuracy & adherence to schema
      }
    });

    const parsedJson = JSON.parse(geminiRes.text?.trim() || "{}");
    return res.json({
      success: true,
      topic: parsedJson.topic || "Generated Topic",
      summary: parsedJson.summary || "Generated summary.",
      flashcards: parsedJson.flashcards,
      quiz: parsedJson.quiz
    });

  } catch (err: any) {
    console.error("Gemini Generation Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred during quiz generation. Please verify your file or try again."
    });
  }
});

// Configure Vite middleware and static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cogito Server listening on port ${PORT}`);
  });
}

bootstrap();
