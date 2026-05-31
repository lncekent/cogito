import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  ArrowLeft,
  RefreshCw,
  BookOpen,
  History,
  LogOut,
  User,
} from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  topic?: string;
  onResetAll?: () => void;
  userEmail?: string | null;
  userDisplayName?: string | null;
  userAvatarUrl?: string | null;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onLogout?: () => void;
  onHistoryClick?: () => void;
  onGuideClick?: () => void;
  activeSection?: "home" | "about";
  onNavigate?: (section: "home" | "about") => void;
}

export default function Header({
  onBack,
  showBack = false,
  topic,
  onResetAll,
  userEmail,
  userDisplayName,
  userAvatarUrl,
  onLoginClick,
  onSignUpClick,
  onLogout,
  onHistoryClick,
  onGuideClick,
  activeSection = "home",
  onNavigate,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const openHistory = () => {
    setIsProfileMenuOpen(false);
    onHistoryClick?.();
  };

  const logout = () => {
    setIsProfileMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
            <GraduationCap className="h-5 w-5 text-slate-100" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg tracking-tight text-slate-950">
                Cogito
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                V1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans truncate max-w-50 sm:max-w-none  lg:block hidden">
              "PDF Quiz & Flashcard Synthesizer"
            </p>
          </div>
        </div>
        {/* Middle Section */}
        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => onNavigate?.("home")}
            className={`text-[13px] font-display font-bold tracking-wide transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeSection === "home"
                ? "text-black bg-indigo-50/50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate?.("about")}
            className={`text-[13px] font-display font-bold tracking-wide transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
              activeSection === "about"
                ? "text-black bg-indigo-50/50"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            About the Developer
          </button>
        </nav>

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
                  {userDisplayName || userEmail}
                </span>
              </div>
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                  className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all cursor-pointer"
                  title="Open account menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={userDisplayName || userEmail}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 top-10 w-60 rounded-2xl border border-slate-100 bg-white p-2 text-left shadow-lg shadow-slate-200/60"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        My Account
                      </p>
                      <p
                        className="mt-1 text-xs font-semibold text-slate-900 truncate"
                        title={userEmail}
                      >
                        {userDisplayName || userEmail}
                      </p>
                      {userDisplayName && (
                        <p
                          className="mt-0.5 text-[11px] text-slate-500 truncate"
                          title={userEmail}
                        >
                          {userEmail}
                        </p>
                      )}
                    </div>

                    {onHistoryClick && (
                      <button
                        type="button"
                        onClick={openHistory}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer"
                        role="menuitem"
                      >
                        <History className="h-4 w-4" />
                        <span>Study History</span>
                      </button>
                    )}

                    {onLogout && (
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 lg:block hidden text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={onSignUpClick}
                className="px-3 py-1.5  text-xs font-mono font-bold text-white bg-slate-950 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          <span className="w-px h-4 bg-slate-200 hidden sm:inline"></span>

          {onGuideClick && (
            <button
              onClick={onGuideClick}
              className="lg:block hidden items-center h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-xs text-indigo-700 font-bold transition-all cursor-pointer border border-indigo-100/50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">System Guide</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
