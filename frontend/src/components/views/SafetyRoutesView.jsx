import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Navigation, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Info, 
  PlusCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { compareRoutes } from '../../utils/api';

export default function SafetyRoutesView({
  places = [],
  reports = [],
  userLocation,
  onOpenReportModal,
  onViewRouteOnMap,
  currentCity = 'Pune'
}) {
  const defaultPresets = [
    { name: 'Shaniwar Wada (Old Pune)', lat: 18.5196, lng: 73.8553 },
    { name: 'Aga Khan Palace (Kalyani Nagar)', lat: 18.5524, lng: 73.9015 },
    { name: 'FC Road & Goodluck Chowk (Deccan)', lat: 18.5192, lng: 73.8407 },
    { name: 'Koregaon Park (North Main Rd)', lat: 18.5362, lng: 73.8938 },
    { name: 'Vetal Tekdi Trail (Kothrud)', lat: 18.5209, lng: 73.8183 },
    { name: 'Pune Junction Railway Station', lat: 18.5284, lng: 73.8744 }
  ];

  const [originIndex, setOriginIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(1);
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
        if (onViewRouteOnMap) {
          onViewRouteOnMap(res.routes[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Could not calculate routes. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoute = routeResults?.routes?.find(r => r.id === selectedRouteId) || routeResults?.routes?.[0];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-space-900 via-emerald-950/20 to-space-950 border border-emerald-500/20 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Evidence-Based Safety Intelligence</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-black text-white">
          Safety Intelligence & Route Hazard Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Make informed travel decisions using real-time hazard detection along route corridors. We analyze road closures, waterlogging, and verified civic reports without labeling entire neighborhoods dangerous without proof.
        </p>
      </div>

      {/* 5-Tier Data Status System Banner */}
      <section className="p-5 rounded-2xl bg-space-850/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" />
            <span>5-Tier Information Reliability Status System</span>
          </h3>
          <span className="text-[11px] text-slate-400">Strict Data Integrity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-space-950 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>1. Verified</span>
            </div>
            <p className="text-[11px] text-slate-300">PMC, Traffic Police, and municipal road closure notices.</p>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>2. Community</span>
            </div>
            <p className="text-[11px] text-slate-300">Citizen submissions corroborated by multiple local users.</p>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-sky-500/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span>3. Historical</span>
            </div>
            <p className="text-[11px] text-slate-300">Known monsoon waterlogging and perennial road repair stretches.</p>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>4. Unverified</span>
            </div>
            <p className="text-[11px] text-slate-400">Single uncorroborated community reports awaiting review.</p>
          </div>

          <div className="p-3 rounded-xl bg-space-950 border border-purple-500/30 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span>5. No Data</span>
            </div>
            <p className="text-[11px] text-slate-400">Honest disclosure of data gaps. Missing reports != safe.</p>
          </div>
        </div>
      </section>

      {/* Route Comparator Interactive Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-space-850/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-teal-400" />
              <span>Compare Route Corridor Alternatives</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by OSRM routing engine + 180m hazard buffer collision detection.
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 hover:bg-amber-500/25 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Road Hazard</span>
          </button>
        </div>

        {/* Origin / Destination Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Origin (Starting Point)</span>
              </span>
              {userLocation && (
                <button
                  type="button"
                  onClick={() => setUseCurrentOrigin(!useCurrentOrigin)}
                  className="text-[11px] font-bold text-teal-400 hover:underline"
                >
                  {useCurrentOrigin ? 'Choose Landmark' : 'Use Current GPS'}
                </button>
              )}
            </label>

            {useCurrentOrigin ? (
              <div className="p-2.5 rounded-xl bg-space-950 border border-teal-500/40 text-xs font-semibold text-teal-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>My Current Location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})</span>
              </div>
            ) : (
              <select
                value={originIndex}
                onChange={(e) => setOriginIndex(Number(e.target.value))}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
              >
                {defaultPresets.map((p, idx) => (
                  <option key={idx} value={idx} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{p.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Destination</span>
            </label>
            <select
              value={destIndex}
              onChange={(e) => setDestIndex(Number(e.target.value))}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
            >
              {defaultPresets.map((p, idx) => (
                <option key={idx} value={idx} className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Compare CTA */}
        <div>
          <button
            onClick={handleCompare}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-glow-teal disabled:opacity-50"
          >
            <Navigation className="w-4 h-4" />
            <span>{isLoading ? 'Calculating Corridor Hazards...' : 'Compare Routes & Corridor Hazards'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Route Alternatives Comparison Results */}
        {routeResults && (
          <div className="pt-4 border-t border-slate-800/80 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routeResults.routes?.map((route) => {
                const isSelected = selectedRouteId === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      if (onViewRouteOnMap) onViewRouteOnMap(route);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500 shadow-glow-teal'
                        : 'bg-space-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-white">{route.name}</span>
                      <div className="flex items-center gap-1">
                        {route.badges?.map((b, i) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-space-850 text-teal-300 border border-teal-500/20">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-space-900/80 border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Travel Time</span>
                        <span className="font-bold text-sm text-white">{route.durationMin} min</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Distance</span>
                        <span className="font-bold text-sm text-white">{route.distanceKm} km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Corridor Hazards</span>
                        <span className={`font-bold text-sm ${route.hazardsCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {route.hazardsCount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Route Composite Score:</span>
                        <span className="font-extrabold text-teal-300">{route.compositeScore}/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                          style={{ width: `${route.compositeScore}%` }}
                        />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="text-[11px] font-bold text-teal-300 flex items-center justify-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active on Map</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Route Hazard Breakdown */}
            {selectedRoute && (
              <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Reported Issues on {selectedRoute.name} ({selectedRoute.hazardsCount})</span>
                </h4>

                {selectedRoute.hazards && selectedRoute.hazards.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRoute.hazards.map((h, i) => (
                      <div key={i} className="p-3 rounded-xl bg-space-900 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{h.title}</span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {h.severity}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{h.description || 'Reported on corridor.'}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">~{h.corroborations_count || 1} verified</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero active civic hazards detected within 180m of this route corridor.</span>
                  </div>
                )}
              </div>
            )}

            {/* Explicit Safety Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Important Safety Disclaimer</span>
              </span>
              <p className="leading-relaxed">
                CitySense AI scores routes based solely on verified and community-reported infrastructure hazards. We do not guarantee that any route is 100% safe. Always prioritize official police instructions, weather warnings, and local caution.
              </p>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
