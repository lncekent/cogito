import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  FileText,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AppMode, Difficulty, Flashcard, QuizQuestion } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface StudySessionRecord {
  id: string;
  mode: AppMode;
  difficulty: Difficulty;
  topic: string;
  summary: string | null;
  source_type: "text" | "pdf" | "preset";
  source_title: string | null;
  item_count: number;
  created_at: string;
}

interface GeneratedItemRecord {
  id: string;
  item_type: "quiz" | "flashcard";
  question: string;
  answer: string | null;
  hint: string | null;
  options: string[] | null;
  correct_answer_index: number | null;
  explanation: string | null;
  position: number;
}

interface HistoryPanelProps {
  onBackToHome: () => void;
  onOpenSession: (payload: {
    session: StudySessionRecord;
    flashcards?: Flashcard[];
    quiz?: QuizQuestion[];
  }) => void;
}

export default function HistoryPanel({
  onBackToHome,
  onOpenSession,
}: HistoryPanelProps) {
  const [sessions, setSessions] = useState<StudySessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is not configured yet.");
        setLoading(false);
        return;
      }

      const { data, error: sessionsError } = await supabase
        .from("study_sessions")
        .select(
          "id, mode, difficulty, topic, summary, source_type, source_title, item_count, created_at",
        )
        .order("created_at", { ascending: false });

      if (sessionsError) {
        setError(sessionsError.message);
      } else {
        setSessions((data || []) as StudySessionRecord[]);
      }

      setLoading(false);
    };

    loadSessions();
  }, []);

  const openSession = async (session: StudySessionRecord) => {
    if (!supabase) return;

    setOpeningId(session.id);
    setError(null);

    const { data, error: itemsError } = await supabase
      .from("generated_items")
      .select(
        "id, item_type, question, answer, hint, options, correct_answer_index, explanation, position",
      )
      .eq("session_id", session.id)
      .order("position", { ascending: true });

    setOpeningId(null);

    if (itemsError) {
      setError(itemsError.message);
      return;
    }

    const items = (data || []) as GeneratedItemRecord[];

    if (session.mode === "flashcards") {
      onOpenSession({
        session,
        flashcards: items.map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer || "",
          hint: item.hint || undefined,
          topic: session.topic,
        })),
      });
      return;
    }

    onOpenSession({
      session,
      quiz: items.map((item) => ({
        id: item.id,
        question: item.question,
        options: item.options || [],
        correctAnswerIndex: item.correct_answer_index || 0,
        explanation: item.explanation || "",
        topic: session.topic,
      })),
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 animate-fade-in w-full">
      <div className=" mb-4">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="underline cursor-pointer">
            Return back to Study materials
          </span>
        </button>
      </div>

      <div className="border-b border-slate-100 pb-5 mb-6 text-left">
        <span className="inline-flex items-center space-x-1.5 text-[10px] bg-slate-950 text-white font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">
          <CalendarClock className="h-3 w-3" />
          <span>Saved Workspace</span>
        </span>
        <h2 className="font-display font-extrabold text-3xl text-slate-950 mt-2 tracking-tight">
          Study History
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Signed-in generations are saved here. Guest generations stay temporary
          and disappear after refresh.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-xs font-mono">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading saved sessions...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-slate-950">
            No saved study sessions yet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Generate a quiz or flashcard deck while signed in and it will appear
            here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => {
            const date = new Date(session.created_at).toLocaleString();
            const isQuiz = session.mode === "quiz";

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => openSession(session)}
                className="bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm rounded-2xl p-5 text-left transition-all cursor-pointer disabled:opacity-60"
                disabled={openingId === session.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                      {isQuiz ? (
                        <HelpCircle className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                        {session.mode} / {session.difficulty}
                      </span>
                      <h3 className="font-display font-bold text-sm text-slate-950 leading-tight">
                        {session.topic}
                      </h3>
                    </div>
                  </div>
                  {openingId === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                  )}
                </div>

                {session.summary && (
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">
                    {session.summary}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                  <span>
                    {session.item_count}{" "}
                    {session.mode === "quiz" ? "questions" : "cards"}
                  </span>
                  <span>{date}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
