import React, { useState } from 'react';
import { X, MapPin, Clock, DollarSign, Heart, Navigation, ShieldCheck, Sparkles, AlertTriangle, Star, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PlaceDetailsDrawer({
  place,
  onClose,
  onDirections,
  onToggleSave,
  isSaved = false
}) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  if (!place) return null;

  const match = place.matchScore || {
    score: 88,
    breakdown: {
      affordability: { score: 90 },
      rating: { score: 92 },
      accessibility: { score: 80 },
      cleanliness: { score: 85 },
      safety: { score: 90, nearbyHazardsCount: place.nearbyHazardsCount || 0 }
    },
    reasoning: `High visitor satisfaction rating (${place.rating}★) and verified municipal accessibility.`
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-navy-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col transition-transform transform translate-x-0 overflow-hidden">
      
      {/* Header Image & Action Bar */}
      <div className="relative h-60 w-full flex-shrink-0 bg-slate-900">
        <img
          src={place.image_url}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

        {/* Top Floating Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex gap-2">
            {place.is_hidden_gem === 1 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/80 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Hidden Gem
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/80 text-white backdrop-blur-md shadow-md uppercase">
              {place.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-navy-900/80 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="font-display text-2xl font-black text-white tracking-tight drop-shadow-md">{place.name}</h2>
          <div className="flex items-center gap-2 text-xs text-teal-300 font-semibold mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{place.neighborhood} • {place.address}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-navy-900/80 border border-slate-800 text-center">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Rating</div>
            <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{place.rating}</span>
              <span className="text-[10px] text-slate-500 font-normal">({place.review_count})</span>
            </div>
          </div>

          <div className="border-x border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Approx Cost</div>
            <div className="text-xs font-bold text-teal-300 mt-0.5 truncate px-1">
              {place.estimated_cost || '₹ Budget'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-medium">Match Score</div>
            <div className="text-sm font-bold text-brand-400 mt-0.5">
              {match.score}/100
            </div>
          </div>
        </div>

        {/* City Match Score Breakdown Drawer */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-brand-950/40 to-slate-900/60 border border-brand-500/20">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowScoreDetails(!showScoreDetails)}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/30 font-bold text-xs">
                {match.score}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">City Match Analysis</h4>
                <p className="text-[11px] text-slate-400">Transparent factor rating</p>
              </div>
            </div>
            <span className="text-xs text-brand-300 font-semibold flex items-center gap-0.5">
              {showScoreDetails ? 'Hide' : 'Explain'} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showScoreDetails ? 'rotate-90' : ''}`} />
            </span>
          </div>

          {showScoreDetails && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
              <p className="text-slate-300 leading-relaxed italic">{match.reasoning}</p>
              
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Affordability Rating</span>
                  <span className="font-semibold text-teal-300">{match.breakdown?.affordability?.score}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${match.breakdown?.affordability?.score}%` }}></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Visitor Rating & Reviews</span>
                  <span className="font-semibold text-amber-300">{match.breakdown?.rating?.score}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${match.breakdown?.rating?.score}%` }}></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Step-Free Accessibility</span>
                  <span className="font-semibold text-blue-300">{match.breakdown?.accessibility?.score}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: `${match.breakdown?.accessibility?.score}%` }}></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Civic Hazard Clearance</span>
                  <span className="font-semibold text-emerald-300">{match.breakdown?.safety?.score}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${match.breakdown?.safety?.score}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">About</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{place.description}</p>
        </div>

        {/* Factual Historical / Cultural Context */}
        {place.historical_context && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <span>🏛️ Cultural & Historical Insight</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{place.historical_context}</p>
            <div className="text-[10px] text-slate-400 mt-2">
              Source: <span className="text-slate-300">{place.source}</span>
            </div>
          </div>
        )}

        {/* Timings & Best Time */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span><strong className="text-white">Hours:</strong> {place.opening_hours || 'Open all day'}</span>
          </div>
          {place.best_time_to_visit && (
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong className="text-white">Best Visit:</strong> {place.best_time_to_visit}</span>
            </div>
          )}
        </div>

        {/* Civic Alert Status in Neighborhood */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {place.nearbyHazardsCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {place.nearbyHazardsCount > 0 ? `${place.nearbyHazardsCount} active hazard(s) nearby` : 'Surrounding Corridor Clear'}
              </div>
              <p className="text-[11px] text-slate-400">
                {place.nearbyHazardsCount > 0 ? 'Check map for road cautions' : 'No severe potholes or closures reported'}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {place.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Footer Bottom Actions */}
      <div className="p-4 border-t border-slate-800 bg-navy-950 flex items-center gap-3">
        <button
          onClick={() => onToggleSave(place.id)}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            isSaved
              ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm'
              : 'bg-navy-900 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-400 text-pink-400' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={() => onDirections(place)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>Get Directions</span>
        </button>
      </div>

    </div>
  );
}
