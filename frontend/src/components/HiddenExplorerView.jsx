import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Clock, DollarSign, Compass, Plus, Check, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { getItineraries, createItinerary } from '../utils/api';

export default function HiddenExplorerView({
  places = [],
  currentCity,
  onSelectPlace,
  onViewItineraryOnMap
}) {
  const [itineraries, setItineraries] = useState([]);
  const [selectedPlacesForCustom, setSelectedPlacesForCustom] = useState([]);
  const [customTitle, setCustomTitle] = useState('');
  const [isBuildingCustom, setIsBuildingCustom] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Filter hidden gems
  const hiddenGems = places.filter(p => p.is_hidden_gem === 1);

  const fetchItinerariesList = async () => {
    try {
      const res = await getItineraries(currentCity);
      if (res.itineraries) {
        setItineraries(res.itineraries);
      }
    } catch (err) {
      console.warn('Itineraries error:', err);
    }
  };

  useEffect(() => {
    fetchItinerariesList();
  }, [currentCity]);

  const toggleSelectPlace = (placeId) => {
    if (selectedPlacesForCustom.includes(placeId)) {
      setSelectedPlacesForCustom(selectedPlacesForCustom.filter(id => id !== placeId));
    } else {
      setSelectedPlacesForCustom([...selectedPlacesForCustom, placeId]);
    }
  };

  const handleSaveCustomItinerary = async () => {
    if (!customTitle.trim() || selectedPlacesForCustom.length === 0) {
      alert('Please provide an itinerary title and select at least one place.');
      return;
    }

    try {
      const res = await createItinerary({
        title: customTitle.trim(),
        description: `Custom itinerary with ${selectedPlacesForCustom.length} hand-picked Pune places.`,
        city: currentCity,
        theme: 'custom',
        estimated_duration: `${Math.round(selectedPlacesForCustom.length * 1.2)} hours`,
        estimated_cost: 'Pay per spot',
        placeIds: selectedPlacesForCustom
      });

      setSaveSuccess('Custom itinerary created successfully!');
      setCustomTitle('');
      setSelectedPlacesForCustom([]);
      setIsBuildingCustom(false);
      fetchItinerariesList();
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      alert('Could not save itinerary: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">Hidden City Explorer</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Discover lesser-known cultural spots and curated themed trails in {currentCity}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsBuildingCustom(!isBuildingCustom)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
            isBuildingCustom
              ? 'bg-slate-800 text-slate-200 border border-slate-700'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isBuildingCustom ? 'Close Itinerary Builder' : 'Build Custom Itinerary'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          {saveSuccess}
        </div>
      )}

      {/* Interactive Custom Itinerary Builder Panel */}
      {isBuildingCustom && (
        <div className="p-5 rounded-2xl bg-navy-900 border border-purple-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Create Custom Day Trail</h3>
              <p className="text-xs text-slate-400">Select places from the list below to build your personal route</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300">
              {selectedPlacesForCustom.length} Places Selected
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. My Sunday Monsoon Heritage Walk"
              className="flex-1 bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSaveCustomItinerary}
              disabled={selectedPlacesForCustom.length === 0 || !customTitle.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md"
            >
              Save Custom Itinerary
            </button>
          </div>

          {/* Place chips toggle */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Click places to include:</div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar">
              {places.map(p => {
                const isSelected = selectedPlacesForCustom.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleSelectPlace(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-navy-950 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Curated Themed Itineraries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            <span>Curated Themed Itineraries</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {itineraries.map((it) => (
            <div
              key={it.id}
              className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {it.theme}
                  </span>
                  <span className="text-xs text-teal-300 font-semibold">{it.estimated_cost}</span>
                </div>

                <h4 className="font-bold text-base text-white mb-2">{it.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">{it.description}</p>

                {/* Places sequence */}
                <div className="space-y-1.5 bg-navy-950/70 p-3 rounded-xl border border-slate-800/80 mb-3">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Stops in this trail:</div>
                  {it.places && it.places.map((place, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-brand-400 flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="truncate">{place.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  <span>{it.estimated_duration}</span>
                </div>

                <button
                  onClick={() => onViewItineraryOnMap(it)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1"
                >
                  <span>Explore Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Verified Hidden Gems Place Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Lesser-Known Hidden Gems ({hiddenGems.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hiddenGems.map((gem) => (
            <div
              key={gem.id}
              onClick={() => onSelectPlace(gem)}
              className="rounded-2xl bg-navy-900 border border-slate-800 hover:border-purple-500/40 shadow-xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full">
                  <img
                    src={gem.image_url}
                    alt={gem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white shadow-md">
                    💎 Hidden Gem
                  </span>
                  <span className="absolute bottom-2 right-3 text-xs font-bold text-amber-400 bg-navy-950/80 px-2 py-0.5 rounded-md">
                    ★ {gem.rating}
                  </span>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-base text-white">{gem.name}</h4>
                  <p className="text-xs text-brand-400 font-semibold mb-2">{gem.neighborhood} • {gem.subcategory}</p>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">{gem.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 mt-2">
                <span>{gem.estimated_cost}</span>
                <span className="text-purple-300 font-semibold">View Story →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
