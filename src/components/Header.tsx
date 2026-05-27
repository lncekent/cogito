import {
  GraduationCap,
  ArrowLeft,
  RefreshCw,
  BookOpen,
  LogOut,
  User,
} from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  topic?: string;
  onResetAll?: () => void;
  userEmail?: string | null;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onLogout?: () => void;
}

export default function Header({
  onBack,
  showBack = false,
  topic,
  onResetAll,
  userEmail,
  onLoginClick,
  onSignUpClick,
  onLogout,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="group flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-all duration-200"
              title="Return to Study Materials Setup"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
              <GraduationCap className="h-5 w-5 text-slate-100" />
            </div>
          )}

          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg tracking-tight text-slate-950">
                Cogito
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                V3.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans truncate max-w-50 sm:max-w-none">
              {topic ? (
                <span className="font-medium text-slate-600">{topic}</span>
              ) : (
                "PDF Quiz & Flashcard Synthesizer"
              )}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {onResetAll && (
            <button
              onClick={onResetAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          )}

          {/* User Auth Section */}
          {userEmail ? (
            <div className="flex items-center space-x-1 sm:space-x-2.5">
              <div className="hidden xs:flex flex-col text-right items-end">
                <span className="text-[10px] text-slate-400 font-mono font-bold leading-none uppercase">
                  STUDENT PROFILE
                </span>
                <span
                  className="text-[11px] font-medium text-slate-800 line-clamp-1 max-w-27.5"
                  title={userEmail}
                >
                  {userEmail}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700">
                <User className="h-4 w-4" />
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={onSignUpClick}
                className="px-3 py-1.5 text-xs font-mono font-bold text-white bg-slate-950 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          <span className="w-px h-4 bg-slate-200 hidden sm:inline"></span>

          <a
            href="https://ai.studio/build"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 font-medium transition-all"
            referrerPolicy="no-referrer"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            <span className="hidden xs:inline">AI Studio Build</span>
          </a>
        </div>
      </div>
    </header>
  );
}
