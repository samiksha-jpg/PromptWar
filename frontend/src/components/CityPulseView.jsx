import React, { useState } from 'react';
import { CloudSun, Wind, Droplets, Gauge, ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, Clock, ExternalLink, MapPin } from 'lucide-react';

export default function CityPulseView({
  pulseData,
  onRefresh,
  isRefreshing,
  currentCity,
  onSelectReport
}) {
  if (!pulseData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-400" />
        <p>Loading {currentCity} live conditions & civic telemetry...</p>
      </div>
    );
  }

  const { weather, airQuality, hazardsSummary, mobilityHealthIndex, lastUpdated } = pulseData;

  const hazardCategories = [
    { key: 'pothole', label: 'Potholes', count: hazardsSummary.breakdown?.pothole || 0, icon: '🕳️' },
    { key: 'waterlogging', label: 'Waterlogging', count: hazardsSummary.breakdown?.waterlogging || 0, icon: '🌊' },
    { key: 'broken_streetlight', label: 'Dark Streetlights', count: hazardsSummary.breakdown?.broken_streetlight || 0, icon: '💡' },
    { key: 'road_obstruction', label: 'Road Blocks', count: hazardsSummary.breakdown?.road_obstruction || 0, icon: '🚧' },
    { key: 'accessibility', label: 'Footpath Hazards', count: hazardsSummary.breakdown?.accessibility || 0, icon: '♿' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">City Pulse — {currentCity} Conditions</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Live environmental sensors, municipal alerts, and citizen-corroborated hazards</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Last updated: <span className="text-slate-300 font-medium">{new Date(lastUpdated).toLocaleTimeString()}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-700 hover:border-brand-500/40 text-slate-200 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Pulse'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Weather, Air Quality, Mobility Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Weather Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Atmospheric Conditions</div>
              <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
                <span>{weather.temperature}°C</span>
                <span className="text-xs font-normal text-slate-400">Feels like {weather.feelsLike}°C</span>
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-1">{weather.condition}</p>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <CloudSun className="w-8 h-8" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Humidity</div>
              <div className="font-bold text-slate-200 mt-0.5">{weather.humidity}%</div>
            </div>
            <div className="border-x border-slate-800">
              <div className="text-[10px] text-slate-400">Wind Speed</div>
              <div className="font-bold text-slate-200 mt-0.5">{weather.windSpeedKm} km/h</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Precip Risk</div>
              <div className="font-bold text-teal-300 mt-0.5">{weather.precipProbability}%</div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Source: {weather.source}</span>
            <span className="text-brand-400 font-medium">{weather.conditionBadge}</span>
          </div>
        </div>

        {/* Air Quality (AQI) Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-slate-800 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Air Quality Telemetry</div>
              <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
                <span>AQI {airQuality.aqi}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${airQuality.aqi <= 50 ? 'bg-emerald-500/20 text-emerald-300' : airQuality.aqi <= 100 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {airQuality.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">PM2.5: {airQuality.pm25} µg/m³ • Fine particulates</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <Wind className="w-8 h-8" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            {airQuality.aqi <= 100
              ? 'Air quality is acceptable for outdoor walks and open-air exploration.'
              : 'Sensitive groups should limit prolonged outdoor exertion.'}
          </div>

          <div className="mt-3 text-[10px] text-slate-500">
            Source: {airQuality.source}
          </div>
        </div>

        {/* Mobility Health Index Gauge */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-400">City Mobility Health</div>
              <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline gap-2">
                <span>{mobilityHealthIndex.score}/100</span>
                <span className="text-xs font-semibold text-teal-300">{mobilityHealthIndex.status}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-300">
              <Gauge className="w-8 h-8" />
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${mobilityHealthIndex.score}%` }}
            />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {mobilityHealthIndex.summary}
          </p>

          <div className="mt-2 text-[10px] text-slate-500">
            Composite score weighting weather, air quality & active road obstructions
          </div>
        </div>

      </div>

      {/* Civic Hazards Breakdown Bar */}
      <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Active Civic Incident Categories</span>
            </h3>
            <p className="text-xs text-slate-400">Verified and pending road warnings reported by citizens</p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {hazardsSummary.activeCount} Active Issues
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {hazardCategories.map(cat => (
            <div
              key={cat.key}
              className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] text-slate-400 font-medium">{cat.label}</div>
                <div className="text-lg font-extrabold text-white mt-0.5">{cat.count}</div>
              </div>
              <span className="text-xl">{cat.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts Feed */}
      {hazardsSummary.recentAlerts && hazardsSummary.recentAlerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Recent Citizen Telemetry Reports</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hazardsSummary.recentAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => onSelectReport(alert)}
                className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'high' || alert.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-brand-300 font-medium">{alert.neighborhood}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{alert.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>Status: <strong className="text-slate-300">{alert.status}</strong></span>
                    <span>•</span>
                    <span>Corroborated: {alert.corroborations_count}x</span>
                  </div>
                </div>

                <span className="text-xs text-brand-400 font-semibold flex-shrink-0">Inspect →</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
