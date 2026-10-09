import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  CloudSun, 
  Navigation, 
  Map, 
  Key, 
  Lock, 
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';
import { getIntegrationsStatus } from '../../utils/api';

export default function DataSourcesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIntegrationsStatus();
      setData(res);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to query integration status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Connected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Connected & Operational
        </span>
      );
    }
    if (status.includes('Subscription') || status.includes('Required')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Subscription / Sensor Feed Disclosed
        </span>
      );
    }
    if (status.includes('Missing')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          Missing Configuration
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 font-bold text-xs">
        <AlertCircle className="w-3 h-3 text-orange-400" />
        {status}
      </span>
    );
  };

  const getServiceIcon = (category) => {
    if (category.includes('Intelligence') || category.includes('RAG')) return <Sparkles className="w-5 h-5 text-teal-400" />;
    if (category.includes('Atmospheric') || category.includes('Health')) return <CloudSun className="w-5 h-5 text-sky-400" />;
    if (category.includes('Street') || category.includes('Navigation')) return <Navigation className="w-5 h-5 text-emerald-400" />;
    if (category.includes('Cartography')) return <Map className="w-5 h-5 text-indigo-400" />;
    if (category.includes('Persistence')) return <Database className="w-5 h-5 text-cyan-400" />;
    return <Layers className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-space-900 via-space-850 to-space-950 border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Priority 7 — Honest Engineering & Data Integrity</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
              Data Sources, API Diagnostics & Transparency
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Every data provider configured in CitySense AI is independently tested in real-time. We transparently disclose data nature, freshness, latency, and limitations without faking or fabricating statistics.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-glow-teal disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Testing APIs...' : 'Run Live Diagnostics'}</span>
          </button>
        </div>

        {lastChecked && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Last diagnostic run: {lastChecked}</span>
          </div>
        )}
      </div>

      {/* Security & Key Safety Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Zero Frontend Leakage</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              API secrets are kept on the Node.js backend. No secret keys are ever exposed in client JavaScript or git repositories.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Grounded RAG Pipeline</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Google Gemini queries are strictly anchored against verified SQLite places and active citizen hazard reports to eliminate AI hallucinations.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-space-850/80 border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Honest Telemetry</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              We never fabricate vehicle congestion speeds or fake live citizen reports. Missing municipal sensors are clearly disclosed.
            </p>
          </div>
        </div>
      </div>

      {/* Real Provider Status Table / Cards */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-400" />
          <span>Configured Integration Diagnostics ({data?.services?.length || 0} Providers)</span>
        </h2>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Diagnostic check failed: {error}</span>
          </div>
        )}

        {loading && !data && (
          <div className="p-12 text-center rounded-2xl bg-space-850/60 border border-slate-800">
            <RefreshCw className="w-6 h-6 text-teal-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold">Contacting live API endpoints...</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {data?.services?.map((svc, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-space-850/90 border border-slate-800/90 hover:border-slate-700 transition-all shadow-card-dark space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-space-950 border border-slate-700/60">
                    {getServiceIcon(svc.category)}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-black text-white flex items-center gap-2">
                      <span>{svc.provider}</span>
                      {svc.latencyMs > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({svc.latencyMs}ms response)
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-teal-400 font-medium">{svc.category}</p>
                  </div>
                </div>

                <div>
                  {getStatusBadge(svc.status)}
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Configuration</span>
                  <span className="text-slate-200 font-medium font-mono text-[11px]">{svc.envVar}</span>
                  {svc.maskedKey && (
                    <span className="block text-[10px] text-teal-400 font-mono mt-0.5">Masked: {svc.maskedKey}</span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Live Output / Response</span>
                  <span className="text-slate-200 font-medium text-[11px]">{svc.details || 'Operational'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Data Nature</span>
                  <span className="text-teal-300 font-medium text-[11px]">{svc.dataNature}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Limitations & Scope</span>
                  <span className="text-slate-300 font-normal text-[11px]">{svc.dataLimitations}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
