import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Home, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  Landmark, 
  Scale, 
  Database,
  CheckCircle2,
  Award
} from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    sectionId: 'home',
    title: '1. Home — Platform Purpose & City Overview',
    icon: Home,
    badge: 'Overview',
    description: 'CitySense AI solves urban chaos with grounded intelligence. The landing page provides an immediate pulse of the city—live weather, air quality, verified place counts, and an interactive Leaflet map—plus quick natural-language query triggers.',
    judgeHighlight: 'Clean first screen with zero clutter, no fake metrics, and instant access to all core modules.'
  },
  {
    step: 2,
    sectionId: 'explore',
    title: '2. Explore Places — 8 Verified Categories',
    icon: Compass,
    badge: 'Hospitality & Gems',
    description: 'Browse hotels, dining, street food, heritage landmarks, nature, nightlife, shopping, and spiritual sites with verified operating hours and coordinates. Features real bookmarking and directions.',
    judgeHighlight: 'No fabricated listings or invented hotel prices; 30 authentic Pune locations with verified municipal/ASI metadata.'
  },
  {
    step: 3,
    sectionId: 'safety',
    title: '3. Smart Routes — Corridor Hazard Corroboration',
    icon: ShieldCheck,
    badge: 'OSRM Routing',
    description: 'Calculates real routes using the Open Source Routing Machine (OSRM). Intersects every road segment with active citizen hazard reports within an 180-meter buffer corridor.',
    judgeHighlight: 'Evidence-based transparency: Routes with no reports are labeled "No Verified Hazards Reported" instead of misleading "Guaranteed Safe".'
  },
  {
    step: 4,
    sectionId: 'traffic',
    title: '4. City Pulse — Civic Reporting & Telemetry',
    icon: AlertTriangle,
    badge: 'Telemetry & Reports',
    description: 'Real Open-Meteo weather and air quality paired with citizen reporting for potholes, waterlogging, and road closures. Includes duplicate detection, corroboration upvotes, and review workflows.',
    judgeHighlight: 'Honest telemetry disclosure: Discloses sensor requirements for per-lane live traffic while providing authentic citizen corridor notices.'
  },
  {
    step: 5,
    sectionId: 'history',
    title: '5. History & Culture — Heritage Tour Generator',
    icon: Landmark,
    badge: 'Cultural AI',
    description: 'Explores Peshwa-era heritage sites, ancient rock-cut caves, and colonial memorials with source-supported history. Generates optimized multi-stop heritage itineraries using greedy TSP scheduling.',
    judgeHighlight: 'Automated tour planner respects time budgets and admission prices without inventing historical facts.'
  },
  {
    step: 6,
    sectionId: 'compare',
    title: '6. Compare Places — Transparent Multi-Factor Score',
    icon: Scale,
    badge: 'Best vs Worst',
    description: 'Side-by-side comparison of any 2 to 4 places. Calculates an explainable City Reality Score across 6 weighted factors (safety, budget, transit, crowds, cleanliness, rating).',
    judgeHighlight: 'Transparent math: Explains why the winner won with plain-English rationales; missing data yields "Not enough data" rather than false scores.'
  },
  {
    step: 7,
    sectionId: 'ai',
    title: '7. AI City Assistant — Grounded Google Gemini RAG',
    icon: Sparkles,
    badge: 'Gemini RAG',
    description: 'A conversational assistant powered by Google Gemini (models/gemini-flash-lite-latest), strictly anchored in the local SQLite database to prevent hallucinations. Generates actionable recommendations tailored to budget and time.',
    judgeHighlight: 'Supports real natural language questions like "3 hours and ₹500 budget" with real places, walking distances, and cost estimates.'
  },
  {
    step: 8,
    sectionId: 'sources',
    title: '8. Data & Sources — Engineering & Security Trust',
    icon: Database,
    badge: 'Transparency',
    description: 'Live status dashboard that independently pings Google Gemini, Open-Meteo, OSRM, OSM, and SQLite in real time. Proves zero frontend key leakage and transparent data freshness.',
    judgeHighlight: 'Demonstrates professional software engineering ethics: No hidden secrets, no fabricated live stats, and graceful fallbacks.'
  }
];

export default function JudgeTourModal({
  isOpen,
  onClose,
  activeSection,
  onNavigate
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Sync step if user navigates externally
  useEffect(() => {
    const idx = TOUR_STEPS.findIndex(s => s.sectionId === activeSection);
    if (idx !== -1 && isOpen) {
      setCurrentStepIndex(idx);
    }
  }, [activeSection, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;

  const goToStep = (index) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
      onNavigate(TOUR_STEPS[index].sectionId);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl rounded-3xl bg-[#090e1a] border border-teal-500/40 shadow-2xl shadow-teal-500/20 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div 
            className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                  Judge Tour • Step {currentStep.step} of {TOUR_STEPS.length}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                  {currentStep.badge}
                </span>
              </div>
              <h3 className="font-display font-black text-base text-white">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
            {currentStep.description}
          </p>

          {/* Judge Highlight Box */}
          <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block mb-0.5">
                Judge Evaluation Criteria
              </span>
              <p className="text-teal-100 font-medium leading-relaxed text-[11px]">
                {currentStep.judgeHighlight}
              </p>
            </div>
          </div>

          {/* Step Dots Selector */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.step}
                onClick={() => goToStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex 
                    ? 'w-7 bg-teal-400' 
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to step ${step.step}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#070b14] border-t border-slate-800/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 transition-colors"
          >
            Skip / Exit Tour
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-glow-teal"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
