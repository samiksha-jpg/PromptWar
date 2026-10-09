import React from 'react';
import { Compass, Navigation, ShieldAlert, Sparkles, MapPin, Heart, AlertTriangle, Layers, CloudSun } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentCity,
  setCurrentCity,
  userLocation,
  onDetectLocation,
  isLocating,
  onOpenReportModal,
  onOpenSavedModal,
  savedCount,
  pulseSummary
}) {
  const navItems = [
    { id: 'explore', label: 'Explore & Map', icon: Compass },
    { id: 'routes', label: 'Smart Routes', icon: Navigation },
    { id: 'pulse', label: 'City Pulse', icon: CloudSun },
    { id: 'community', label: 'Civic Reports', icon: ShieldAlert },
    { id: 'hidden', label: 'Hidden Gems', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2.5">
          
          {/* Logo & Tagline with Display Typography */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActiveTab('explore')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-cyan-400 text-space-950 shadow-glow-teal group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-300"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-black tracking-tight text-white group-hover:text-teal-200 transition-colors">
                  CitySense<span className="text-teal-400">AI</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-full">
                  Smart City Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block -mt-0.5">
                Explore Smart • Travel Safe • Experience More
              </p>
            </div>
          </div>

          {/* Navigation Links with Glass Pill Styling */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-space-850/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 via-teal-500 to-teal-400 text-space-950 shadow-glow-teal scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* City Selector, Geolocation & Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City Selector Dropdown */}
            <div className="relative flex items-center">
              <select
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="bg-space-850/90 text-slate-200 text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 border border-slate-700 hover:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/40 appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="Pune">Pune, India</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi NCR</option>
              </select>
              <MapPin className="w-3.5 h-3.5 text-teal-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Geolocation Button */}
            <button
              onClick={onDetectLocation}
              disabled={isLocating}
              title={userLocation ? `Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Detect your current location'}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                userLocation
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-glow-teal'
                  : 'bg-space-850 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-teal-400' : userLocation ? 'text-teal-400 fill-teal-400' : ''}`} />
              <span className="hidden sm:inline text-xs">
                {isLocating ? 'Locating...' : userLocation ? 'Located' : 'Near Me'}
              </span>
            </button>

            {/* Saved Places Bookmark Button */}
            <button
              onClick={onOpenSavedModal}
              title="Saved Places & Itineraries"
              className="relative p-2.5 rounded-xl bg-space-850 border border-slate-700 text-slate-300 hover:text-pink-400 hover:bg-slate-800 transition-all"
            >
              <Heart className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Report an Issue CTA */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/35 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Report Issue</span>
            </button>
          </div>

        </div>

        {/* Mobile Subnavigation */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-teal-400 text-space-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 bg-space-850/80 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
