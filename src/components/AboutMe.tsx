import React, { useState } from "react";
import { 
  User, 
  Terminal, 
  Layers, 
  Cpu, 
  Sparkles, 
  Code, 
  Compass, 
  Mail, 
  CheckCircle,
  ArrowRight,
  Home
} from "lucide-react";

interface AboutMeProps {
  onBackToHome: () => void;
}

export default function AboutMe({ onBackToHome }: AboutMeProps) {
  const [activeTab, setActiveTab] = useState<'stack' | 'philosophy' | 'experience'>('stack');
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const coreSkills = [
    { name: "Next.js & React 19", level: "Expert", desc: "Server components, hook stabilization, fluid state flow" },
    { name: "Tailwind CSS & Design Systems", level: "Expert", desc: "Fluid custom scales, modern tokens, micro-interactions" },
    { name: "Node.js & Express Bundling", level: "Expert", desc: "Optimized server.ts with esbuild bundling to CommonJS" },
    { name: "Gemini 3.5 AI Integration", level: "Advanced", desc: "Structured outputs with response schemas using @google/genai" },
    { name: "Performance Engineering", level: "Advanced", desc: "Lazy loading, clean hook dependencies, asset optimization" }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 text-left animate-fade-in">
      
      {/* Hero Badge & Typography Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 bg-slate-150 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-slate-700 mb-4 tracking-wider uppercase">
          <User className="h-3.5 w-3.5 text-slate-900" />
          <span>Meet the Architect</span>
        </div>
        <h1 className="cogito-title text-4xl sm:text-5xl mb-2">
          Crafting High-Fidelity <br />
          <span className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
            Synaptic Experiences
          </span>
        </h1>
        <p className="text-slate-500 font-sans text-sm max-w-xl mx-auto leading-relaxed">
          Behind Cogito is a full-stack engineer focused on clean layouts, architectural honesty, and the seamless integration of Generative Intelligence.
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Developer Portrait / Card Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="cogito-card flex flex-col items-center text-center p-6 bg-slate-950! text-white border-slate-900!">
            
            {/* Elegant avatar placeholder using purely beautiful design */}
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md h-20 w-20 scale-110"></div>
              <div className="h-20 w-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white relative shadow-sm">
                <Terminal className="h-9 w-9 text-indigo-400" />
              </div>
            </div>

            <h3 className="font-display font-bold text-lg text-slate-50 tracking-tight">
              Lance Magollado
            </h3>
            <p className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest font-semibold mt-0.5">
              Full-Stack Developer
            </p>

            <div className="w-full border-t border-slate-900 my-4"></div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              I specialize in robust React ecosystems, low-overhead backend systems, and rapid prototyping utilizing Gemini models.
            </p>

            <div className="w-full space-y-2 text-left text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-slate-200 font-semibold">Earth, UTC+8</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Core Framework:</span>
                <span className="text-slate-200 font-semibold">NextJS + Vite</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>AI Core:</span>
                <span className="text-slate-200 font-semibold">Gemini 3.5</span>
              </div>
            </div>

            <button
              onClick={onBackToHome}
              className="mt-6 w-full cogito-btn-primary bg-indigo-600! hover:bg-indigo-700!"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Back To App</span>
            </button>
          </div>

          {/* Connected Projects Card */}
          <div className="cogito-card p-5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 block">
              Cogito Ecosystem
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-800">Cogito Flashcards</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-800">Cogito Evaluation Quiz</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-400 italic">Cogito Note-Summarizer (v4)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic tab-swapped layout details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Navigation Tab bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto space-x-6">
            <button
              onClick={() => setActiveTab('stack')}
              className={`pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'stack'
                  ? 'border-indigo-600 text-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Technology Stack
            </button>
            <button
              onClick={() => setActiveTab('philosophy')}
              className={`pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'philosophy'
                  ? 'border-indigo-600 text-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Design Philosophy
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'experience'
                  ? 'border-indigo-600 text-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Developer Vision
            </button>
          </div>

          {/* Dynamic Sections */}
          {activeTab === 'stack' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                The architecture uses standard high-quality components designed with meticulous precision. Check out the shareable variables and style controls loaded via global CSS properties:
              </p>

              <div className="space-y-3">
                {coreSkills.map((sh, idx) => (
                  <div key={idx} className="cogito-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-display text-slate-950">{sh.name}</span>
                        <span className="text-[9px] font-mono tracking-wider font-semibold border px-1.5 py-0.2 rounded bg-slate-50 text-slate-500 uppercase">
                          {sh.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        {sh.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'philosophy' && (
            <div className="cogito-card bg-slate-50/50 p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-left">
                  <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 font-display">Craftsmanship Over Defaults</h4>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed mt-0.5">
                      Never utilize generic visual gradients or low-contrast cards. Focus heavily on clean white elements paired with deep slate contrasts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-left">
                  <div className="h-6 w-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 font-display">Architectural Honesty (Anti-AI-Slop)</h4>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed mt-0.5">
                      Avoid decorating pages with fake system logs, infinite indicators, or simulated server terminal pings that act as visual distractions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-left">
                  <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 font-display">Human-Friendly UI Elements</h4>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed mt-0.5">
                      Keep labels humble, concise, and clear. Avoid overly dramatic prefixes in favor of direct utility flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="cogito-card p-5">
                <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  Our Mission
                </span>
                <h4 className="text-md font-bold font-display text-slate-950 leading-snug">
                  Synthesizing and leveling education parameters for everyone.
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed mt-2">
                  Traditional classrooms often treat every student identical. With Cogito, we allow users to shape study materials directly around complex textbooks, aligning counts and difficulty to match personalized speed curves instantly.
                </p>
              </div>

              {/* Minimal Newsletter Sign-Up widget */}
              <div className="cogito-card p-5 border-dashed border-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 mb-1 flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <span>Stay in touch?</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-sans mb-3">
                  Let's exchange ideas, architectural systems, or feedback. Enter your email below to receive rare design highlights.
                </p>

                {subscribed ? (
                  <div className="bg-emerald-50 border border-emerald-100/50 p-2.5 rounded-lg flex items-center space-x-2 text-emerald-800 text-xs">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Your request was saved. Let's build together!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your professional email..."
                      className="border border-slate-200 bg-white px-3 py-2 text-xs rounded-xl flex-1 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit" className="cogito-btn-primary py-2! sm:px-4! font-sans text-xs flex items-center justify-center">
                      <span>Subscribe</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
