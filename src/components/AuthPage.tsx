import React, { useState } from "react";
import {
  KeyRound,
  Mail,
  Chrome,
  ArrowLeft,
  Info,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthPageProps {
  onAuthSuccess: (userEmail: string, userId?: string) => void;
  onBackToApp: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthPage({
  onAuthSuccess,
  onBackToApp,
  initialMode = "login",
}: AuthPageProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle standard email signup / login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all email and password fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // If Supabase is real & configured
    if (isSupabaseConfigured && supabase) {
      try {
        if (authMode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;

          if (data.user) {
            setSuccessMsg(
              "Registration initiated successfully! A verification email has been dispatched (if enabled) or you are now logged in.",
            );
            setTimeout(() => {
              onAuthSuccess(email, data.user?.id);
            }, 1800);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          if (data.user) {
            setSuccessMsg("Authentication verified! Loading dashboard...");
            setTimeout(() => {
              onAuthSuccess(data.user?.email || email, data.user?.id);
            }, 1000);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Credential authentication failed.");
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate authentic flow immediately inside container previews
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg(
          `Welcome to Cogito! Simulation authenticated successfully as: ${email}`,
        );
        setTimeout(() => {
          onAuthSuccess(email);
        }, 1200);
      }, 700);
    }
  };

  // Google OAuth flow
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setErrorMsg(
          err.message || "Failed to trigger Google authentication provider.",
        );
        setLoading(false);
      }
    } else {
      // Sandbox Simulator
      setTimeout(() => {
        setLoading(false);
        const tempEmail = "googler.student@example.com";
        setSuccessMsg(
          `Welcome! Google Account linked successfully: ${tempEmail}`,
        );
        setTimeout(() => {
          onAuthSuccess(tempEmail);
        }, 1200);
      }, 800);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6 text-left animate-fade-in relative z-10">
      {/* Brand logo header */}
      <div className="text-center mb-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white mx-auto shadow-sm mb-4">
          <GraduationCap className="h-6 w-6 text-slate-100" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-950 tracking-tight">
          {authMode === "login" ? "Access Cogito Account" : "Join Cogito Synth"}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-sans leading-relaxed">
          Unlock high-fidelity flashcard synthesis, custom evaluated questions,
          and historic workspace synchs.
        </p>
      </div>
      {/* Return back home pointer */}
      <div className="text-center mb-4">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="underline cursor-pointer">
            Return back to Study materials
          </span>
        </button>
      </div>
      {/* Supabase Status Helper banner */}
      {!isSupabaseConfigured && (
        <div className="mb-6 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-[11px] text-slate-600 leading-normal">
          <div className="flex items-center space-x-1 text-slate-800 font-semibold mb-1">
            <Info className="h-3.5 w-3.5 text-indigo-600" />
            <span>Interactive Auth Mock mode Active</span>
          </div>
          <p className="text-[10.5px]">
            Configure{" "}
            <code className="font-mono bg-white px-1 border rounded text-[9px]">
              VITE_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="font-mono bg-white px-1 border rounded text-[9px]">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            in the Settings to connect your actual live Supabase backend
            database!
          </p>
        </div>
      )}

      {/* Primary form wrapper component */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm">
        {/* Toggle Mode headers */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-3 text-center rounded-xl text-xs font-mono font-bold transition-all ${
              authMode === "login"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-3 text-center rounded-xl text-xs font-mono font-bold transition-all ${
              authMode === "signup"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* FEEDBACK LABELS */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-100 p-3 rounded-xl text-[11px] text-red-700 font-sans leading-snug">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-100/50 p-3 rounded-xl text-[11px] text-emerald-800 font-sans leading-snug flex items-start space-x-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PRIMARY ACTION BUTTON: CONTINUE WITH GOOGLE */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3.5 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-800 text-xs font-semibold tracking-tight transition-all cursor-pointer active:scale-[0.985] group disabled:opacity-50"
          >
            {/* Elegant multi-color styled Chrome / Google emblem placeholder */}
            <Chrome className="h-4 w-4 text-slate-800 group-hover:rotate-12 transition-transform" />
            <span>Continue with Google</span>
          </button>

          {/* Separator badge */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative bg-white px-3.5 text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              Or Use Email credentials
            </span>
          </div>
        </div>

        {/* SECONDARY ACTION: EMAIL FORM */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {/* Email input field */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center space-x-1">
              <Mail className="h-3 w-3 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              disabled={loading}
              placeholder="e.g. name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-200 bg-white placeholder-slate-350 text-xs py-2.5 px-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-sans"
            />
          </div>

          {/* Password Input field */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center space-x-1">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Password Key</span>
            </label>
            <input
              type="password"
              required
              disabled={loading}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-200 bg-white text-xs py-2.5 px-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-sans"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-1.5 py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>
              {loading
                ? "Authorizing access..."
                : authMode === "login"
                  ? "PROCEED TO APPS"
                  : "CREATE MY ACCOUNT"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Quick Mock Helper fill click to save user testing time */}
          {!isSupabaseConfigured && (
            <div className="text-center mt-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail("demo.student@cogito.io");
                  setPassword("cogitopassword");
                }}
                className="text-[9.5px] text-indigo-600 hover:underline hover:text-indigo-800 font-mono"
              >
                ⚡ Autofill Demo Credentials
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
