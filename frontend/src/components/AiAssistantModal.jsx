import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Mic, MicOff, Trash2, MapPin, ArrowRight, CornerDownLeft, Star, Heart, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { askAiAssistant, getSystemHealth } from '../utils/api';
import { isSpeechSupported, createSpeechRecognizer } from '../utils/speech';

export default function AiAssistantModal({
  isOpen,
  onClose,
  initialQuery = '',
  userLocation,
  currentCity,
  onSelectPlace,
  onToggleSave,
  savedPlaceIds = new Set()
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your **CitySense AI Decision Assistant** for ${currentCity}. Powered by **Google Gemini AI** and grounded in verified municipal telemetry.

Ask me about:
• "Find the best food places under ₹200 near me"
• "Plan a 2-hour historical tour of old Pune"
• "Hidden spots tourists usually miss"
• "Which routes have fewer reported road hazards?"`,
      places: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [engineInfo, setEngineInfo] = useState('Google Gemini AI (RAG Grounded)');
  const [isKeyActive, setIsKeyActive] = useState(true);
  const [maskedKey, setMaskedKey] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);

  const messagesEndRef = useRef(null);

  // Check health and API key status on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const h = await getSystemHealth();
        if (h.aiIntegration) {
          setIsKeyActive(h.aiIntegration.keyConfigured);
          setEngineInfo(h.aiIntegration.engine);
          if (h.aiIntegration.maskedKeyPreview) {
            setMaskedKey(h.aiIntegration.maskedKeyPreview);
          }
        }
      } catch (e) {
        console.warn('Health fetch error:', e);
      }
    }
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

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

  // If opened with an initial query from SearchHero
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleToggleVoice = () => {
    if (!recognizer) {
      alert('Speech recognition is not available in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognizer.stop();
      setIsListening(false);
    } else {
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  const handleSend = async (queryToSend = null) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await askAiAssistant(
        text,
        userLocation?.lat,
        userLocation?.lng,
        currentCity,
        newMessages.slice(-6)
      );

      if (res.aiEngine) setEngineInfo(res.aiEngine);
      if (res.isAiKeyConfigured !== undefined) setIsKeyActive(res.isAiKeyConfigured);
      if (res.maskedKeyPreview) setMaskedKey(res.maskedKeyPreview);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.text,
          places: res.recommendedPlaces || [],
          suggestedQuestions: res.suggestedQuestions || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an issue processing your request: ${err.message}. Please verify your network and check the API key configuration.`,
          places: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation refreshed. What would you like to explore next in ${currentCity}?`,
        places: []
      }
    ]);
  };

  const promptSuggestions = [
    "Find the best food places under ₹200 near me",
    "Plan a two-hour historical tour",
    "Show interesting places that tourists usually miss",
    "Which nearby places are affordable and accessible?",
    "What can I explore today based on the weather?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl h-[90vh] bg-[#0c1322] border-2 border-[#1f2d48] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#080d1a]/95 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              <Sparkles className="w-5 h-5 fill-slate-950 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-white text-base sm:text-lg">CitySense AI Assistant</h3>
                {isKeyActive ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Gemini AI Connected</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Local Grounded Engine
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {isKeyActive ? `Authenticated via .env (${maskedKey || 'Active'}) • RAG Grounded` : 'Grounded in verified municipal database'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              title="Clear chat history"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-xs flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar bg-[#080d19]/60">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed transition-all shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold ml-auto shadow-[0_0_25px_rgba(20,184,166,0.3)]'
                    : 'bg-[#111a2e] border border-[#243352] text-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Grounded Place Cards */}
                {msg.places && msg.places.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-700/70 grid grid-cols-1 gap-2.5">
                    {msg.places.map((place) => (
                      <div
                        key={place.id}
                        className="p-3 rounded-xl bg-[#090e1a] border border-[#243352] hover:border-teal-400/50 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {place.image_url && (
                            <img
                              src={place.image_url}
                              alt={place.name}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white truncate">{place.name}</div>
                            <div className="text-xs text-teal-300 font-semibold">{place.neighborhood} • {place.estimated_cost}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              onSelectPlace(place);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs font-bold transition-all flex items-center gap-1 border border-teal-500/30"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Map
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested follow-up questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3.5 pt-2 flex flex-wrap gap-2">
                    {msg.suggestedQuestions.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sq)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#16233d] hover:bg-[#1e2f50] text-slate-200 hover:text-white border border-[#283b5e] font-medium transition-all text-left"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-300 text-sm py-2 px-3 bg-[#111a2e] rounded-xl w-fit border border-[#243352]">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
              <span className="font-medium">CitySense AI is retrieving verified places & checking route hazards with Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2.5 border-t border-slate-800 bg-[#090e1a] overflow-x-auto no-scrollbar flex items-center gap-2">
            {promptSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#111a2e] text-slate-200 hover:text-white hover:bg-[#1a2846] border border-[#243352] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#0a0f1d]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1 flex items-center bg-[#111a2e] border-2 border-[#243352] focus-within:border-teal-400 rounded-2xl px-3.5 py-2 transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Listening... Speak your prompt..." : "Ask AI about budget food, tours, road safety..."}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 font-medium focus:outline-none"
              />

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-xl transition-all ${
                  isListening ? 'text-rose-400 bg-rose-500/20 animate-pulse' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-95 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
