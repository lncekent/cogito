import { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import Loader from "./components/Loader";
import FlashcardViewer from "./components/FlashcardViewer";
import QuizViewer from "./components/QuizViewer";
import AboutMe from "./components/AboutMe";
import AuthPage from "./components/AuthPage";
import { Flashcard, QuizQuestion, AppMode, Difficulty } from "./types";
import {
  GraduationCap,
  ArrowUpRight,
  Github,
  Info,
  BookOpen,
  User,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>("quiz");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState<boolean>(false);

  // Storage for generated resources
  const [topic, setTopic] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);

  // Authenticated User State parameters
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    // Listen to real-time session updates from Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          setUserEmail(data.user.email);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user?.email) {
            setUserEmail(session.user.email);
          } else {
            setUserEmail(null);
          }
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleGenerate = async (params: {
    mode: AppMode;
    count: number;
    difficulty: Difficulty;
    text?: string;
    fileBase64?: string;
    fileName?: string;
    presetKey?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setActiveMode(params.mode);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Generation query failed on the server. Please verify your file or search API constraints.",
        );
      }

      setTopic(data.topic);
      setSummary(data.summary);

      if (params.mode === "flashcards") {
        setFlashcards(data.flashcards || null);
        setQuiz(null); // Clean opposite mode
      } else {
        setQuiz(data.quiz || null);
        setFlashcards(null); // Clean opposite mode
      }
    } catch (err: any) {
      console.error("App Generation Error:", err);
      setError(
        err.message ||
          "An unexpected network error occurred. Please verify your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTopic(null);
    setSummary(null);
    setFlashcards(null);
    setQuiz(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Visual background atmospheric shapes - very elegant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[50%] rounded-full bg-indigo-50/40 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[40%] rounded-full bg-slate-100/30 blur-[100px]" />
      </div>

      <Header
        topic={
          showAbout
            ? "About the Developer"
            : showAuth
              ? `${showAuth === "login" ? "Access Account" : "Register with Cogito"}`
              : topic || undefined
        }
        onBack={() => {
          if (showAbout) {
            setShowAbout(false);
          } else if (showAuth) {
            setShowAuth(null);
          } else {
            handleReset();
          }
        }}
        showBack={
          showAbout ||
          !!showAuth ||
          !!(flashcards || quiz || error || isLoading)
        }
        onResetAll={topic && !showAbout && !showAuth ? handleReset : undefined}
        userEmail={userEmail}
        onLoginClick={() => {
          setShowAbout(false);
          setShowAuth("login");
        }}
        onSignUpClick={() => {
          setShowAbout(false);
          setShowAuth("signup");
        }}
        onLogout={async () => {
          if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
          }
          setUserEmail(null);
        }}
      />

      <main className="flex-1 relative z-10 flex flex-col justify-center">
        {showAbout ? (
          <AboutMe onBackToHome={() => setShowAbout(false)} />
        ) : showAuth ? (
          <AuthPage
            initialMode={showAuth}
            onBackToApp={() => setShowAuth(null)}
            onAuthSuccess={(email) => {
              setUserEmail(email);
              setShowAuth(null);
            }}
          />
        ) : isLoading ? (
          <Loader />
        ) : error ? (
          /* Custom Error Display Pane */
          <div className="max-w-md mx-auto py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Info className="h-6 w-6" />
            </div>

            <h3 className="font-display font-semibold text-slate-950 text-md">
              Generation Encountered an Error
            </h3>

            <p className="text-xs text-slate-500 font-sans mt-2 leading-relaxed">
              {error}
            </p>

            {error.includes("Settings > Secrets") && (
              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-normal font-sans text-left">
                <span className="font-semibold block text-slate-900 mb-0.5">
                  Where is the API Key?
                </span>
                Look for the **Settings** menu at the top right of your
                workspace window, find the **Secrets** or **Environment
                Variables** panel, and configure{" "}
                <code className="font-mono bg-white px-1 border rounded text-[10px]">
                  GEMINI_API_KEY
                </code>{" "}
                to enable secure live generations!
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Go Back to Setup
              </button>
            </div>
          </div>
        ) : flashcards ? (
          <FlashcardViewer
            flashcards={flashcards}
            topic={topic || "Generated Topic"}
            summary={summary || "Overview description."}
            onBack={handleReset}
          />
        ) : quiz ? (
          <QuizViewer
            quiz={quiz}
            topic={topic || "Generated Topic"}
            summary={summary || "Overview description."}
            onBack={handleReset}
          />
        ) : (
          <UploadZone
            onGenerate={handleGenerate}
            isLoading={isLoading}
            userEmail={userEmail}
            onLoginClick={() => {
              setShowAbout(false);
              setShowAuth("login");
            }}
            onSignUpClick={() => {
              setShowAbout(false);
              setShowAuth("signup");
            }}
          />
        )}
      </main>

      {/* Tidy minimal Swiss branding style footer */}
      <footer className="border-t border-slate-100 bg-white/40 py-4 relative z-10 text-center text-[11px] text-slate-400 font-mono tracking-wide">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <p className="flex items-center space-x-1">
              <GraduationCap className="h-3.5 w-3.5 text-slate-700" />
              <span>© 2026 Cogito Inc. • Synaptic Study Synthesis.</span>
            </p>
            <span className="hidden sm:inline text-slate-200">|</span>
            <div className="flex items-center space-x-3 text-slate-500">
              <button
                onClick={() => {
                  setShowAbout(false);
                  setShowAuth(null);
                }}
                className={`transition-colors hover:text-slate-900 font-semibold cursor-pointer ${!showAbout && !showAuth ? "text-indigo-600 underline decoration-2 underline-offset-2" : ""}`}
              >
                Home
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setShowAbout(true);
                  setShowAuth(null);
                }}
                className={`transition-colors hover:text-slate-900 font-semibold cursor-pointer ${showAbout ? "text-indigo-600 underline decoration-2 underline-offset-2" : ""}`}
              >
                About Developer
              </button>
              <span>•</span>
              {userEmail ? (
                <span className="text-slate-400 font-mono text-[10px]">
                  Logged In
                </span>
              ) : (
                <button
                  onClick={() => {
                    setShowAbout(false);
                    setShowAuth("login");
                  }}
                  className={`transition-colors hover:text-slate-900 font-semibold cursor-pointer ${showAuth ? "text-indigo-600 underline decoration-2 underline-offset-2" : ""}`}
                >
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>

          <p className="flex items-center space-x-2">
            <span className="text-slate-300">•</span>
            <a
              href="https://ai.studio/build"
              className="hover:underline text-slate-500 flex items-center space-x-0.5"
              target="_blank"
              rel="noreferrer"
            >
              <span>Verify Core Capabilities</span>
              <ArrowUpRight className="h-2.5 w-2.5" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
