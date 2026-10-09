import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Sliders, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  Info,
  Layers,
  Award
} from 'lucide-react';
import { comparePlaces } from '../../utils/api';

export default function ComparePlacesView({
  places = [],
  currentCity = 'Pune'
}) {
  const [compareType, setCompareType] = useState('places'); // 'places' | 'neighborhoods'
  
  // Selected IDs
  const [placeAId, setPlaceAId] = useState('');
  const [placeBId, setPlaceBId] = useState('');
  const [neighborhoodA, setNeighborhoodA] = useState('Old Pune');
  const [neighborhoodB, setNeighborhoodB] = useState('Koregaon Park');

  // Weights (Sums or normalized)
  const [weights, setWeights] = useState({
    affordability: 20,
    rating: 20,
    cleanliness: 15,
    accessibility: 15,
    safety: 15,
    culture: 15
  });

  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize defaults once places load
  useEffect(() => {
    if (places.length >= 2 && !placeAId && !placeBId) {
      setPlaceAId(places[0].id);
      setPlaceBId(places[1].id);
    }
  }, [places]);

  // Extract distinct neighborhoods
  const distinctNeighborhoods = Array.from(new Set(places.map(p => p.neighborhood).filter(Boolean)));

  // Perform Comparison
  const handleRunComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        type: compareType,
        weights,
        ...(compareType === 'places' 
          ? { placeAId: Number(placeAId), placeBId: Number(placeBId) }
          : { neighborhoodA, neighborhoodB })
      };

      const res = await comparePlaces(payload);
      setComparisonResult(res);
    } catch (err) {
      setError(err.message || 'Failed to compare');
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically when selections change if valid
  useEffect(() => {
    if (compareType === 'places' && placeAId && placeBId && placeAId !== placeBId) {
      handleRunComparison();
    } else if (compareType === 'neighborhoods' && neighborhoodA && neighborhoodB && neighborhoodA !== neighborhoodB) {
      handleRunComparison();
    }
  }, [placeAId, placeBId, neighborhoodA, neighborhoodB, compareType]);

  // Preset Weight Profiles
  const applyPreset = (presetName) => {
    if (presetName === 'budget') {
      setWeights({ affordability: 45, rating: 20, cleanliness: 10, accessibility: 10, safety: 10, culture: 5 });
    } else if (presetName === 'accessible') {
      setWeights({ affordability: 10, rating: 15, cleanliness: 15, accessibility: 45, safety: 10, culture: 5 });
    } else if (presetName === 'culture') {
      setWeights({ affordability: 10, rating: 20, cleanliness: 10, accessibility: 10, safety: 10, culture: 40 });
    } else if (presetName === 'safety') {
      setWeights({ affordability: 10, rating: 15, cleanliness: 15, accessibility: 10, safety: 40, culture: 10 });
    } else {
      // Balanced
      setWeights({ affordability: 20, rating: 20, cleanliness: 15, accessibility: 15, safety: 15, culture: 15 });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-space-900 via-cyan-950/20 to-space-950 border border-cyan-500/20 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          <span>Transparent Multi-Factor Analysis</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-black text-white">
          Compare Places & Neighborhoods
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Evaluate two destinations or neighborhoods side by side. Customize your preference weights for price, ratings, accessibility, safety hazards, and cultural significance to view empirical scores and transparent explanations.
        </p>
      </div>

      {/* Selectors and Mode Switch */}
      <section className="p-6 sm:p-8 rounded-3xl bg-space-850/90 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Toggle Mode */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareType('places')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                compareType === 'places'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-glow-teal'
                  : 'bg-space-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Compare Places Side-by-Side
            </button>
            <button
              onClick={() => setCompareType('neighborhoods')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                compareType === 'neighborhoods'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-glow-teal'
                  : 'bg-space-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Compare Neighborhoods
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Zero Bias • Evidence-Based Math
          </span>
        </div>

        {/* Selection Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target A */}
          <div className="p-4 rounded-2xl bg-space-950 border border-teal-500/30 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <span>Option A</span>
            </span>

            {compareType === 'places' ? (
              <select
                value={placeAId}
                onChange={(e) => setPlaceAId(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
              >
                {places.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{p.name} ({p.neighborhood})</option>
                ))}
              </select>
            ) : (
              <select
                value={neighborhoodA}
                onChange={(e) => setNeighborhoodA(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
              >
                {distinctNeighborhoods.map((n, i) => (
                  <option key={i} value={n} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{n}</option>
                ))}
              </select>
            )}
          </div>

          {/* Target B */}
          <div className="p-4 rounded-2xl bg-space-950 border border-cyan-500/30 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>Option B</span>
            </span>

            {compareType === 'places' ? (
              <select
                value={placeBId}
                onChange={(e) => setPlaceBId(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-cyan-400"
              >
                {places.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{p.name} ({p.neighborhood})</option>
                ))}
              </select>
            ) : (
              <select
                value={neighborhoodB}
                onChange={(e) => setNeighborhoodB(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-bold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-cyan-400"
              >
                {distinctNeighborhoods.map((n, i) => (
                  <option key={i} value={n} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{n}</option>
                ))}
              </select>
            )}
          </div>

        </div>

        {/* User-Adjustable Importance Weights Sliders */}
        <div className="p-5 rounded-2xl bg-space-950/70 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Customize Preference Weights</span>
            </span>

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Presets:</span>
              <button
                onClick={() => applyPreset('balanced')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700"
              >
                Balanced
              </button>
              <button
                onClick={() => applyPreset('budget')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700"
              >
                Budget Focus
              </button>
              <button
                onClick={() => applyPreset('accessible')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700"
              >
                Accessibility
              </button>
              <button
                onClick={() => applyPreset('culture')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700"
              >
                Heritage
              </button>
              <button
                onClick={() => applyPreset('safety')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700"
              >
                Safety First
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Affordability (Price)</span>
                <span className="font-bold text-teal-400">{weights.affordability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.affordability}
                onChange={(e) => setWeights({ ...weights, affordability: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Ratings & Reviews</span>
                <span className="font-bold text-teal-400">{weights.rating}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.rating}
                onChange={(e) => setWeights({ ...weights, rating: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Cleanliness Evidence</span>
                <span className="font-bold text-teal-400">{weights.cleanliness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.cleanliness}
                onChange={(e) => setWeights({ ...weights, cleanliness: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Step-Free Accessibility</span>
                <span className="font-bold text-teal-400">{weights.accessibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.accessibility}
                onChange={(e) => setWeights({ ...weights, accessibility: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Safety / Hazard Avoidance</span>
                <span className="font-bold text-teal-400">{weights.safety}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.safety}
                onChange={(e) => setWeights({ ...weights, safety: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Culture & Heritage Value</span>
                <span className="font-bold text-teal-400">{weights.culture}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.culture}
                onChange={(e) => setWeights({ ...weights, culture: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleRunComparison}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-glow-teal disabled:opacity-50"
            >
              {isLoading ? 'Recalculating...' : 'Recalculate Comparison'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Comparison Result Cards & Breakdown */}
        {comparisonResult && (
          <div className="pt-6 border-t border-slate-800/80 space-y-6">
            
            {/* Top Winner Card & Transparent Rationale */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-space-950 via-teal-950/20 to-space-950 border border-teal-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    {comparisonResult.labels?.bestMatch ? `Best Match: ${comparisonResult.labels.bestMatch}` : 'Comparison Summary'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {comparisonResult.labels?.moreAffordable && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-space-850 text-emerald-400 border border-emerald-500/20">
                      💰 More Affordable: {comparisonResult.labels.moreAffordable}
                    </span>
                  )}
                  {comparisonResult.labels?.moreAccessible && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-space-850 text-cyan-400 border border-cyan-500/20">
                      ♿ More Accessible: {comparisonResult.labels.moreAccessible}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {comparisonResult.rationale}
              </p>
            </div>

            {/* Side-by-Side Head-to-Head Cards */}
            {compareType === 'places' && comparisonResult.placeA && comparisonResult.placeB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Place A Card */}
                <div className="p-5 rounded-2xl bg-space-950 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Option A</span>
                      <h3 className="font-display font-black text-lg text-white mt-0.5">
                        {comparisonResult.placeA.name}
                      </h3>
                      <p className="text-xs text-slate-400">{comparisonResult.placeA.neighborhood}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-teal-300">
                        {comparisonResult.placeA.score}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <FactorBar label="Affordability" score={comparisonResult.placeA.factors.affordability} />
                    <FactorBar label="User Rating" score={comparisonResult.placeA.factors.rating} />
                    <FactorBar label="Cleanliness" score={comparisonResult.placeA.factors.cleanliness} />
                    <FactorBar label="Accessibility" score={comparisonResult.placeA.factors.accessibility} />
                    <FactorBar label="Safety Corridor" score={comparisonResult.placeA.factors.safety} />
                    <FactorBar label="Heritage / Culture" score={comparisonResult.placeA.factors.culture} />
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Est Cost: <strong className="text-white">{comparisonResult.placeA.estimated_cost}</strong></span>
                    <span>Nearby Hazards: <strong className="text-amber-400">{comparisonResult.placeA.hazardsNearby}</strong></span>
                  </div>
                </div>

                {/* Place B Card */}
                <div className="p-5 rounded-2xl bg-space-950 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Option B</span>
                      <h3 className="font-display font-black text-lg text-white mt-0.5">
                        {comparisonResult.placeB.name}
                      </h3>
                      <p className="text-xs text-slate-400">{comparisonResult.placeB.neighborhood}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-cyan-300">
                        {comparisonResult.placeB.score}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <FactorBar label="Affordability" score={comparisonResult.placeB.factors.affordability} />
                    <FactorBar label="User Rating" score={comparisonResult.placeB.factors.rating} />
                    <FactorBar label="Cleanliness" score={comparisonResult.placeB.factors.cleanliness} />
                    <FactorBar label="Accessibility" score={comparisonResult.placeB.factors.accessibility} />
                    <FactorBar label="Safety Corridor" score={comparisonResult.placeB.factors.safety} />
                    <FactorBar label="Heritage / Culture" score={comparisonResult.placeB.factors.culture} />
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Est Cost: <strong className="text-white">{comparisonResult.placeB.estimated_cost}</strong></span>
                    <span>Nearby Hazards: <strong className="text-amber-400">{comparisonResult.placeB.hazardsNearby}</strong></span>
                  </div>
                </div>

              </div>
            )}

            {/* Neighborhoods Side-by-Side */}
            {compareType === 'neighborhoods' && comparisonResult.neighborhoodA && comparisonResult.neighborhoodB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-space-950 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-400 uppercase">Neighborhood A</span>
                      <h3 className="font-display font-black text-xl text-white">{comparisonResult.neighborhoodA.name}</h3>
                      <p className="text-xs text-slate-400">{comparisonResult.neighborhoodA.placesCount} verified spots</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-teal-300">{comparisonResult.neighborhoodA.score}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <FactorBar label="Average Rating" score={comparisonResult.neighborhoodA.factors.rating} />
                    <FactorBar label="Accessibility" score={comparisonResult.neighborhoodA.factors.accessibility} />
                    <FactorBar label="Safety Corridor" score={comparisonResult.neighborhoodA.factors.safety} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-space-950 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">Neighborhood B</span>
                      <h3 className="font-display font-black text-xl text-white">{comparisonResult.neighborhoodB.name}</h3>
                      <p className="text-xs text-slate-400">{comparisonResult.neighborhoodB.placesCount} verified spots</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-cyan-300">{comparisonResult.neighborhoodB.score}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <FactorBar label="Average Rating" score={comparisonResult.neighborhoodB.factors.rating} />
                    <FactorBar label="Accessibility" score={comparisonResult.neighborhoodB.factors.accessibility} />
                    <FactorBar label="Safety Corridor" score={comparisonResult.neighborhoodB.factors.safety} />
                  </div>
                </div>
              </div>
            )}

            {/* Explanation of Transparent Integrity */}
            <div className="p-4 rounded-xl bg-space-850/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Transparent Scoring Methodology</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The composite comparison score calculates weighted factor averages normalized from 0-100 based strictly on verified pricing, municipal records, step-free access data, and active corroborated hazard proximity. Missing data is never substituted with false scores.
              </p>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}

function FactorBar({ label, score = 0 }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-300">
        <span>{label}</span>
        <span className="font-bold text-slate-200">{score}/100</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
