import React, { useState, useEffect } from 'react';
import { X, Sliders, Sparkles, Star, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { calculateMatchScore } from '../utils/api';

export default function MatchScoreModal({
  isOpen,
  onClose,
  onSelectPlace
}) {
  const [weights, setWeights] = useState({
    affordability: 60,
    safety: 80,
    accessibility: 50,
    cleanliness: 70,
    rating: 85
  });

  const [rankedResults, setRankedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRankings = async (currentWeights) => {
    setIsLoading(true);
    try {
      const res = await calculateMatchScore(currentWeights);
      if (res.rankedPlaces) {
        setRankedResults(res.rankedPlaces);
      }
    } catch (err) {
      console.warn('Match score error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRankings(weights);
    }
  }, [isOpen]);

  const handleSliderChange = (key, value) => {
    const updated = { ...weights, [key]: Number(value) };
    setWeights(updated);
    fetchRankings(updated);
  };

  const handleReset = () => {
    const defaultWeights = {
      affordability: 60,
      safety: 80,
      accessibility: 50,
      cleanliness: 70,
      rating: 85
    };
    setWeights(defaultWeights);
    fetchRankings(defaultWeights);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-navy-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-navy-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">City Match Score — Personalized Place Evaluator</h3>
              <p className="text-xs text-slate-400">Tune criteria weights to rank destinations based on your exact personal needs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout: Sliders Left/Top, Ranked Places Right/Bottom */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 no-scrollbar">
          
          {/* Sliders Configuration Column */}
          <div className="lg:col-span-5 space-y-4 bg-navy-900/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Priority Weightings</h4>

            {/* Affordability Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Affordability (Budget friendly)</span>
                <span className="font-bold text-teal-300">{weights.affordability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.affordability}
                onChange={(e) => handleSliderChange('affordability', e.target.value)}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            {/* Safety & Hazard Avoidance Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Safety & Low Hazards</span>
                <span className="font-bold text-emerald-300">{weights.safety}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.safety}
                onChange={(e) => handleSliderChange('safety', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Accessibility Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Step-Free Accessibility</span>
                <span className="font-bold text-blue-300">{weights.accessibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.accessibility}
                onChange={(e) => handleSliderChange('accessibility', e.target.value)}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Cleanliness Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Cleanliness & Hygiene</span>
                <span className="font-bold text-indigo-300">{weights.cleanliness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.cleanliness}
                onChange={(e) => handleSliderChange('cleanliness', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Rating Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Visitor Rating & Reviews</span>
                <span className="font-bold text-amber-300">{weights.rating}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.rating}
                onChange={(e) => handleSliderChange('rating', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              The City Match Score combines normalized attributes with penalty reductions for reported civic hazards within a 500m radius.
            </p>
          </div>

          {/* Ranked Results Column */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Personalized Destination Rankings ({rankedResults.length})
              </h4>
              {isLoading && <span className="text-xs text-brand-400 animate-pulse">Recalculating scores...</span>}
            </div>

            <div className="space-y-3">
              {rankedResults.slice(0, 10).map((place, idx) => (
                <div
                  key={place.id}
                  className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 font-extrabold text-sm flex-shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-white truncate">{place.name}</h5>
                        <span className="text-xs text-amber-400 font-medium">★ {place.rating}</span>
                      </div>
                      <p className="text-xs text-brand-300 font-medium">{place.neighborhood} • {place.estimated_cost}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{place.reasoning}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-brand-400">{place.matchScore}/100</div>
                      <div className="text-[10px] text-slate-500 font-medium">Match</div>
                    </div>
                    <button
                      onClick={() => {
                        onSelectPlace(place);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-700 hover:border-brand-500/50 text-slate-200 text-xs font-semibold transition-all"
                    >
                      Inspect →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
