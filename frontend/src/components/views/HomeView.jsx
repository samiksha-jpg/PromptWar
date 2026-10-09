import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Landmark, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  ArrowRight, 
  MapPin, 
  Search, 
  Heart, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  CloudSun, 
  Wind, 
  Droplets,
  HelpCircle,
  Play,
  Award,
  Zap,
  Route,
  Activity,
  MessageSquare
} from 'lucide-react';
import MapView from '../MapView';

export default function HomeView({
  places = [],
  reports = [],
  pulseData,
  onNavigate,
  onSelectPlace,
  onToggleSave,
  savedPlaceIds = new Set(),
  onAskAi,
  userLocation,
  currentCity,
  onStartTour
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAskAi(searchQuery.trim());
    }
  };

  const currentCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [18.5204, 73.8567];

  const judgeQueries = [
    {
      label: "Judge Prompt Test",
      query: "I have three hours and ₹500. Suggest interesting places with convenient routes and less crowd.",
      tag: "Budget & Time"
    },
    {
      label: "Heritage Walk",
      query: "Suggest a 2-hour historic walking tour from Shaniwar Wada to Vishrambaug Wada",
      tag: "Culture"
    },
    {
      label: "Street Food",
      query: "Find authentic vegetarian food near FC Road with affordable pricing",
      tag: "Dining"
    },
    {
      label: "Hazard Avoidance",
      query: "Which routes in Pune have reported waterlogging or potholes right now?",
      tag: "Safety"
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-space-900 via-space-850 to-space-950 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>CitySense AI — {currentCity}, India</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Explore Smart. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400">Travel Safe.</span> Experience More.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            The intelligent urban platform that turns city chaos into clarity. Discover verified heritage and stays, navigate evidence-backed safe routes, track live weather alerts, and converse with grounded Google Gemini AI.
          </p>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-glow-teal"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Take a Quick Tour</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('explore')}
              className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Explore Places</span>
            </button>

            <button
              onClick={() => onNavigate('safety')}
              className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Route className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Routes</span>
            </button>

            <button
              onClick={() => onNavigate('traffic')}
              className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>City Pulse</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Assistant</span>
            </button>
          </div>

          {/* Prominent Search / AI Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-slate-700 hover:border-teal-400/60 focus-within:border-teal-400 transition-all bg-space-950/90 backdrop-blur-md">
              <Search className="w-5 h-5 text-teal-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask CitySense AI anything (e.g., '3 hours & ₹500 budget', 'FC Road street food')..."
                className="w-full bg-transparent px-3 py-4 text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="mr-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          </form>

          {/* Clickable Judge Demo Queries */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Clickable Judge Demo Queries:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {judgeQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskAi(item.query)}
                  className="text-[11px] font-semibold text-slate-300 hover:text-teal-300 bg-space-850/90 hover:bg-space-800 border border-slate-700/80 hover:border-teal-500/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-left group"
                >
                  <span className="text-[9px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
                    {item.tag}
                  </span>
                  <span className="truncate max-w-[280px] sm:max-w-none">{item.query}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Live City Pulse Snapshot Row */}
      {pulseData && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Weather Today</p>
              <h4 className="text-base font-black text-white">{pulseData.weather?.temperature}°C • {pulseData.weather?.condition}</h4>
              <p className="text-[11px] text-teal-400 font-medium">Feels like {pulseData.weather?.feelsLike}°C</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Air Quality Index</p>
              <h4 className="text-base font-black text-white">AQI {pulseData.airQuality?.aqi} ({pulseData.airQuality?.category})</h4>
              <p className="text-[11px] text-emerald-400 font-medium">Open-Meteo Live Telemetry</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Verified Places</p>
              <h4 className="text-base font-black text-white">{places.length} Locations</h4>
              <p className="text-[11px] text-cyan-400 font-medium">8 Verified Categories</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Civic Hazards</p>
              <h4 className="text-base font-black text-white">{reports.length} Active Notices</h4>
              <p className="text-[11px] text-rose-400 font-medium">Corridor Mapped</p>
            </div>
          </div>
        </section>
      )}

      {/* "How It Works" Section (Priority 3) */}
      <section className="rounded-3xl bg-space-850/50 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">Simple & Powerful</span>
          <h2 className="font-display text-xl sm:text-2xl font-black text-white">How CitySense AI Works</h2>
          <p className="text-xs text-slate-300">Three integrated steps connecting real data to smart city exploration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-space-950/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black text-sm">
              1
            </div>
            <h3 className="font-display font-black text-sm text-white">Discover Grounded Spots</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Browse 30+ verified Pune places across 8 categories with official operating hours, authentic admission fees, and real GPS coordinates.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-space-950/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-black text-sm">
              2
            </div>
            <h3 className="font-display font-black text-sm text-white">Navigate Evidence-Backed Routes</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compute real routes via OSRM. We scan an 180m buffer corridor against citizen-reported potholes, waterlogging, and road closures.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-space-950/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-sm">
              3
            </div>
            <h3 className="font-display font-black text-sm text-white">Chat with AI & Compare Places</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask natural-language questions like budget constraints. Our Google Gemini assistant uses RAG to provide strictly grounded recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* "What Makes Us Different?" Section (Priority 3) */}
      <section className="rounded-3xl bg-gradient-to-br from-space-850 via-space-900 to-space-950 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">Engineering Integrity</span>
          <h2 className="font-display text-xl sm:text-2xl font-black text-white">What Makes Us Different?</h2>
          <p className="text-xs text-slate-300">Why judges and citizens can trust CitySense AI over generic apps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Evidence-Based Safety</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never label neighborhoods dangerous without proof. Missing hazard reports are transparently labeled "No Verified Hazards Reported" instead of false safety claims.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Grounded Gemini AI (RAG)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zero hallucinated places or fabricated hotel links. AI answers are strictly synthesized from our SQLite database and live telemetry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Transparent Reality Score</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Place comparison reveals the exact mathematical formula across 6 weighted factors. If data is missing, we display "Not enough data" rather than a guess.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-sm text-white">Honest Telemetry</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real Open-Meteo weather and OSRM geometry. We explicitly disclose municipal sensor requirements rather than faking live vehicle speeds.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Launch Cards to Main Modules */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-black text-white">Explore CitySense AI Capabilities</h2>
          <p className="text-xs text-slate-400">Direct access to dedicated intelligence modules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Explore Places */}
          <div 
            onClick={() => onNavigate('explore')}
            className="group p-5 rounded-2xl bg-space-850/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-card-dark hover:shadow-glow-teal flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-white group-hover:text-teal-300 transition-colors">
                Explore Places & Hospitality
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filter across 8 categories: tourist attractions, street food, verified stays, budget spots, parks, shopping, hidden gems, and nearby transit.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Browse 30+ Verified Places</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 2: History & Culture */}
          <div 
            onClick={() => onNavigate('history')}
            className="group p-5 rounded-2xl bg-space-850/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-card-dark hover:shadow-glow-teal flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-white group-hover:text-amber-300 transition-colors">
                History & Culture + Tour Generator
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ancient rock-cut caves, Maratha forts, freedom memorials, and our automated 'Create a Heritage Tour' custom route planner.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Generate Heritage Tour</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 3: Smart Routes */}
          <div 
            onClick={() => onNavigate('safety')}
            className="group p-5 rounded-2xl bg-space-850/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-card-dark hover:shadow-glow-teal flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-white group-hover:text-emerald-300 transition-colors">
                Evidence-Based Smart Routes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compare multi-point routes by distance, time, and active hazard corridors. 5-tier evidence status prevents false safety labels.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Compare Safe Routes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 4: City Pulse */}
          <div 
            onClick={() => onNavigate('traffic')}
            className="group p-5 rounded-2xl bg-space-850/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-card-dark hover:shadow-glow-teal flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-white group-hover:text-orange-300 transition-colors">
                City Pulse — Civic Reports & Weather
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track road closures, waterlogging, and potholes on an interactive map. Check Open-Meteo weather and air quality conditions.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>View City Updates</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 5: Compare Places */}
          <div 
            onClick={() => onNavigate('compare')}
            className="group p-5 rounded-2xl bg-space-850/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-card-dark hover:shadow-glow-teal flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-white group-hover:text-cyan-300 transition-colors">
                Compare Places (Best vs Worst)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Side-by-side transparent comparison of places and neighborhoods with explainable scores for price, ratings, accessibility, and safety.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Compare Side-by-Side</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 6: AI City Assistant */}
          <div 
            onClick={() => onNavigate('ai')}
            className="group p-5 rounded-2xl bg-space-850/90 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-card-dark hover:shadow-glow-teal flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-white group-hover:text-purple-300 transition-colors">
                Conversational AI City Assistant
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chat with our Google Gemini-powered smart assistant, strictly grounded in verified database facts to prevent hallucinations.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Start AI Conversation</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-black text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              <span>Interactive City Map ({places.length} Verified Spots)</span>
            </h2>
            <p className="text-xs text-slate-400">Click any marker to inspect photos, visiting details, and directions</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1"
          >
            <span>Full Map View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800">
          <MapView
            places={places}
            reports={reports}
            userLocation={userLocation}
            onSelectPlace={onSelectPlace}
            initialCenter={currentCenter}
          />
        </div>
      </section>

    </div>
  );
}
