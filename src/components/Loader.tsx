import { useEffect, useState } from "react";
import { Sparkles, Brain, Cpu, FileClock, Compass } from "lucide-react";

const LOADING_STATUSES = [
  "Ingesting provided study guide details...",
  "Formatting structure of pages...",
  "Running high-relevance semantic analysis...",
  "Extracting vital educational parameters...",
  "Generating multi-option questions with AI...",
  "Curating logical distractor answers...",
  "Validating correctness of pedagogical citations...",
  "Rendering final state-flipped canvas elements...",
];

export default function Loader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % LOADING_STATUSES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      {/* Animated Icon Cluster */}
      <div className="relative inline-flex items-center justify-center mb-8">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-slate-100 animate-ping opacity-60 h-20 w-20 scale-[1.3] mx-auto"></div>

        {/* Main rotation body */}
        <div className="h-20 w-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white relative shadow-md">
          <Compass className="h-9 w-9 text-slate-100 animate-[spin_5s_linear_infinite]" />
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">
            <Sparkles className="h-2.5 w-2.5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Shifting loading tags */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-slate-950 text-md">
          Synthesizing Material
        </h3>

        <div className="h-6 overflow-hidden relative">
          <p className="text-xs text-slate-500 font-mono tracking-tight font-medium animate-fade">
            {LOADING_STATUSES[index]}
          </p>
        </div>

        {/* Dynamic fake metric tracker */}
        <div className="w-40 mx-auto bg-slate-100 rounded-full h-1 overflow-hidden mt-4">
          <div
            className="bg-slate-900 h-full animate-[shimmer_1.5s_infinite]"
            style={{ width: "60%" }}
          ></div>
        </div>

        <p className="text-[10px] text-slate-400 font-mono mt-8">
          Powered by AI • Context Grounding
        </p>
      </div>
    </div>
  );
}
