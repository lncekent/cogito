# Welcome, AI Agents! 🤖

This document outlines the essential guidelines, conventions, and best practices for AI agents contributing to the Cogito project. Adhering to these standards ensures consistency, maintainability, and efficient collaboration.

## 1. Project Overview

Cogito is a web-based AI-powered study tool that transforms any PDF lecture or pasted notes into an interactive learning experience. It generates flashcards and quizzes using Google's Gemini API, with a focus on seamless user experience and educational effectiveness.

## 2. Tech Stack

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend:** Express.js (for API), Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **AI Integration:** Google Gemini API (Gemini 3.5 Flash), OpenRouter (fallback)
*   **Deployment:** Vercel, Supabase Edge Functions
*   **Development Tools:** VS Code, Git

## 3. Project Structure

```
📦 cogito/
┣ .env.example          # Environment variable template
┣ .gitignore            # Git ignore rules
┣ index.html            # Main HTML entry point
┣ metadata.json         # Project metadata
┣ package.json          # Project dependencies and scripts
┣ README.md             # Project overview and setup
┣ server.ts             # Express server for API endpoints
┣ supabase/             # Supabase schema and related files
┣ tsconfig.json         # TypeScript configuration
┣ vite.config.ts        # Vite build tool configuration
┗ 📁 src/
  ┣ 📄 App.tsx           # Main application component and routing
  ┣ 📄 types.ts          # TypeScript type definitions
  ┣ 📄 index.css         # Global styles
  ┣ 📄 main.tsx          # React application entry point
  ┣ 📁 components/       # Reusable UI components
  ┃ ┣ 📄 AuthPage.tsx    # Authentication forms (Login/Signup)
  ┃ ┣ 📄 UploadZone.tsx  # File upload and text input component
  ┃ ┣ 📄 FlashcardViewer.tsx # Displays generated flashcards
  ┃ ┣ 📄 QuizViewer.tsx    # Displays generated quizzes
  ┃ ┣ 📄 Header.tsx        # Application header navigation
  ┃ ┣ 📄 Loader.tsx        # Loading indicator component
  ┃ ┣ 📄 AboutMe.tsx       # Information about the developer
  ┃ ┣ 📄 Guide.tsx         # System usage guide
  ┃ ┣ 📄 HistoryPanel.tsx  # Displays past study sessions
  ┃ ┗ 📄 ... (other components)
  ┗ 📁 lib/              # Utility functions and library setups
    ┗ 📄 supabase.ts     # Supabase client configuration
```

## 4. Coding Conventions

*   **Language:** TypeScript is the primary language. Use modern ES6+ syntax.
*   **Formatting:** Adhere to Prettier and ESLint standards (configured in the project). Use `npm run lint` to check.
*   **Component Structure:**
    *   Functional components with hooks are preferred.
    *   Keep components focused and reusable.
    *   Use `prefix:<Component Name>` for component imports in `App.tsx` for clarity.
*   **Styling:** Tailwind CSS is used for utility-first styling. Refer to the `tailwind.config.ts` for custom configurations.
*   **Naming Conventions:**
    *   Components: PascalCase (e.g., `UserProfileCard`)
    *   Variables/Functions: camelCase (e.g., `getUserData`)
    *   Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
    *   Types (TypeScript): PascalCase (e.g., `UserData`, `Flashcard`)
*   **Error Handling:** Use `try...catch` blocks for asynchronous operations. Display user-friendly error messages via toasts or dedicated error components. Log errors to the console for debugging.
*   **State Management:** Primarily use React's `useState` and `useContext`. For complex state, consider libraries if necessary, but currently, local state management is sufficient.

## 5. Environment Setup

*   **Dependencies:** Run `npm install` to install all project dependencies.
*   **Environment Variables:**
    *   Copy `.env.example` to `.env`.
    *   Fill in the required variables:
        *   `VITE_SUPABASE_URL`: Your Supabase project URL.
        *   `VITE_SUPABASE_ANON_KEY`: Your Supabase publishable/anon key.
        *   `GEMINI_API_KEY`: Your Google Gemini API key.
        *   `OPENROUTER_API_KEY`: (Optional) For fallback AI generation.
        *   `APP_URL`: The application's base URL (e.g., `http://localhost:3000`).
*   **Running Locally:** Execute `npm run dev` to start the Vite development server.

## 6. Build and Test Commands

*   **Development Server:** `npm run dev`
*   **Production Build:** `npm run build` (builds both client and server)
*   **Start Production Server:** `node dist/server.cjs`
*   **Linting:** `npm run lint` (runs TypeScript type checking)
*   **Clean Build:** `npm run clean` (removes `dist` directory)

## 7. Component Patterns

*   **Props:** Use explicit prop types (TypeScript interfaces) for all components.
*   **Event Handlers:** Callback props should be clearly named (e.g., `onGenerate`, `onBackToHome`).
*   **Stateful Logic:** Encapsulate stateful logic within components or custom hooks.
*   **Reusability:** Design components to be generic and reusable across the application.

## 8. Best Practices

*   **Security:**
    *   Never commit API keys or sensitive information directly into the codebase. Use environment variables.
    *   Validate all user inputs, especially when handling file uploads or text data.
    *   Be mindful of potential injection attacks when processing prompts for AI models.
*   **Performance:**
    *   Optimize image and file sizes.
    *   Use code-splitting and lazy loading where appropriate.
    *   Debounce or throttle frequent event handlers.
*   **AI Interactions:**
    *   Clearly define prompts and system instructions for AI models.
    *   Use appropriate AI models for the task (e.g., `gemini-3.5-flash` for structured generation).
    *   Handle AI API errors gracefully and provide informative feedback to the user.
    *   Validate and sanitize AI model outputs.
    *   Be aware of token limits and costs associated with AI API calls.
*   **File Handling:**
    *   Limit file upload sizes to prevent excessive resource consumption.
    *   Validate file types (e.g., only allow PDFs for document uploads).
    *   Handle potential errors during file parsing or reading.

## 9. Agent Workflow

1.  **Understand Task:** Clarify the goal and scope of the task.
2.  **Explore Codebase:** Use provided tools (`glob`, `read`, `grep`, `task`) to locate relevant files and understand existing implementations.
3.  **Implement Changes:** Write new code or modify existing code, adhering strictly to the conventions outlined above.
4.  **Verify:** Ensure changes function as expected and do not introduce regressions. Run linters and tests (`npm run lint`).
5.  **Commit (If requested):** If explicit instructions are given to commit, stage only the necessary files and use a clear, concise commit message.

By following these guidelines, we can collectively build and maintain a high-quality, robust application. Thank you for your contribution!
