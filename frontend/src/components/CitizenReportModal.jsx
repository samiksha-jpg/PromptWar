import React, { useState } from 'react';
import { X, AlertTriangle, Sparkles, Upload, MapPin, CheckCircle2, ShieldAlert, ArrowRight, CornerRightDown } from 'lucide-react';
import { submitReport, predictCategory, checkReportDuplicate, corroborateReport } from '../utils/api';

export default function CitizenReportModal({
  isOpen,
  onClose,
  userLocation,
  currentCity,
  onReportCreated
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [severity, setSeverity] = useState('medium');
  const [neighborhood, setNeighborhood] = useState('Shivaji Nagar');
  const [lat, setLat] = useState(userLocation?.lat || 18.5204);
  const [lng, setLng] = useState(userLocation?.lng || 73.8567);
  const [reporterName, setReporterName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [aiPredicting, setAiPredicting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleAiAutoCategory = async () => {
    if (!description && !title) {
      alert('Please enter a title or description first.');
      return;
    }
    setAiPredicting(true);
    try {
      const res = await predictCategory(title, description);
      if (res.category) {
        setCategory(res.category);
      }
    } catch (e) {
      console.warn('AI prediction error:', e);
    } finally {
      setAiPredicting(false);
    }
  };

  const handleSubmit = async (forceSubmit = false) => {
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setDuplicateWarning(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('severity', severity);
    formData.append('neighborhood', neighborhood.trim());
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    formData.append('city', currentCity);
    formData.append('reporter_name', reporterName.trim() || 'Citizen Volunteer');
    if (forceSubmit) {
      formData.append('force_submit', 'true');
    }
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const res = await submitReport(formData);

      if (res.status === 409 && res.data.isDuplicate) {
        // Duplicate report detected!
        setDuplicateWarning(res.data.duplicateInfo);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Thank you! Your civic report has been submitted to the Citizen Trust Engine.');
      if (onReportCreated) onReportCreated(res.data.report);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed. Please check form fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorroborateExisting = async (reportId) => {
    try {
      await corroborateReport(reportId, 'still_there', 'Corroborated by reporting user.');
      alert('Thank you! Corroboration recorded for the existing report.');
      onClose();
    } catch (err) {
      alert('Error recording corroboration: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-navy-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-navy-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Citizen Trust Engine — Report Civic Issue</h3>
              <p className="text-xs text-slate-400">Potholes, waterlogging, broken lights, and pedestrian hazards</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Duplicate Warning Dialog */}
          {duplicateWarning && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Potential Duplicate Issue Detected!</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {duplicateWarning.reason}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCorroborateExisting(duplicateWarning.matchedReport?.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
                >
                  Corroborate Existing Issue (+1)
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  Submit Separate Report Anyway
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Issue Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dangerous pothole near Deccan bus stop"
              className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Description & AI Classification button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Detailed Description *</label>
              <button
                type="button"
                onClick={handleAiAutoCategory}
                disabled={aiPredicting}
                className="text-[11px] text-brand-300 hover:text-brand-200 font-semibold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>{aiPredicting ? 'Classifying...' : 'Auto-classify Category'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, size, hazard level, and exact landmark..."
              className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-teal-400"
              >
                <option value="pothole" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🕳️ Pothole / Road Damage</option>
                <option value="waterlogging" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🌊 Waterlogging / Drainage Block</option>
                <option value="broken_streetlight" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">💡 Broken Streetlight / Dark Stretch</option>
                <option value="road_obstruction" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🚧 Road Obstruction / Fallen Branch</option>
                <option value="accessibility" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">♿ Footpath / Accessibility Hazard</option>
                <option value="garbage" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🗑️ Garbage / Waste Pile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#0b1120] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-teal-400"
              >
                <option value="low" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🟢 Low (Minor inconvenience)</option>
                <option value="medium" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🟡 Medium (Slows traffic)</option>
                <option value="high" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🟠 High (Hazardous to vehicles)</option>
                <option value="critical" className="bg-[#0b1120] text-slate-100 py-1.5 font-medium">🔴 Critical (Immediate danger / Accident risk)</option>
              </select>
            </div>
          </div>

          {/* Location & Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Neighborhood / Area</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Deccan / FC Road"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Your Name / Pseudonym</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Samik or Citizen Volunteer"
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Coordinates indicator */}
          <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Location Coordinates:</span>
            </div>
            <span className="font-mono text-teal-300 text-[11px]">{Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</span>
          </div>

          {/* Photo File Upload (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Photo Evidence (Optional)</label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 rounded-xl hover:border-brand-500/50 cursor-pointer bg-navy-900/40 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs text-slate-300 font-medium">
                {photoFile ? photoFile.name : 'Click to upload photo evidence (JPG, PNG)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0] || null)}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-navy-900/90 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Reports enter the Citizen Trust Engine with initial Pending status.
          </p>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Submitting Report...' : 'Submit Civic Report'}
          </button>
        </div>

      </div>
    </div>
  );
}
