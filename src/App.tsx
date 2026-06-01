import { useState, useEffect, useRef } from "react";
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
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  LogOut,
  X,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

type ToastState = {
  id: number;
  type: "success" | "info";
  title: string;
  message: string;
};

const GOOGLE_AUTH_PENDING_KEY = "cogito_google_auth_pending";
const MAX_GENERATION_TEXT_CHARS = 24000;

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
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const scrollToPageTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  const showToast = (nextToast: Omit<ToastState, "id">) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({
      ...nextToast,
      id: Date.now(),
    });

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3600);
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
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Listen to real-time session updates from Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          applyUserProfile(data.user);
          if (window.sessionStorage.getItem(GOOGLE_AUTH_PENDING_KEY) === "1") {
            window.sessionStorage.removeItem(GOOGLE_AUTH_PENDING_KEY);
            const metadata = data.user.user_metadata || {};
            showToast({
              type: "success",
              title: "Logged in successfully",
              message: `Welcome back, ${
                metadata.full_name || metadata.name || data.user.email
              }.`,
            });
          }
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
      const requestParams = {
        ...params,
        text: params.text
          ? params.text.slice(0, MAX_GENERATION_TEXT_CHARS)
          : undefined,
        fileBase64: undefined,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParams),
      });

      const responseText = await response.text();
      let data: GenerationResponse;

      try {
        data = responseText ? JSON.parse(responseText) : { success: false };
      } catch {
        if (response.status === 413) {
          throw new Error(
            "The uploaded content is too large for Vercel. Try a smaller PDF or paste a shorter section of notes.",
          );
        }

        throw new Error(
          response.ok
            ? "The server returned an invalid response. Please try again."
            : responseText ||
                "The server rejected the request before generation could start.",
        );
      }

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

  const confirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      }

      applyUserProfile(null);
      setShowLogoutDialog(false);
      goHome();
      showToast({
        type: "info",
        title: "Logged out",
        message:
          "You are back in guest mode. You can still generate reviewers.",
      });
    } catch (err: any) {
      showToast({
        type: "info",
        title: "Could not log out",
        message: err.message || "Please try signing out again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
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
          onLogout={() => setShowLogoutDialog(true)}
          activeSection={showAbout ? "about" : "home"}
          onNavigate={(section) => {
            if (section === "home") goHome();
            else if (section === "about") goToAbout();
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
              let welcomeName = email;

              if (isSupabaseConfigured && supabase) {
                const { data } = await supabase.auth.getUser();
                if (data.user) {
                  applyUserProfile(data.user);
                  const metadata = data.user.user_metadata || {};
                  welcomeName =
                    metadata.full_name || metadata.name || data.user.email;
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
              showToast({
                type: "success",
                title: "Logged in successfully",
                message: `Welcome back, ${welcomeName}.`,
              });
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

      {toast && (
        <div className="fixed right-4 top-4 z-70 w-[calc(100%-2rem)] max-w-sm animate-fade-in">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white/95 p-4 shadow-lg shadow-slate-200/70 backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-100"
                : "border-indigo-100"
            }`}
            role="status"
            aria-live="polite"
          >
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-display text-sm font-bold text-slate-950">
                {toast.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showLogoutDialog && (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-2xl shadow-slate-950/10 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="logout-dialog-title"
                  className="font-display text-lg font-extrabold tracking-tight text-slate-950"
                >
                  Log out of Cogito?
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Your saved history stays connected to your account. You can
                  still generate flashcards and quizzes as a guest after logging
                  out.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isLoggingOut ? "Logging Out..." : "Log Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
