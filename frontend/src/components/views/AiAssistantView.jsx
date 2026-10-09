import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Trash2, 
  MapPin, 
  Heart, 
  Star, 
  ShieldCheck, 
  Cpu, 
  Mic, 
  MicOff, 
  CornerDownLeft,
  ArrowRight,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { askAiAssistant, getSystemHealth } from '../../utils/api';
import { isSpeechSupported, createSpeechRecognizer } from '../../utils/speech';

export const STARTER_QUESTIONS = [
  "Find affordable restaurants near me under ₹200",
  "Plan a three-hour historical tour of old Pune",
  "Compare Koregaon Park and FC Road",
  "Which route has fewer reported hazards from Swargate to Shivaji Nagar?",
  "What traffic and weather alerts are active today?",
  "Find attractions within my budget under ₹100"
];

export default function AiAssistantView({
  userLocation,
  currentCity = 'Pune',
  onSelectPlace,
  onToggleSave,
  savedPlaceIds = new Set()
}) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I'm your **CitySense AI Smart Assistant** for ${currentCity}.

I'm powered by **Google Gemini AI** and strictly grounded in our verified local database of 30+ authentic places, live Open-Meteo weather telemetry, and corroborated civic reports.

How can I help you explore today? Pick a suggested question below or type your own request.`,
      places: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [engineInfo, setEngineInfo] = useState('Google Gemini AI (RAG Grounded)');
  const [maskedKey, setMaskedKey] = useState('AIza...••••');
  const [isKeyConfigured, setIsKeyConfigured] = useState(true);

  // Voice speech recognition
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);

  const messagesEndRef = useRef(null);

  // On mount check backend AI health
  useEffect(() => {
    async function checkHealth() {
      try {
        const h = await getSystemHealth();
        if (h.aiIntegration) {
          setIsKeyConfigured(h.aiIntegration.keyConfigured);
          setEngineInfo(h.aiIntegration.engine || 'Google Gemini AI (RAG Grounded)');
          if (h.aiIntegration.maskedKeyPreview) {
            setMaskedKey(h.aiIntegration.maskedKeyPreview);
          }
        }
      } catch (e) {
        console.warn('[AI View Health Check Warning]:', e.message);
      }
    }
    checkHealth();
  }, []);

  // Voice recognition init
  useEffect(() => {
    if (isSpeechSupported()) {
      const rec = createSpeechRecognizer({
        onResult: (text) => setInputText(text),
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
      setRecognizer(rec);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const uLat = userLocation?.lat || null;
      const uLng = userLocation?.lng || null;
      const res = await askAiAssistant(text, uLat, uLng, currentCity);

      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.text || 'I analyzed your query based on our verified local database.',
        places: res.recommendedPlaces || [],
        suggestedQuestions: res.suggestedQuestions || [],
        engineUsed: res.aiEngine || engineInfo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I encountered an issue contacting the AI service: ${err.message || 'Check connection'}. 
        
However, you can still search all verified city spots, review heritage tours, check weather telemetry, and view live road hazards throughout the app!`,
        places: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: `New chat started! Ask me anything about ${currentCity} food, heritage, safe corridors, weather, or transparent comparisons.`,
        places: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleToggleVoice = () => {
    if (!recognizer) {
      alert('Speech recognition is not available in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognizer.stop();
      setIsListening(false);
    } else {
      recognizer.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-space-900 via-purple-950/20 to-space-950 border border-purple-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Grounded Conversational Intelligence</span>
          </div>

          {/* Engine Status Pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-space-850 border border-slate-700 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px]">{engineInfo}</span>
            </span>

            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white border border-slate-700"
              title="Start New Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
          CitySense Conversational Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Ask questions naturally. The assistant parses budgets, categories, time constraints, and retrieves real places from our SQLite database without hallucinating facts.
        </p>
      </div>

      {/* Suggested Starter Chips */}
      <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {STARTER_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs font-semibold text-slate-300 hover:text-purple-300 bg-space-950 hover:bg-space-900 border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-xl transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-space-850/90 border border-slate-800 shadow-2xl min-h-[440px] flex flex-col justify-between space-y-6">
        
        {/* Messages Stream */}
        <div className="space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {msg.role === 'user' ? 'You' : 'CitySense AI'}
                </span>
                <span className="text-[10px] text-slate-400">• {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div 
                className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold rounded-tr-sm shadow-glow-teal'
                    : 'bg-space-950/90 text-slate-200 border border-slate-800 rounded-tl-sm whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>

              {/* Grounded Recommended Place Cards */}
              {msg.places && msg.places.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl pt-2">
                  {msg.places.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => onSelectPlace(place)}
                      className="p-3 rounded-xl bg-space-900 border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all space-y-2 group"
                    >
                      {place.image_url && (
                        <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-950 relative">
                          <img 
                            src={place.image_url} 
                            alt={place.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-space-950/90 text-amber-400">
                            ★ {place.rating}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-display font-bold text-xs text-white group-hover:text-teal-300 transition-colors truncate">
                          {place.name}
                        </h4>
                        <p className="text-[11px] text-teal-400 font-semibold">{place.neighborhood}</p>
                        <p className="text-[11px] text-slate-400">{place.estimated_cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 max-w-2xl">
                  {msg.suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sq)}
                      className="text-[11px] font-medium text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 rounded-full transition-all"
                    >
                      ↳ {sq}
                    </button>
                  ))}
                </div>
              )}

            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 p-3 rounded-2xl bg-space-950 border border-purple-500/20 max-w-md animate-pulse">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span>Analyzing city database and generating verified response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative pt-4 border-t border-slate-800"
        >
          <div className="relative flex items-center bg-space-950 rounded-2xl border border-slate-700/80 focus-within:border-teal-400 transition-all overflow-hidden p-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g., 'What are the top historical spots?', 'Cheap cafes near Deccan')..."
              className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
