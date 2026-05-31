import {
  BookOpen,
  Upload,
  Settings2,
  Zap,
  BrainCircuit,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
} from "lucide-react";

interface GuideProps {
  onBackToHome: () => void;
}

export default function Guide({ onBackToHome }: GuideProps) {
  const steps = [
    {
      icon: <Upload className="h-5 w-5" />,
      title: "Upload Your Material",
      description:
        "Upload any PDF document or paste complex text. Cogito's engine analyzes the content structure automatically.",
    },
    {
      icon: <Settings2 className="h-5 w-5" />,
      title: "Configure Parameters",
      description:
        "Choose between Flashcards or Quiz mode. Adjust the difficulty level and the number of items you wish to generate.",
    },
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: "AI Synthesis",
      description:
        "Our Gemini-powered engine synthesizes the material into high-fidelity study resources in seconds.",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Interactive Study",
      description:
        "Engage with your generated content through interactive viewers designed for maximum retention.",
    },
  ];

  const features = [
    {
      title: "Cloud Sync",
      desc: "Sign in to save your generated sessions and access them from any device.",
      icon: <Globe className="h-4 w-4 text-indigo-500" />,
    },
    {
      title: "Secure & Private",
      desc: "Your documents are processed securely and never used for training models without consent.",
      icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: "PDF Analysis",
      desc: "Sophisticated parsing of technical documents, research papers, and textbooks.",
      icon: <FileText className="h-4 w-4 text-slate-500" />,
    },
    {
      title: "Smart Summaries",
      desc: "Get an instant overview of your uploaded content before jumping into testing.",
      icon: <MessageSquare className="h-4 w-4 text-amber-500" />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 text-left animate-fade-in mb-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-indigo-600 mb-4 tracking-wider uppercase">
          <BookOpen className="h-3.5 w-3.5" />
          <span>User Documentation</span>
        </div>
        <h1 className="cogito-title text-4xl sm:text-5xl mb-3">
          How to Master <br />
          <span className="bg-linear-to-r from-indigo-600 via-slate-900 to-indigo-800 bg-clip-text text-transparent">
            Your Learning Workflow
          </span>
        </h1>
        <p className="text-slate-500 font-sans text-sm max-w-xl mx-auto leading-relaxed">
          Unlock the full potential of Cogito's AI-driven synthesis tools with
          this comprehensive quick-start guide.
        </p>
      </div>

      {/* Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="cogito-card p-5 group hover:border-indigo-200 transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              {step.icon}
            </div>
            <h3 className="font-display font-bold text-slate-950 mb-2 text-sm tracking-tight">
              {step.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <section className="cogito-card p-6">
            <h2 className="font-display font-bold text-lg text-slate-950 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-500" />
              Quick Start Tips
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Optimal PDF Quality
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ensure your PDFs are text-readable rather than scanned
                    images for the highest accuracy in generation.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Difficulty Levels
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    'Mastery' level will create more conceptual and
                    application-based questions, while 'Foundation' focuses on
                    terminology.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Saving Sessions
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Always sign in before generating if you want to keep your
                    study decks for later review in the History panel.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-950 p-6 rounded-2xl border border-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16"></div>
            <h2 className="font-display font-bold text-lg text-white mb-4">
              Ready to start?
            </h2>
            <p className="text-slate-400 text-xs mb-6 max-w-sm">
              Experience the future of personal tutoring. Transform static
              documents into dynamic study partners.
            </p>
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Go to Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="cogito-card p-5">
            <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Features Interface
            </h3>
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5">{feature.icon}</div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900">
                      {feature.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
            <h3 className="text-[11px] font-bold text-indigo-900 mb-2 uppercase tracking-tight">
              Need Support?
            </h3>
            <p className="text-[10px] text-indigo-800/70 mb-3 leading-relaxed">
              Having trouble with your documents or the AI output quality?
            </p>
            <a
              href="mailto:support@cogito.study"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Contact Support
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
