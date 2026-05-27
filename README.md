# 🧠 Cogito

![Home Page](ImageLinkHere)

> Transform any PDF into an instant study experience — flashcards, quizzes, and more.

Cogito is a web-based AI-powered quiz and flashcard generator built for students. Upload any lecture PDF or paste raw notes, and Cogito synthesizes them into interactive study materials in seconds — powered by Gemini AI.

## ✨ Features

- 📄 **PDF Upload & Text Paste** — Upload study documents or paste raw notes directly
- 🃏 **Flashcard Mode** — Auto-generate term & definition flashcard decks
- 🧪 **Quiz Mode** — Practice with Multiple Choice, True/False, and Identification questions
- 🎯 **Difficulty Levels** — Choose Easy, Medium, or Hard cognitive level
- 📊 **Score Tracking** — View your quiz results and performance history
- 🕓 **Session History** — Revisit all past study sessions anytime
- 🔐 **Google Authentication** — Secure login via Google OAuth

## 💻 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** Google Gemini API (quiz & flashcard generation)
- **Auth:** Supabase Auth + Google OAuth
- **Design:** Google AI Studio, Tailwind CSS
- **Deployment:** Vercel
- **Tools:**  VS Code, Git

## 🚀 Installation & Setup

1. Open Terminal
2. Clone the repository: `git clone https://github.com/lncekent/cogito.git`
3. Change directory to the project: `cd cogito`
4. Install dependencies: `npm install`
5. Create your environment file:
   ```bash
   cp .env.example .env
   ```
6. Fill in your environment variables in `.env`:
   ```dotenv
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
7. Run the project: `npm run dev`
   > 💡 **Note:** The server runs at `http://localhost:3000`
8. **(Optional)** Build for production: `npm run build`

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase publishable/anon key |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key |

## 🗄️ Database Setup

1. Go to your [Supabase](https://supabase.com) project
2. Open the **SQL Editor**
3. Run the SQL schema found in `/supabase/schema.sql`

This creates the following tables:
- `profiles` — User accounts linked to Google Auth
- `sessions` — Each PDF upload and study session
- `questions` — AI-generated questions per session
- `scores` — Quiz results and performance data

## 📂 Project Structure

```text
📦 src/
 ┣ 📂 components/
 ┃ ┣ 📄 AuthPage.tsx       Login & signup with Google OAuth
 ┃ ┣ 📄 UploadZone.tsx     PDF upload and text paste input
 ┃ ┣ 📄 FlashCard.tsx      Flashcard study mode
 ┃ ┣ 📄 QuizViewer.tsx     Quiz player (MC, T/F, ID)
 ┃ ┣ 📄 Header.tsx         Navigation and user profile
 ┃ ┣ 📄 Loader.tsx         Loading states
 ┃ ┗ 📄 AboutMe.tsx        About page
 ┣ 📂 lib/
 ┃ ┗ 📄 supabase.ts        Supabase client setup
 ┣ 📄 App.tsx              Main app and routing
 ┣ 📄 main.tsx             Entry point
 ┣ 📄 types.ts             TypeScript type definitions
 ┗ 📄 index.css            Global styles
📦 public/                 Static assets
📄 server.ts               Express server entry
📄 vite.config.ts          Vite configuration
📄 .env.example            Environment variable template
```

## 🧠 How It Works

```
User uploads PDF
      ↓
Text extracted from PDF
      ↓
Gemini API generates questions/flashcards as structured JSON
      ↓
Results saved to Supabase (sessions + questions tables)
      ↓
User studies via Flashcard or Quiz mode
      ↓
Scores saved and viewable in History
```

## 👨‍💻 Author

Built by **Lance Kent** — for students, by a student.

---

> 💡 Built during a hackathon in under 48 hours using AI-powered development tools.