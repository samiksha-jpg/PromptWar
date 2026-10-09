import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, ThumbsUp, Wrench, AlertTriangle, Filter, MapPin, Eye } from 'lucide-react';
import { corroborateReport, updateReportStatus } from '../utils/api';

export default function CommunityReportsFeed({
  reports = [],
  onRefresh,
  onOpenReportModal,
  onSelectReportOnMap,
  currentCity
}) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleCorroborate = async (reportId, action) => {
    setActionLoadingId(reportId);
    try {
      await corroborateReport(reportId, action);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Could not record vote: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      await updateReportStatus(reportId, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Could not update status: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">Citizen Trust Engine — Reports Hub</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Crowdsourced, evidence-backed civic telemetry for {currentCity}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report New Civic Issue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-navy-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Potholes</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="broken_streetlight">Broken Streetlights</option>
            <option value="road_obstruction">Road Obstructions</option>
            <option value="accessibility">Accessibility Hazards</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-navy-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified Active</option>
            <option value="under_repair">Under Repair</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing <strong className="text-slate-200">{filteredReports.length}</strong> reports
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => {
          const isPending = report.status === 'pending';
          const isVerified = report.status === 'verified';
          const isRepair = report.status === 'under_repair';
          const isResolved = report.status === 'resolved';

          return (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                {/* Status & Category Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 uppercase">
                      {report.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      report.severity === 'critical' || report.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    isRepair ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    isResolved ? 'bg-slate-700 text-slate-300' :
                    'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-1.5">{report.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">{report.description}</p>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{report.neighborhood} • {report.city}</span>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-slate-400 text-[11px]">
                  Corroborated: <strong className="text-slate-200">{report.corroborations_count || 1} citizens</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCorroborate(report.id, 'still_there')}
                    disabled={actionLoadingId === report.id || isResolved}
                    className="px-2.5 py-1 rounded-lg bg-navy-950 border border-slate-700 hover:border-brand-500/40 text-slate-200 text-xs font-medium transition-all"
                  >
                    Still There (+1)
                  </button>

                  <button
                    onClick={() => handleCorroborate(report.id, 'resolved')}
                    disabled={actionLoadingId === report.id || isResolved}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold transition-all"
                  >
                    Mark Resolved
                  </button>

                  {/* Moderator Fast Status Toggle */}
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    className="bg-navy-950 text-slate-400 border border-slate-800 text-[11px] rounded p-1"
                    title="Change verification status"
                  >
                    <option value="pending">Set Pending</option>
                    <option value="verified">Set Verified</option>
                    <option value="under_repair">Set Under Repair</option>
                    <option value="resolved">Set Resolved</option>
                  </select>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
