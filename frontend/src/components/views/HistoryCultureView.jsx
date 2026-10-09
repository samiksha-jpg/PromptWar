import React, { useState } from 'react';
import { 
  Landmark, 
  Clock, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  Footprints, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Car, 
  Users, 
  Camera, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { generateHeritageTour } from '../../utils/api';

export default function HistoryCultureView({
  places = [],
  onSelectPlace,
  onViewRouteOnMap,
  currentCity = 'Pune'
}) {
  const [selectedSubTheme, setSelectedSubTheme] = useState('all');

  // Tour generator form state
  const [availableHours, setAvailableHours] = useState(2);
  const [travelMode, setTravelMode] = useState('walking');
  const [isGeneratingTour, setIsGeneratingTour] = useState(false);
  const [generatedTour, setGeneratedTour] = useState(null);
  const [tourError, setTourError] = useState(null);

  // Filter heritage places
  const heritagePlaces = places.filter(p => {
    const isHeritage = p.category === 'tourist_attraction' || 
                      p.category === 'hidden_gem' || 
                      p.historical_context || 
                      p.tags?.includes('heritage') || 
                      p.tags?.includes('history');
    if (!isHeritage) return false;

    if (selectedSubTheme === 'forts') {
      return p.subcategory?.toLowerCase().includes('fort') || p.name.includes('Fort') || p.name.includes('Wada');
    }
    if (selectedSubTheme === 'caves') {
      return p.subcategory?.toLowerCase().includes('cave') || p.subcategory?.toLowerCase().includes('temple');
    }
    if (selectedSubTheme === 'museums') {
      return p.subcategory?.toLowerCase().includes('museum') || p.name.includes('Museum') || p.name.includes('Memorial');
    }
    return true;
  });

  // Handle tour generation
  const handleGenerateTour = async () => {
    setIsGeneratingTour(true);
    setTourError(null);
    try {
      const res = await generateHeritageTour({
        availableHours,
        travelMode,
        city: currentCity
      });
      if (res.tour) {
        setGeneratedTour(res.tour);
      }
    } catch (err) {
      setTourError(err.message || 'Failed to generate heritage tour');
    } finally {
      setIsGeneratingTour(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-space-900 via-amber-950/20 to-space-950 border border-amber-500/20 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Living Heritage & Traditions of {currentCity}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-black text-white">
          History, Heritage & Cultural Trails
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          From 8th-century rock-cut Rashtrakuta caves to the Maratha Empire's Peshwa capital, British colonial cantonments, and Mahatma Phule's social revolution. Verified historical facts cited from Archaeological Survey of India (ASI) and municipal archives.
        </p>
      </div>

      {/* "Create a Heritage Tour" Generator Widget */}
      <section className="p-6 sm:p-8 rounded-3xl bg-space-850/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Create a Custom Heritage Tour</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate an optimized, sequential heritage itinerary tailored to your schedule and travel preference.
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Available Time Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Available Time</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 8].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setAvailableHours(h)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    availableHours === h
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                      : 'bg-space-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {h === 8 ? 'Full Day' : `${h}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>Travel Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'walking', label: 'Walking Trail', icon: Footprints },
                { id: 'transit', label: 'Auto / Cab', icon: Car },
                { id: 'family', label: 'Family Friendly', icon: Users },
                { id: 'photography', label: 'Photography', icon: Camera }
              ].map(m => {
                const Icon = m.icon;
                const isSelected = travelMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTravelMode(m.id)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
                        : 'bg-space-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateTour}
              disabled={isGeneratingTour}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 text-slate-950 font-black text-xs hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-glow-amber disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingTour ? 'Calculating Itinerary...' : 'Generate Heritage Tour'}</span>
            </button>
          </div>

        </div>

        {tourError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{tourError}</span>
          </div>
        )}

        {/* Generated Tour Result Display */}
        {generatedTour && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Custom Generated Itinerary</span>
                <h3 className="text-base font-black text-white">{generatedTour.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {generatedTour.totalStops} Heritage Stops • {generatedTour.totalDistanceKm} km Total Distance • {generatedTour.estimatedDurationText}
                </p>
              </div>

              {onViewRouteOnMap && (
                <button
                  onClick={() => onViewRouteOnMap(generatedTour)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View Tour on Map</span>
                </button>
              )}
            </div>

            {/* Step-by-Step Schedule */}
            <div className="space-y-3">
              {generatedTour.schedule?.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectPlace({ id: item.placeId, name: item.name, description: item.description, image_url: item.image_url, estimated_cost: item.estimated_cost, neighborhood: item.neighborhood, historical_context: item.historical_context })}
                  className="p-4 rounded-2xl bg-space-950/80 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-xs flex items-center justify-center shrink-0">
                      #{item.stopIndex}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {item.timeWindow}
                        </span>
                        <span className="text-xs text-slate-400">• {item.neighborhood}</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-amber-300 transition-colors mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        <strong className="text-teal-300">Why it matters:</strong> {item.whyItMatters}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3 self-end sm:self-auto">
                    <div>
                      <span className="text-xs font-bold text-teal-300">{item.estimated_cost}</span>
                      <p className="text-[10px] text-slate-400">{item.opening_hours?.split('(')[0] || 'Open'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * {generatedTour.disclaimer}
            </p>
          </div>
        )}

      </section>

      {/* Sub-Theme Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Heritage Landmarks' },
          { id: 'forts', label: 'Forts, Palaces & Wadas' },
          { id: 'caves', label: 'Ancient Rock-Cut Caves & Temples' },
          { id: 'museums', label: 'Museums & Independence Memorials' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubTheme(sub.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSubTheme === sub.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                : 'bg-space-850 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Heritage Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heritagePlaces.map(place => (
          <div
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="group rounded-2xl bg-space-850/85 border border-slate-800 hover:border-amber-500/50 shadow-card-dark hover:shadow-glow-amber overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={place.image_url}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-850 via-space-850/20 to-transparent" />
                
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-space-950/85 text-amber-300 border border-amber-500/20 backdrop-blur-md">
                  {place.subcategory || 'Heritage'}
                </span>

                <span className="absolute bottom-2.5 right-3 text-xs font-black text-amber-400 bg-space-950/90 border border-white/10 px-2 py-0.5 rounded-lg">
                  ★ {place.rating}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-display font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{place.neighborhood}</span>
                  </p>
                </div>

                {/* Why this place matters callout */}
                {place.historical_context && (
                  <div className="p-2.5 rounded-xl bg-space-950/80 border border-amber-500/20 text-xs">
                    <span className="font-bold text-amber-400 text-[10px] uppercase tracking-wider block mb-0.5">
                      Why This Place Matters:
                    </span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {place.historical_context}
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-2 border-t border-slate-800/80 mt-2">
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-teal-300 font-bold">{place.estimated_cost}</span>
                <span className="text-slate-400 text-[11px]">{place.opening_hours?.split('(')[0] || 'Open Today'}</span>
              </div>

              {place.source && (
                <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Source: {place.source}</span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
