import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Columns, 
  Eye, 
  BookMarked,
  Download,
  Award
} from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  topic: string;
  summary: string;
  onBack: () => void;
}

export default function FlashcardViewer({ flashcards, topic, summary, onBack }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [needsPracticeIds, setNeedsPracticeIds] = useState<Set<string>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewCheatsheet, setViewCheatsheet] = useState(false);

  const activeCard = flashcards[currentIndex];

  useEffect(() => {
    // Reset flip when card index changes
    setIsFlipped(false);
    // Cancel speaking if we change cards
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [currentIndex]);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping the card when clicking review buttons
    const newMastered = new Set(masteredIds);
    const newPractice = new Set(needsPracticeIds);

    newMastered.add(id);
    newPractice.delete(id);

    setMasteredIds(newMastered);
    setNeedsPracticeIds(newPractice);
    
    // Auto advance after a brief moment to make it satisfying
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 350);
    }
  };

  const markPractice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping
    const newMastered = new Set(masteredIds);
    const newPractice = new Set(needsPracticeIds);

    newPractice.add(id);
    newMastered.delete(id);

    setMasteredIds(newMastered);
    setNeedsPracticeIds(newPractice);
  };

  const speakText = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = isFlipped 
      ? `The answer is: ${activeCard.answer}`
      : `The question is: ${activeCard.question} ${activeCard.hint ? `. Hint: ${activeCard.hint}` : ''}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Safe window-wide cleanup of speech
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Calculate stats
  const masteredCount = masteredIds.size;
  const reviewCount = needsPracticeIds.size;
  const masteryPercentage = Math.round((masteredCount / flashcards.length) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Subject Information */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6">
        <div className="text-left mb-4 sm:mb-0">
          <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full font-bold">
            Interactive Flashcards
          </span>
          <h2 className="text-2xl font-display font-extrabold text-slate-950 mt-1">
            {topic}
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5 max-w-xl">
            {summary}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewCheatsheet(!viewCheatsheet)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              viewCheatsheet 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>{viewCheatsheet ? "Study Flip Mode" : "List Cheatsheet"}</span>
          </button>
          
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            New Materials
          </button>
        </div>
      </div>

      {/* Progress Track banner */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-3 gap-2 text-center items-center">
          
          <div className="text-left pl-2">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Mastered</span>
            <span className="text-sm font-bold text-slate-950 flex items-center space-x-1">
              <span className="text-emerald-500">●</span>
              <span>{masteredCount}</span>
              <span className="text-slate-400 font-normal text-xs">/ {flashcards.length}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Mastery Index</span>
            <div className="flex items-center justify-center space-x-2 mt-0.5">
              <div className="w-16 sm:w-28 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${masteryPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-800">{masteryPercentage}%</span>
            </div>
          </div>

          <div className="text-right pr-2">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Need Review</span>
            <span className="text-sm font-bold text-slate-950 flex items-center justify-end space-x-1">
              <span className="text-indigo-500">●</span>
              <span>{reviewCount}</span>
              <span className="text-slate-400 font-normal text-xs">/ {flashcards.length}</span>
            </span>
          </div>

        </div>
      </div>

      {viewCheatsheet ? (
        
        /* List Cheatsheet Flat Layout */
        <div className="space-y-4 text-left">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Cheatsheet Summary View ({flashcards.length} Items)</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Print ready view</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((card, idx) => (
              <div key={card.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[10.5px] font-mono text-slate-400 font-bold">
                    ITEM {idx + 1}
                  </span>
                  {masteredIds.has(card.id) && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono font-bold px-2 py-0.5 rounded-full">
                      ✓ Mastered
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2 font-display">
                  {card.question}
                </h4>
                <div className="border-t border-slate-100 mt-3 pt-3">
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {card.answer}
                  </p>
                  {card.hint && (
                    <p className="text-[10.5px] text-slate-400 font-sans italic mt-2 bg-slate-50 px-2.5 py-1 rounded-lg">
                      Hint: {card.hint}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (
        
        /* Interactive 3D Card Area */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Main Flashcard Column */}
          <div className="lg:col-span-3 flex flex-col items-center">
            
            <div 
              onClick={toggleFlip}
              className="w-full h-[340px] perspective-1000 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 rounded-3xl"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  toggleFlip();
                }
              }}
            >
              <div className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full bg-slate-950 text-white rounded-3xl backface-hidden p-6 sm:p-10 flex flex-col justify-between border border-slate-800 shadow-xl overflow-y-auto">
                  
                  {/* Front Top header */}
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-3">
                    <span className="font-mono text-xs tracking-wider">FRONT • DECRYPT TOPIC</span>
                    <button 
                      onClick={speakText}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1 focus:outline-none"
                      title="Read Question Aloud"
                    >
                      <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'text-indigo-400 animate-pulse' : ''}`} />
                      <span className="text-[9px] font-mono">TTS</span>
                    </button>
                  </div>

                  {/* Question main container */}
                  <div className="my-auto py-2 text-center">
                    <h3 className="text-lg sm:text-2xl font-display font-bold leading-snug tracking-tight">
                      {activeCard.question}
                    </h3>
                    
                    {activeCard.hint && (
                      <p className="text-xs text-slate-400 mt-4 italic max-w-md mx-auto bg-slate-900/60 border border-slate-900 py-1.5 px-3 rounded-xl font-sans inline-block">
                        💡 Hint: {activeCard.hint}
                      </p>
                    )}
                  </div>

                  {/* Bottom info click-flip */}
                  <div className="flex justify-between items-center text-slate-500 text-[10px] font-mono border-t border-slate-900 pt-3">
                    <span>AI Synthesis Card</span>
                    <span className="flex items-center space-x-1 animate-pulse text-indigo-400">
                      <RotateCw className="h-3 w-3" />
                      <span>Click anywhere to flip</span>
                    </span>
                  </div>

                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full bg-white text-slate-950 rounded-3xl backface-hidden p-6 sm:p-10 flex flex-col justify-between border border-slate-100 shadow-xl rotate-y-180 overflow-y-auto">
                  
                  {/* Back Top header */}
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs tracking-wider text-slate-400">BACK • ACCURATE RETRIEVAL</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={speakText}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all flex items-center space-x-1 focus:outline-none"
                        title="Read Answer Aloud"
                      >
                        <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'text-indigo-500 animate-pulse' : ''}`} />
                        <span className="text-[9px] font-mono">TTS</span>
                      </button>
                    </div>
                  </div>

                  {/* Answer detailed content */}
                  <div className="my-auto py-2 text-center">
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans font-medium px-2">
                      {activeCard.answer}
                    </p>
                  </div>

                  {/* Self assessment review log */}
                  <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono border-t border-slate-100 pt-4 space-y-2 sm:space-y-0">
                    <span className="text-slate-400 uppercase">Rate your recall:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => markPractice(activeCard.id, e)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          needsPracticeIds.has(activeCard.id)
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
                        <span>Practice Again</span>
                      </button>
                      <button
                        onClick={(e) => markMastered(activeCard.id, e)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                          masteredIds.has(activeCard.id)
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Mastered </span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Pagination / navigation slider */}
            <div className="w-full flex justify-between items-center mt-5 px-1">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center space-x-1 px-4 py-2.5 text-xs font-bold font-mono text-slate-600 bg-white border border-slate-200 hover:bg-indigo-50/10 hover:border-slate-800 disabled:opacity-40 transition-all rounded-xl cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-mono font-bold text-slate-800">
                {currentIndex + 1} of {flashcards.length} Cards
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center space-x-1 px-4 py-2.5 text-xs font-bold font-mono text-slate-100 bg-slate-950 border border-slate-900 hover:bg-slate-900 disabled:opacity-40 transition-all rounded-xl cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

          {/* Quick Outline Jump List */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-left">
            <h4 className="text-[10.5px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center space-x-1">
              <BookMarked className="h-3.5 w-3.5" />
              <span>Jump To Card</span>
            </h4>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {flashcards.map((card, idx) => {
                const isCurrent = idx === currentIndex;
                const isMastered = masteredIds.has(card.id);
                const isPractice = needsPracticeIds.has(card.id);

                return (
                  <button
                    key={card.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left text-xs p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                      isCurrent 
                        ? 'bg-white border-slate-900 text-slate-950 font-bold shadow-sm' 
                        : 'bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-100'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="font-mono text-[10px] text-slate-400 mr-1.5">{idx + 1}.</span>
                      <span className="font-sans leading-none">{card.question}</span>
                    </div>

                    {isMastered && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" title="Mastered"></span>
                    )}
                    {isPractice && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" title="Needs Practice"></span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-slate-200 mt-4 pt-3 text-center">
              <div className="inline-flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                <Award className="h-3 w-3 text-indigo-500" />
                <span>Complete review counts</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
