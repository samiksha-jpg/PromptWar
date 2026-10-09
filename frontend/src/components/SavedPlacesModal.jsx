import React from 'react';
import { X, Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';

export default function SavedPlacesModal({
  isOpen,
  onClose,
  savedPlaces = [],
  onSelectPlace,
  onRemoveSaved
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-navy-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-navy-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Heart className="w-5 h-5 fill-pink-400 text-pink-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Saved Places ({savedPlaces.length})</h3>
              <p className="text-xs text-slate-400">Your personal bookmarked city destinations</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
          {savedPlaces.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Heart className="w-12 h-12 mx-auto stroke-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No saved destinations yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore the map or chat with CitySense AI and click the heart icon on any place to bookmark it here.
              </p>
            </div>
          ) : (
            savedPlaces.map((item) => {
              const place = item.place;
              return (
                <div
                  key={item.savedId}
                  className="p-3 rounded-xl bg-navy-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                >
                  <div
                    onClick={() => {
                      onSelectPlace(place);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{place.name}</h4>
                      <p className="text-xs text-brand-300 font-medium">{place.neighborhood} • {place.estimated_cost}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{place.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onRemoveSaved(place.id)}
                      title="Remove bookmark"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
