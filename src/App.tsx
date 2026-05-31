import { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import Loader from "./components/Loader";
import FlashcardViewer from "./components/FlashcardViewer";
import QuizViewer from "./components/QuizViewer";
import AboutMe from "./components/AboutMe";
import Guide from "./components/Guide";
import AuthPage from "./components/AuthPage";
import HistoryPanel, { StudySessionRecord } from "./components/HistoryPanel";
import {
  Flashcard,
  QuizQuestion,
  AppMode,
  Difficulty,
  GenerationResponse,
} from "./types";
import { GraduationCap, ArrowUpRight, Info } from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>("quiz");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Storage for generated resources
  const [topic, setTopic] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);

  // Authenticated User State parameters
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const scrollToPageTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  const applyUserProfile = (user: any | null) => {
    if (!user?.email) {
      setUserEmail(null);
      setUserId(null);
      setUserDisplayName(null);
      setUserAvatarUrl(null);
      return;
    }

    const metadata = user.user_metadata || {};
    setUserEmail(user.email);
    setUserId(user.id);
    setUserDisplayName(
      metadata.full_name ||
        metadata.name ||
        metadata.preferred_username ||
        null,
    );
    setUserAvatarUrl(metadata.avatar_url || metadata.picture || null);
  };

  useEffect(() => {
    // Listen to real-time session updates from Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          applyUserProfile(data.user);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user?.email) {
            applyUserProfile(session.user);
          } else {
            applyUserProfile(null);
            setShowHistory(false);
          }
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const saveGenerationForSignedInUser = async (
    params: {
      mode: AppMode;
      count: number;
      difficulty: Difficulty;
      text?: string;
      fileBase64?: string;
      fileName?: string;
      presetKey?: string;
    },
    data: GenerationResponse,
  ) => {
    if (!isSupabaseConfigured || !supabase || !userId) return;

    const generatedItems =
      params.mode === "flashcards" ? data.flashcards || [] : data.quiz || [];

    if (generatedItems.length === 0) return;

    const sourceType = params.presetKey
      ? "preset"
      : params.fileName
        ? "pdf"
        : "text";
    const sourceTitle =
      params.presetKey ||
      params.fileName ||
      params.text?.slice(0, 80) ||
      "Pasted notes";

    const { data: session, error: sessionError } = await supabase
      .from("study_sessions")
      .insert({
        user_id: userId,
        mode: params.mode,
        difficulty: params.difficulty,
        topic: data.topic || "Generated Topic",
        summary: data.summary || null,
        source_type: sourceType,
        source_title: sourceTitle,
        item_count: generatedItems.length,
      })
      .select("id")
      .single();

    if (sessionError) throw sessionError;

    const rows: Array<{
      session_id: string;
      item_type: "quiz" | "flashcard";
      question: string;
      answer: string | null;
      hint: string | null;
      options: string[] | null;
      correct_answer_index: number | null;
      explanation: string | null;
      position: number;
    }> =
      params.mode === "flashcards"
        ? (data.flashcards || []).map((card, index) => ({
            session_id: session.id,
            item_type: "flashcard",
            question: card.question,
            answer: card.answer,
            hint: card.hint || null,
            options: null,
            correct_answer_index: null,
            explanation: null,
            position: index,
          }))
        : (data.quiz || []).map((question, index) => ({
            session_id: session.id,
            item_type: "quiz",
            question: question.question,
            answer: null,
            hint: null,
            options: question.options,
            correct_answer_index: question.correctAnswerIndex,
            explanation: question.explanation,
            position: index,
          }));

    const { error: itemsError } = await supabase
      .from("generated_items")
      .insert(rows);

    if (itemsError) throw itemsError;
  };

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

      if (userId) {
        try {
          await saveGenerationForSignedInUser(params, data);
        } catch (saveErr) {
          console.warn(
            "Generation succeeded, but saving history failed:",
            saveErr,
          );
        }
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
    setShowAbout(false);
    setShowGuide(false);
    setShowHistory(false);
  };

  const goHome = () => {
    setShowAbout(false);
    setShowGuide(false);
    setShowAuth(null);
    handleReset();
    scrollToPageTop();
  };

  const goToAbout = () => {
    setShowAbout(true);
    setShowGuide(false);
    setShowAuth(null);
    setShowHistory(false);
    setTopic(null);
    setSummary(null);
    setFlashcards(null);
    setQuiz(null);
    setError(null);
    setIsLoading(false);
    scrollToPageTop();
  };

  const goToGuide = () => {
    setShowGuide(true);
    setShowAbout(false);
    setShowAuth(null);
    setShowHistory(false);
    setTopic(null);
    setSummary(null);
    setFlashcards(null);
    setQuiz(null);
    setError(null);
    setIsLoading(false);
    scrollToPageTop();
  };

  const goToAuth = (mode: "login" | "signup") => {
    setShowAbout(false);
    setShowGuide(false);
    setShowHistory(false);
    setShowAuth(mode);
    scrollToPageTop();
  };

  const goToHistory = () => {
    setShowAbout(false);
    setShowGuide(false);
    setShowAuth(null);
    setShowHistory(true);
    setTopic(null);
    setSummary(null);
    setFlashcards(null);
    setQuiz(null);
    setError(null);
    setIsLoading(false);
    scrollToPageTop();
  };

  const openSavedSession = (payload: {
    session: StudySessionRecord;
    flashcards?: Flashcard[];
    quiz?: QuizQuestion[];
  }) => {
    setTopic(payload.session.topic);
    setSummary(payload.session.summary || "Saved study session.");
    setActiveMode(payload.session.mode);
    setFlashcards(payload.flashcards || null);
    setQuiz(payload.quiz || null);
    setError(null);
    setIsLoading(false);
    setShowAbout(false);
    setShowGuide(false);
    setShowAuth(null);
    setShowHistory(false);
    scrollToPageTop();
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Visual background atmospheric shapes - very elegant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[50%] rounded-full bg-indigo-50/40 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[40%] rounded-full bg-slate-100/30 blur-[100px]" />
      </div>

      {!showAuth && (
        <Header
          topic={
            showAbout
              ? "About the Developer"
              : showGuide
                ? "System Guide"
                : showHistory
                  ? "Study History"
                  : showAuth
                    ? `${showAuth === "login" ? "Access Account" : "Register with Cogito"}`
                    : topic || undefined
          }
          onBack={() => {
            if (showAbout || showGuide || showHistory || showAuth) {
              goHome();
            } else {
              handleReset();
              scrollToPageTop();
            }
          }}
          showBack={
            showAbout ||
            showGuide ||
            showHistory ||
            !!showAuth ||
            !!(flashcards || quiz || error || isLoading)
          }
          onResetAll={
            topic && !showAbout && !showGuide && !showAuth
              ? () => {
                  handleReset();
                  scrollToPageTop();
                }
              : undefined
          }
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          userAvatarUrl={userAvatarUrl}
          onLoginClick={() => goToAuth("login")}
          onSignUpClick={() => goToAuth("signup")}
          onHistoryClick={goToHistory}
          onGuideClick={goToGuide}
          onLogout={async () => {
            if (isSupabaseConfigured && supabase) {
              await supabase.auth.signOut();
            }
            applyUserProfile(null);
            setShowHistory(false);
          }}
        />
      )}

      <main className="flex-1 relative z-10 flex flex-col justify-center">
        {showAbout ? (
          <AboutMe onBackToHome={goHome} />
        ) : showGuide ? (
          <Guide onBackToHome={goHome} />
        ) : showHistory ? (
          <HistoryPanel
            onBackToHome={goHome}
            onOpenSession={openSavedSession}
          />
        ) : showAuth ? (
          <AuthPage
            initialMode={showAuth}
            onBackToApp={goHome}
            onAuthSuccess={async (email, id) => {
              if (isSupabaseConfigured && supabase) {
                const { data } = await supabase.auth.getUser();
                if (data.user) {
                  applyUserProfile(data.user);
                } else {
                  setUserEmail(email);
                  if (id) setUserId(id);
                }
              } else {
                setUserEmail(email);
                if (id) setUserId(id);
              }
              setShowAuth(null);
              scrollToPageTop();
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
                onClick={() => {
                  handleReset();
                  scrollToPageTop();
                }}
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
            onBack={() => {
              handleReset();
              scrollToPageTop();
            }}
          />
        ) : quiz ? (
          <QuizViewer
            quiz={quiz}
            topic={topic || "Generated Topic"}
            summary={summary || "Overview description."}
            onBack={() => {
              handleReset();
              scrollToPageTop();
            }}
          />
        ) : (
          <UploadZone
            onGenerate={handleGenerate}
            isLoading={isLoading}
            userEmail={userEmail}
            onLoginClick={() => goToAuth("login")}
            onSignUpClick={() => goToAuth("signup")}
          />
        )}
      </main>

      {/* Tidy minimal Swiss branding style footer */}
      <footer className="border-t border-slate-100 bg-white/40 py-4 relative z-10 text-center text-[11px] text-slate-400 font-mono tracking-wide">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 ">
            <p className="flex lg:flex-row flex-col lg:items-left items-center space-x-3 lg:gap-0 gap-3">
              <img src="favicon.svg" className="lg:w-5 w-8" />
              <span>@ 2026 Lance Magollado • Synaptic Study Synthesis.</span>
            </p>
            <span className="hidden sm:inline text-slate-200">|</span>
            <div className="flex items-center space-x-3 text-slate-500">
              <button
                onClick={goHome}
                className={`transition-colors hover:text-slate-900 font-semibold cursor-pointer ${!showAbout && !showAuth && !showHistory && !showGuide ? "text-indigo-600 underline decoration-2 underline-offset-2" : ""}`}
              >
                Home
              </button>
              <span>•</span>
              <button
                onClick={goToAbout}
                className={`transition-colors hover:text-slate-900 font-semibold cursor-pointer ${showAbout ? "text-indigo-600 underline decoration-2 underline-offset-2" : ""}`}
              >
                About Developer
              </button>
              <span>•</span>
              <button
                onClick={goToGuide}
                className={`transition-colors hover:text-slate-900 font-semibold cursor-pointer ${showGuide ? "text-indigo-600 underline decoration-2 underline-offset-2" : ""}`}
              >
                Guide
              </button>
            </div>
          </div>

          <p className="flex items-center space-x-2">
            <span className="text-slate-300">•</span>
            <a
              href="https://lancekent.dev"
              className="hover:underline text-slate-500 flex items-center space-x-0.5"
              target="_blank"
              rel="noreferrer"
            >
              <span>View Developer's Other Works</span>
              <ArrowUpRight className="h-2.5 w-2.5" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
