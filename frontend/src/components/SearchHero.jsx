import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Sparkles, Utensils, Compass, Navigation, CloudSun, AlertTriangle, ArrowRight } from 'lucide-react';
import { isSpeechSupported, createSpeechRecognizer } from '../utils/speech';

export default function SearchHero({
  onSearch,
  onOpenAiAssistant,
  onQuickAction,
  pulseSummary,
  currentCity
}) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [recognizer, setRecognizer] = useState(null);

  useEffect(() => {
    if (isSpeechSupported()) {
      const rec = createSpeechRecognizer({
        onResult: (transcript) => {
          setQuery(transcript);
        },
        onError: (err) => {
          setSpeechError('Voice input error. Please type your query.');
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
      setRecognizer(rec);
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognizer) {
      alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognizer.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onOpenAiAssistant(query.trim());
  };

  const quickPills = [
    { label: 'Explore Nearby', action: 'nearby', icon: Compass, glow: 'hover:border-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]' },
    { label: 'Food Under ₹200', action: 'food', icon: Utensils, glow: 'hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]' },
    { label: 'Hidden Gems', action: 'hidden', icon: Sparkles, glow: 'hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]' },
    { label: 'Compare Routes', action: 'routes', icon: Navigation, glow: 'hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]' },
    { label: 'City Conditions', action: 'pulse', icon: CloudSun, glow: 'hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]' },
    { label: 'Report Civic Issue', action: 'report', icon: AlertTriangle, glow: 'hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]' },
  ];

  return (
    <section className="relative pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      
      {/* City & Live Status Pill with Glowing Beacon */}
      {pulseSummary && (
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-space-850/90 border border-slate-700/80 text-xs text-slate-300 mb-5 shadow-lg backdrop-blur-xl">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </span>
          <span className="font-bold text-white tracking-wide">{currentCity} Live Telemetry:</span>
          <span className="text-teal-300 font-semibold">{pulseSummary.weather?.temperature}°C {pulseSummary.weather?.condition}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-300 font-semibold">{pulseSummary.hazardsSummary?.activeCount || 0} Civic Alerts</span>
        </div>
      )}

      {/* Hero Headline with Outfit Display Typography */}
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-[1.12]">
        Where in <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">{currentCity}</span> would you like to explore?
      </h1>
      <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
        Discover hidden culture, compare routes with hazard awareness, and get grounded AI answers powered by real municipal data and Google Gemini.
      </p>

      {/* ChatGPT-style Prominent Search Box with Glowing Focus Ring */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-5 group">
        <div className="relative flex items-center bg-space-850/95 border-2 border-slate-700/90 group-focus-within:border-teal-400 rounded-2xl shadow-card-dark group-focus-within:shadow-glow-teal p-2 sm:p-2.5 transition-all duration-300 backdrop-blur-2xl">
          
          <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 group-focus-within:text-teal-400 transition-colors" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Listening... Speak your city question..." : "What would you like to explore today? (e.g. food under ₹200, 2-hr heritage tour...)"}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none px-2 py-1.5"
          />

          {/* Voice input button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isListening ? "Stop listening" : "Ask with voice"}
            className={`p-2.5 rounded-xl border transition-all mr-2 ${
              isListening
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 animate-pulse'
                : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/60 border-transparent'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Submit / Ask AI button */}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-teal-500 to-teal-400 text-space-950 font-black text-xs sm:text-sm hover:opacity-95 shadow-glow-teal active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-space-950" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>

        {speechError && (
          <p className="text-xs text-rose-400 mt-2 text-left ml-4 font-medium">{speechError}</p>
        )}
      </form>

      {/* Quick Action Pills with Micro-Hover Glow */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto pt-1">
        {quickPills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.action}
              onClick={() => onQuickAction(pill.action)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-space-850/80 border border-slate-700/80 text-slate-200 hover:text-white transition-all shadow-sm ${pill.glow} hover:-translate-y-0.5`}
            >
              <Icon className="w-3.5 h-3.5 text-teal-400" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

    </section>
  );
}
