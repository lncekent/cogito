import { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  HelpCircle, 
  FileText, 
  Award,
  BookOpen,
  ChevronRight,
  Sparkles,
  Search
} from "lucide-react";
import { QuizQuestion } from "../types";

interface QuizViewerProps {
  quiz: QuizQuestion[];
  topic: string;
  summary: string;
  onBack: () => void;
}

export default function QuizViewer({ quiz, topic, summary, onBack }: QuizViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswered, setIsAnswered] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // States to audit individual responses on evaluation summary list
  const activeQuestion = quiz[currentIdx];
  const isSelected = selectedAnswers[currentIdx] !== undefined;

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered[currentIdx]) return; // Stop re-answering once checked

    const isCorrect = optionIndex === activeQuestion.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex
    }));

    setIsAnswered((prev) => ({
      ...prev,
      [currentIdx]: true
    }));
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsAnswered({});
    setScore(0);
    setQuizFinished(false);
  };

  // Score metrics
  const percentage = Math.round((score / quiz.length) * 100);
  
  // Custom badges
  let gradeBadge = {
    title: "Master Level",
    color: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
    desc: "Superb score! Your command of the material is absolute."
  };
  if (percentage < 55) {
    gradeBadge = {
      title: "Review Recommended",
      color: "bg-indigo-50/50 text-indigo-800 border-indigo-200/50",
      desc: "Good try! A quick review of the materials below will close the gaps."
    };
  } else if (percentage < 85) {
    gradeBadge = {
      title: "Proficient Level",
      color: "bg-amber-500/10 text-amber-800 border-amber-500/20",
      desc: "Great understanding! Solid performance with minor edge cases."
    };
  }

  const alphabet = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 text-left">
      
      {/* Quiz Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <span className="text-[10px] bg-slate-950 text-white font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">
            Assessment Test
          </span>
          <h2 className="text-2xl font-display font-extrabold text-slate-950 mt-1">
            {topic}
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5 max-w-xl">
            {summary}
          </p>
        </div>

        <button
          onClick={onBack}
          className="mt-3 sm:mt-0 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold self-start"
        >
          New Evaluation
        </button>
      </div>

      {!quizFinished ? (
        
        /* Active Question Arena */
        <div>
          
          {/* Top Progress Bar indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
              <span>QUESTION {currentIdx + 1} OF {quiz.length}</span>
              <span className="font-bold text-slate-600">
                Score: {score} / {quiz.length}
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-slate-900 h-full transition-all duration-300" 
                style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 mb-6 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-white pointer-events-none">
              <HelpCircle className="h-44 w-44" />
            </div>
            <span className="text-[9px] font-mono tracking-widest text-[#a5b4fc] uppercase font-bold bg-[#312e81]/40 border border-[#3730a3]/50 px-2 py-0.5 rounded-full inline-block mb-3">
              MULTIPLE CHOICE
            </span>
            <h3 className="text-md sm:text-lg font-display font-medium leading-relaxed">
              {activeQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3.5 mb-6">
            {activeQuestion.options.map((option, idx) => {
              const isAnsweredThis = isAnswered[currentIdx];
              const selectedThisIndex = selectedAnswers[currentIdx];
              const isSelectedOption = selectedThisIndex === idx;
              const isCorrectOption = idx === activeQuestion.correctAnswerIndex;

              let optionStyle = "border-slate-200 bg-white hover:border-slate-400 text-slate-800 hover:bg-slate-50";
              let badgeStatus = null;

              if (isAnsweredThis) {
                if (isCorrectOption) {
                  optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-950 font-semibold";
                  badgeStatus = <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />;
                } else if (isSelectedOption) {
                  optionStyle = "border-red-500 bg-red-50 text-red-950";
                  badgeStatus = <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
                } else {
                  optionStyle = "border-slate-100 opacity-60 bg-slate-50/50 text-slate-500 pointer-events-none";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnsweredThis}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-1.5 transition-all text-xs font-medium cursor-pointer relative ${optionStyle}`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <span className={`h-6 w-6 rounded-lg font-mono flex items-center justify-center border text-[11px] ${
                      isCorrectOption && isAnsweredThis
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isSelectedOption && isAnsweredThis
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {alphabet[idx]}
                    </span>
                    <span className="leading-snug pr-2">{option}</span>
                  </div>
                  {badgeStatus}
                </button>
              );
            })}
          </div>

          {/* Detailed Correct Explanation Block */}
          {isAnswered[currentIdx] && (
            <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-5 animate-fade-in text-slate-800">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center space-x-1">
                <FileText className="h-3.5 w-3.5 text-slate-600" />
                <span>Citation & Explanation</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {activeQuestion.explanation}
              </p>
            </div>
          )}

          {/* Action Trigger Row */}
          <div className="flex justify-end pt-3">
            <button
              onClick={handleNext}
              disabled={!isSelected}
              className="group flex items-center space-x-1 bg-slate-950 text-white px-5 py-3 rounded-xl hover:bg-slate-900 text-xs font-bold font-mono tracking-wider disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span>{currentIdx < quiz.length - 1 ? "NEXT QUESTION" : "FINISH EXAM"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      ) : (
        
        /* Final Exam Results Summary */
        <div>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full bg-slate-50 animate-ping opacity-35 h-16 w-16 mx-auto scale-[1.3]"></div>
              <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <Award className="h-8 w-8 text-[#fde047] animate-pulse" />
              </div>
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1">
              CONGRATULATIONS
            </span>
            <h3 className="text-3xl font-display font-bold text-slate-950 tracking-tight">
              Test Completed
            </h3>

            {/* Main Score Index Grid */}
            <div className="max-w-xs mx-auto grid grid-cols-2 gap-4 border-y border-slate-100 py-5 my-6">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Grade Score</span>
                <span className="text-3xl font-extrabold text-slate-900 font-display">
                  {score} <span className="text-xs text-slate-400 font-sans">/ {quiz.length}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Efficiency</span>
                <span className="text-3xl font-extrabold text-slate-900 font-display">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Badge Details */}
            <div className={`border p-4 rounded-2xl max-w-sm mx-auto text-center ${gradeBadge.color}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">{gradeBadge.title}</h4>
              <p className="text-[11px] font-sans mt-1 leading-relaxed">{gradeBadge.desc}</p>
            </div>

            {/* Redo Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <button
                onClick={restartQuiz}
                className="flex items-center justify-center space-x-1 px-5 py-3 rounded-xl text-xs font-bold font-mono tracking-wider bg-slate-950 text-white cursor-pointer hover:bg-slate-900 active:scale-95 transition-all w-full sm:w-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>RETAKE EXAM</span>
              </button>
              
              <button
                onClick={onBack}
                className="flex items-center justify-center space-x-1 px-5 py-3 rounded-xl text-xs font-bold font-mono tracking-wider bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer hover:bg-slate-100 active:scale-95 transition-all w-full sm:w-auto"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>LOAD NEW DOCS</span>
              </button>
            </div>
          </div>

          {/* Audit Ledger List of Questions */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-slate-600" />
              <span>Full Response Assessment Report</span>
            </h4>
            
            <div className="space-y-4">
              {quiz.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctAnswerIndex;

                return (
                  <div key={q.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        Question {idx + 1}
                      </span>
                      {isCorrect ? (
                        <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5">
                          ✓ Correct
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5">
                          ✗ Missed
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold font-display text-slate-900 mt-2 block leading-snug">
                      {q.question}
                    </h5>

                    {/* Breakdown of correct answers */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                      <div className="bg-slate-50 border border-slate-100/50 rounded-lg p-2.5">
                        <span className="block text-[9px] text-slate-400 font-mono uppercase font-bold">Your Selection</span>
                        <span className={`block font-medium mt-0.5 ${isCorrect ? 'text-emerald-800' : 'text-slate-800'}`}>
                          {q.options[userChoice] || "Bypassed"}
                        </span>
                      </div>
                      <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg p-2.5">
                        <span className="block text-[9px] text-slate-400 font-mono uppercase font-bold text-emerald-600">Correct Choice</span>
                        <span className="block font-semibold mt-0.5 text-emerald-800">
                          {q.options[q.correctAnswerIndex]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pl-2 border-l border-slate-200">
                      <p className="text-[11px] text-slate-500 leading-relaxed italic">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
