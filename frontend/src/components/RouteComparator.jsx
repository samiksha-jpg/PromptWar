import React, { useState } from 'react';
import { Navigation, Clock, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { compareRoutes } from '../utils/api';

export default function RouteComparator({
  places = [],
  userLocation,
  currentCity,
  onSelectRouteOnMap
}) {
  // Preset landmarks in Pune for quick selection
  const defaultPresets = [
    { name: 'Shaniwar Wada (Old Pune)', lat: 18.5196, lng: 73.8553 },
    { name: 'Aga Khan Palace (Kalyani Nagar)', lat: 18.5524, lng: 73.9015 },
    { name: 'FC Road & Goodluck Chowk (Deccan)', lat: 18.5192, lng: 73.8407 },
    { name: 'Koregaon Park (North Main Rd)', lat: 18.5362, lng: 73.8938 },
    { name: 'Vetal Tekdi Trail (Kothrud)', lat: 18.5209, lng: 73.8183 },
    { name: 'Pataleshwar Caves (Shivaji Nagar)', lat: 18.5284, lng: 73.8505 }
  ];

  const [originIndex, setOriginIndex] = useState(0); // Shaniwar Wada default
  const [destIndex, setDestIndex] = useState(1); // Aga Khan Palace default
  const [useCurrentOrigin, setUseCurrentOrigin] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [routeResults, setRouteResults] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);

    let startLat = defaultPresets[originIndex].lat;
    let startLng = defaultPresets[originIndex].lng;

    if (useCurrentOrigin && userLocation) {
      startLat = userLocation.lat;
      startLng = userLocation.lng;
    }

    const endLat = defaultPresets[destIndex].lat;
    const endLng = defaultPresets[destIndex].lng;

    try {
      const res = await compareRoutes(startLat, startLng, endLat, endLng, currentCity);
      setRouteResults(res);
      if (res.routes && res.routes.length > 0) {
        setSelectedRouteId(res.routes[0].id);
        if (onSelectRouteOnMap) {
          onSelectRouteOnMap(res.routes[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Could not calculate routes. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoute = (route) => {
    setSelectedRouteId(route.id);
    if (onSelectRouteOnMap) {
      onSelectRouteOnMap(route);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-glow-teal">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">Smart Route Comparator</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Evaluate duration, distance, and known hazard trade-offs along city corridors</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-space-850 px-3.5 py-2 rounded-xl border border-slate-700 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Engine: OSRM + Citizen Trust Corridor Scoring</span>
        </div>
      </div>

      {/* Origin / Destination Selector Bar */}
      <div className="p-5 rounded-2xl bg-space-850/90 border border-slate-700/80 shadow-card-dark space-y-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Origin Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Starting Point (Origin)
              </label>
              {userLocation && (
                <button
                  onClick={() => setUseCurrentOrigin(!useCurrentOrigin)}
                  className={`text-[11px] font-medium transition-colors ${useCurrentOrigin ? 'text-brand-300' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {useCurrentOrigin ? '✓ Using My GPS' : 'Use My GPS'}
                </button>
              )}
            </div>

            {useCurrentOrigin && userLocation ? (
              <div className="p-2.5 rounded-xl bg-navy-950 border border-brand-500/40 text-xs text-brand-300 font-semibold flex items-center justify-between">
                <span>📍 Current GPS Location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})</span>
                <button onClick={() => setUseCurrentOrigin(false)} className="text-[10px] text-slate-400 hover:text-white">Change</button>
              </div>
            ) : (
              <select
                value={originIndex}
                onChange={(e) => setOriginIndex(Number(e.target.value))}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl p-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
              >
                {defaultPresets.map((p, idx) => (
                  <option key={idx} value={idx} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Destination Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block mr-1.5"></span> Destination
            </label>
            <select
              value={destIndex}
              onChange={(e) => setDestIndex(Number(e.target.value))}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl p-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
            >
              {defaultPresets.map((p, idx) => (
                <option key={idx} value={idx} disabled={idx === originIndex && !useCurrentOrigin} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Compare Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Calculates 3 alternative paths and scores them against active municipal pothole, waterlogging & streetlight alerts.
          </p>

          <button
            onClick={handleCompare}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 active:scale-95 transition-all ml-auto"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            <span>{isLoading ? 'Calculating Trade-offs...' : 'Compare Routes'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Route Cards Comparison Grid */}
      {routeResults && routeResults.routes && (
        <div className="space-y-4">
          
          {/* Honest Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Transparent Safety Policy: </span>
              {routeResults.disclaimer}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routeResults.routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const hasFewestHazards = route.badges?.includes('Fewest Reported Hazards');
              const isFastest = route.badges?.includes('Fastest');

              return (
                <div
                  key={route.id}
                  onClick={() => handleSelectRoute(route)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-navy-900 border-brand-400 shadow-xl shadow-brand-500/10 ring-1 ring-brand-400/50'
                      : 'bg-navy-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Badge Row */}
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {isFastest && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          ⚡ Fastest Route
                        </span>
                      )}
                      {hasFewestHazards && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🛡️ Fewest Hazards
                        </span>
                      )}
                      {!isFastest && !hasFewestHazards && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          Alternative Path
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1">{route.name}</h3>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs mt-3 py-2 border-y border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                        <div className="text-base font-extrabold text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-400" />
                          <span>{route.durationMin} mins</span>
                        </div>
                      </div>

                      <div className="border-l border-slate-800 pl-4">
                        <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                        <div className="text-base font-extrabold text-white">
                          {route.distanceKm} km
                        </div>
                      </div>

                      <div className="border-l border-slate-800 pl-4">
                        <div className="text-[10px] text-slate-400 uppercase">Reported Hazards</div>
                        <div className={`text-base font-extrabold flex items-center gap-1 ${route.hazardsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {route.hazardsCount > 0 ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{route.hazardsCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trade-off Explanation */}
                    <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-navy-950/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-200">Trade-off: </span>
                      {route.tradeOffSummary}
                    </div>

                    {/* Hazards List if any along corridor */}
                    {route.hazards && route.hazards.length > 0 && (
                      <div className="mt-2.5 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-amber-400">Notices on corridor:</div>
                        {route.hazards.map((h, i) => (
                          <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span className="text-slate-300 font-medium">{h.title}</span>
                            <span className="text-slate-500">({h.distanceFromRouteMeters}m off path)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Select CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Composite Score: <strong className="text-brand-300">{route.compositeScore}/100</strong></span>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Showing on Map' : 'View on Map'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
