import React, { useState, useRef } from "react";
import { 
  FileText, 
  Upload, 
  Settings, 
  SlidersHorizontal, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  FileCheck2,
  AlertCircle,
  X,
  FileCode2,
  Milestone
} from "lucide-react";
import { AppMode, Difficulty } from "../types";

interface UploadZoneProps {
  onGenerate: (params: {
    mode: AppMode;
    count: number;
    difficulty: Difficulty;
    text?: string;
    fileBase64?: string;
    fileName?: string;
    presetKey?: string;
  }) => void;
  isLoading: boolean;
  userEmail?: string | null;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

export default function UploadZone({ 
  onGenerate, 
  isLoading,
  userEmail,
  onLoginClick,
  onSignUpClick
}: UploadZoneProps) {
  const [mode, setMode] = useState<AppMode>('quiz');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState<number>(5);
  const [text, setText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File to Base64 safely
  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setErrorMessage("Only PDF study materials are currently supported. Please upload a valid .pdf file.");
      return;
    }
    if (selectedFile.size > 14 * 1024 * 1024) { // 14MB max limit for robust payloads
      setErrorMessage("File exceeds 14MB. Please upload a smaller study guide PDF.");
      return;
    }

    setErrorMessage("");
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      const resultString = reader.result as string;
      setFileBase64(resultString);
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read the file. Please try again.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !text.trim()) {
      setErrorMessage("Please select a training PDF file, paste study notes or click on one of our premium quick presets below.");
      return;
    }
    onGenerate({
      mode,
      count,
      difficulty,
      text: text.trim() ? text : undefined,
      fileBase64: fileBase64 ? fileBase64 : undefined,
      fileName: file ? file.name : undefined
    });
  };

  const triggerPreset = (presetKey: 'quantum' | 'roman' | 'ocean') => {
    onGenerate({
      mode,
      count,
      difficulty,
      presetKey
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      
      {/* Brand & Introduction */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-slate-600 mb-4 transition-all hover:bg-slate-100">
          <BookOpen className="h-3 w-3 text-slate-800" />
          <span>INSTANT STUDY PREPARATION PACKS</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-950 tracking-tight leading-tight mb-3">
          Deep Learning, <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent">
            Synthesized Instantly
          </span>
        </h1>
        <p className="text-slate-500 font-sans text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Upload any lecture syllabus, textbook chapter, or paste rough research notes to craft high-fidelity, interactive training materials in seconds.
        </p>
      </div>

      {/* Prominent Authentication CTA Block for non-authenticated users */}
      {!userEmail && (
        <div className="mb-8 p-6 rounded-3xl bg-slate-950 text-white border border-slate-900 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all hover:border-slate-800">
          <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-slate-800/20 blur-[40px] pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-indigo-500/10 blur-[45px] pointer-events-none" />
          
          <div className="text-left space-y-1.5 z-10 max-w-lg">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-mono text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Personalized study profile pending</span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-tight">
              Connect Supabase to Sync Progress
            </h2>
            <p className="text-[11.5px] text-slate-400 font-sans leading-relaxed">
              Register or Log in to organize generated study materials, save quiz score metrics, and connect with your absolute student credentials.
            </p>
          </div>

          <div className="flex flex-row items-center gap-2.5 z-10 w-full md:w-auto shrink-0 justify-start md:justify-end">
            <button
              type="button"
              onClick={onLoginClick}
              className="flex-1 md:flex-none px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 text-center"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={onSignUpClick}
              className="flex-1 md:flex-none px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer active:scale-95 text-center whitespace-nowrap"
            >
              Sign Up For Free
            </button>
          </div>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleGenerateClick} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
        
        {/* Toggle Mode Control */}
        <div className="mb-8">
          <label className="block text-slate-800 text-xs font-mono uppercase tracking-widest mb-3 text-center">
            Select Synthesis Target
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 max-w-md mx-auto relative">
            
            {/* Flashcard Button */}
            <button
              type="button"
              onClick={() => setMode('flashcards')}
              className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs font-medium tracking-tight transition-all duration-300 relative z-10 ${
                mode === 'flashcards' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <FileCode2 className={`h-4 w-4 ${mode === 'flashcards' ? 'text-white' : 'text-slate-400'}`} />
              <div className="text-left">
                <p className="font-semibold block leading-none">Flashcards</p>
                <span className="block text-[10px] opacity-70 mt-0.5">Dual-sided recall</span>
              </div>
            </button>

            {/* Quiz Button */}
            <button
              type="button"
              onClick={() => setMode('quiz')}
              className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs font-medium tracking-tight transition-all duration-300 relative z-10 ${
                mode === 'quiz' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <HelpCircle className={`h-4 w-4 ${mode === 'quiz' ? 'text-white' : 'text-slate-400'}`} />
              <div className="text-left">
                <p className="font-semibold block leading-none">Evaluation Quiz</p>
                <span className="block text-[10px] opacity-70 mt-0.5">Assessment testing</span>
              </div>
            </button>

          </div>
        </div>

        {/* Input Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* File Upload card */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-600" />
                <span>PDF Study Document</span>
              </label>
              {file && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-[10px] text-red-500 hover:text-red-700 flex items-center space-x-0.5 font-medium"
                >
                  <X className="h-3 w-3" />
                  <span>Remove file</span>
                </button>
              )}
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[190px] text-center ${
                isDragActive 
                  ? 'border-slate-800 bg-slate-50/80 scale-[0.99] shadow-sm' 
                  : file 
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : 'border-slate-200 hover:border-slate-400 bg-white'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={triggerFileSelect}
            >
              {file ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-pulse">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-950 truncate max-w-[200px]" title={file.name}>
                      {file.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF file ready
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium active:scale-95 transition-all">
                    Click to swap file
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 font-medium font-sans">
                      Drag & drop your study PDF here, or <span className="text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-2 underline-offset-2">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Supports textbooks, slides, and papers up to 14MB
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Paste Raw Materials notes area */}
          <div className="flex flex-col">
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold mb-2 flex items-center space-x-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" />
              <span>Or Paste Raw Text Notes</span>
            </label>
            <textarea
              className="resize-none flex-1 border border-slate-200 rounded-2xl p-4 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 min-h-[190px] bg-white transition-all focus:bg-slate-50/30"
              placeholder="Alternative Approach: Paste article insights, study questions, summaries, or quick syllabus fragments here..."
              disabled={!!file}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {file && (
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Using uploaded PDF file context. Text area bypassed.
              </p>
            )}
          </div>

        </div>

        {/* Configuration sliders/parameters */}
        <div className="border-t border-slate-100 pt-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Count Selector */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold flex items-center space-x-1">
                  <Settings className="h-3 w-3 text-slate-500" />
                  <span>Count ({mode === 'flashcards' ? 'Cards' : 'Questions'})</span>
                </span>
                <span className="text-xs font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold">
                  {count} {mode === 'flashcards' ? 'Cards' : 'Questions'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCount(val)}
                    className={`py-2 text-center rounded-xl text-xs font-mono border transition-all ${
                      count === val 
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {val} Items
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold flex items-center space-x-1">
                  <Milestone className="h-3 w-3 text-slate-500" />
                  <span>Cognitive Level</span>
                </span>
                <span className="text-[10px] font-mono font-bold capitalize px-2 py-0.5 rounded-md border bg-slate-50 text-slate-800 border-slate-100">
                  {difficulty} Level
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 text-center rounded-xl text-xs capitalize border transition-all ${
                      difficulty === level 
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-red-800">Review Required</p>
              <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Big Action Call Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-slate-950 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:bg-slate-900 active:scale-[0.985] disabled:opacity-50 shadow-sm disabled:pointer-events-none group"
        >
          <Sparkles className="h-4 w-4 animate-pulse text-indigo-300" />
          <span>{isLoading ? "Synthesizing study artifacts..." : "Instruct Gemini to Generate"}</span>
        </button>

      </form>

      {/* Instant Premium Quick Presets - Highly educational */}
      <div className="mt-8 border-t border-slate-100 pt-8 text-center">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 inline-flex items-center space-x-1.5">
          <span>Need material? Try premium presets instant-load</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Preset 1 */}
          <button
            type="button"
            onClick={() => triggerPreset('quantum')}
            className="group flex flex-col items-start p-4 text-left rounded-2xl border border-slate-100 bg-white hover:border-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400 block mb-1">
              Theoretical Physics
            </span>
            <h4 className="text-xs font-bold text-slate-950 block group-hover:text-indigo-900 transition-colors">
              Secrets of Quantum Mechanics
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-1 line-clamp-2">
              Explore superposition, quantum tunneling, and entanglement dynamics.
            </p>
          </button>

          {/* Preset 2 */}
          <button
            type="button"
            onClick={() => triggerPreset('roman')}
            className="group flex flex-col items-start p-4 text-left rounded-2xl border border-slate-100 bg-white hover:border-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400 block mb-1">
              Structural History
            </span>
            <h4 className="text-xs font-bold text-slate-950 block group-hover:text-indigo-900 transition-colors">
              Roman Engineering Marvels
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-1 line-clamp-2">
              Volcanic concrete chemistry, siphoning aqueducts and gravitational structural shapes.
            </p>
          </button>

          {/* Preset 3 */}
          <button
            type="button"
            onClick={() => triggerPreset('ocean')}
            className="group flex flex-col items-start p-4 text-left rounded-2xl border border-slate-100 bg-white hover:border-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400 block mb-1">
              Marine Biology
            </span>
            <h4 className="text-xs font-bold text-slate-950 block group-hover:text-indigo-900 transition-colors">
              Deep-Sea Abyssal Creatures
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-1 line-clamp-2">
              Discover chemotrophic structures, bioluminescence reactions, and gigantism phenomena.
            </p>
          </button>

        </div>
      </div>

    </div>
  );
}
