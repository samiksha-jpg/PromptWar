import React, { useState } from 'react';
import { 
  Home, 
  Compass, 
  Landmark, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Sparkles, 
  Database,
  MapPin, 
  Heart, 
  PlusCircle, 
  Menu, 
  X,
  CheckCircle2,
  Cpu,
  HelpCircle,
  Play
} from 'lucide-react';

export const SECTIONS = [
  { id: 'home', label: 'Home', icon: Home, badge: null },
  { id: 'explore', label: 'Explore Places', icon: Compass, badge: '8 Cats' },
  { id: 'safety', label: 'Smart Routes', icon: ShieldCheck, badge: 'Corridors' },
  { id: 'traffic', label: 'City Pulse', icon: AlertTriangle, badge: 'Telemetry' },
  { id: 'history', label: 'History & Culture', icon: Landmark, badge: 'Tours' },
  { id: 'compare', label: 'Compare Places', icon: Scale, badge: 'Best vs Worst' },
  { id: 'ai', label: 'AI City Assistant', icon: Sparkles, badge: 'Gemini' },
  { id: 'sources', label: 'Data & Sources', icon: Database, badge: 'Trust' }
];

export default function Sidebar({
  activeSection,
  setActiveSection,
  currentCity,
  setCurrentCity,
  userLocation,
  onDetectLocation,
  isLocating,
  onOpenReportModal,
  onOpenSavedModal,
  savedCount = 0,
  systemHealth,
  onStartTour
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#070b14]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => handleSelectSection('home')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-glow-teal">
            <Compass className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-display font-black text-lg text-white tracking-tight">
              CitySense<span className="text-teal-400">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick city selector with dark colorScheme and explicit option contrast */}
          <select
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="bg-[#0b1120] text-slate-100 text-xs font-bold rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-teal-400"
          >
            <option value="Pune" className="bg-[#0b1120] text-slate-100 py-1 font-semibold">Pune</option>
            <option value="Mumbai" className="bg-[#0b1120] text-slate-100 py-1 font-semibold">Mumbai</option>
            <option value="Bengaluru" className="bg-[#0b1120] text-slate-100 py-1 font-semibold">Bengaluru</option>
            <option value="Delhi" className="bg-[#0b1120] text-slate-100 py-1 font-semibold">Delhi</option>
          </select>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="p-2 rounded-xl bg-[#0b1120] text-slate-300 border border-slate-700/80"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-[#090e1a] border-r border-slate-800 p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-glow-teal">
                    <Compass className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-base text-white">CitySense AI</h2>
                    <p className="text-[10px] text-teal-400 font-semibold">Smart City Platform</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation List */}
              <nav className="mt-5 space-y-1">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSection(sec.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-glow-teal'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
                        <span>{sec.label}</span>
                      </div>
                      {sec.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                          isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {sec.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer CTAs */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              {onStartTour && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onStartTour();
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
                  <span>Take a Quick Tour</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReportModal();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Road Hazard</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSavedModal();
                }}
                className="w-full py-2 rounded-xl bg-[#0b1120] text-slate-300 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                <span>Saved Places ({savedCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 min-h-screen sticky top-0 h-screen bg-[#070b14] border-r border-slate-800/80 z-30 p-4 shrink-0 overflow-y-auto">
        <div className="space-y-5">
          
          {/* Logo & Platform Info */}
          <div 
            onClick={() => handleSelectSection('home')}
            className="flex items-center gap-3 cursor-pointer group px-2 py-1"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 shadow-glow-teal group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>
            <div>
              <span className="font-display text-xl font-black tracking-tight text-white group-hover:text-teal-300 transition-colors">
                CitySense<span className="text-teal-400">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Smart City Intelligence</p>
            </div>
          </div>

          {/* City Selector Pill with dark colorScheme and explicit option styling */}
          <div className="px-2">
            <div className="relative flex items-center">
              <select
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] text-slate-100 text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 border border-slate-700/80 hover:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-400 appearance-none cursor-pointer shadow-sm transition-all"
              >
                <option value="Pune" className="bg-[#0b1120] text-slate-100 py-1.5 font-semibold">📍 Pune, India</option>
                <option value="Mumbai" className="bg-[#0b1120] text-slate-100 py-1.5 font-semibold">📍 Mumbai, India</option>
                <option value="Bengaluru" className="bg-[#0b1120] text-slate-100 py-1.5 font-semibold">📍 Bengaluru, India</option>
                <option value="Delhi" className="bg-[#0b1120] text-slate-100 py-1.5 font-semibold">📍 Delhi NCR, India</option>
              </select>
              <MapPin className="w-3.5 h-3.5 text-teal-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Quick Tour Button */}
          {onStartTour && (
            <div className="px-2">
              <button
                onClick={onStartTour}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/10 border border-teal-500/40 hover:border-teal-400 text-teal-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all group"
              >
                <Play className="w-3.5 h-3.5 fill-teal-400 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>Take a Quick Tour</span>
              </button>
            </div>
          )}

          {/* Navigation Links (Exactly 8 Sections) */}
          <nav className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Platform Modules
            </div>
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-slate-950 font-black shadow-glow-teal scale-[1.01]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-teal-400'}`} />
                    <span>{sec.label}</span>
                  </div>
                  {sec.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold ${
                      isActive 
                        ? 'bg-slate-950/25 text-slate-950' 
                        : 'bg-[#0b1120] text-slate-400 border border-slate-700/60'
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Utility CTAs */}
          <div className="pt-1 px-2 space-y-1.5">
            <button
              onClick={onOpenReportModal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Road Hazard</span>
            </button>

            <button
              onClick={onOpenSavedModal}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0b1120] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <span className="flex items-center gap-2">
                <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-pink-400 fill-pink-400' : 'text-slate-400'}`} />
                <span>Saved Places</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-teal-300">
                {savedCount}
              </span>
            </button>

            {/* Geolocation Button */}
            <button
              onClick={onDetectLocation}
              disabled={isLocating}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                userLocation
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                  : 'bg-[#0b1120] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-bounce text-amber-400' : 'text-teal-400'}`} />
              <span>{isLocating ? 'Locating...' : userLocation ? 'Location Active' : 'Use My GPS'}</span>
            </button>
          </div>

        </div>

        {/* Backend & AI Operational Status */}
        <div className="pt-3 border-t border-slate-800/80 px-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Gateway</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Gemini Operational
            </span>
          </div>

          {systemHealth && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{systemHealth.database?.placesCount} Places • {systemHealth.database?.reportsCount} Reports</span>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
