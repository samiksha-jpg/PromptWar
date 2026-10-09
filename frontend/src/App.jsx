import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HomeView from './components/views/HomeView';
import ExplorePlacesView from './components/views/ExplorePlacesView';
import HistoryCultureView from './components/views/HistoryCultureView';
import SafetyRoutesView from './components/views/SafetyRoutesView';
import TrafficCityUpdatesView from './components/views/TrafficCityUpdatesView';
import ComparePlacesView from './components/views/ComparePlacesView';
import AiAssistantView from './components/views/AiAssistantView';
import DataSourcesView from './components/views/DataSourcesView';

import PlaceDetailsDrawer from './components/PlaceDetailsDrawer';
import CitizenReportModal from './components/CitizenReportModal';
import SavedPlacesModal from './components/SavedPlacesModal';
import AiAssistantModal from './components/AiAssistantModal';
import JudgeTourModal from './components/JudgeTourModal';

import {
  getPlaces,
  getReports,
  getCityPulse,
  getSavedPlaces,
  toggleSavePlace,
  getSystemHealth
} from './utils/api';

import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentCity, setCurrentCity] = useState('Pune');
  
  const [places, setPlaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [pulseData, setPulseData] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Modals & Drawers state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [isPulseRefreshing, setIsPulseRefreshing] = useState(false);
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState(false);

  // Set of saved place IDs for O(1) lookup
  const savedPlaceIds = new Set(savedPlaces.map(s => s.place?.id || s.id));

  // Initial Data Fetching
  const loadData = async (city) => {
    try {
      const [placesRes, reportsRes, pulseRes, savedRes, healthRes] = await Promise.all([
        getPlaces({ city }),
        getReports({ city }),
        getCityPulse(city),
        getSavedPlaces(),
        getSystemHealth()
      ]);

      if (placesRes.places) setPlaces(placesRes.places);
      if (reportsRes.reports) setReports(reportsRes.reports);
      if (pulseRes) setPulseData(pulseRes);
      if (savedRes.savedPlaces) setSavedPlaces(savedRes.savedPlaces);
      if (healthRes) setSystemHealth(healthRes);
    } catch (err) {
      console.warn('[Data Load Warning]:', err.message);
    }
  };

  useEffect(() => {
    loadData(currentCity);
  }, [currentCity]);

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation denied or timed out:', error);
        setUserLocation({ lat: 18.5204, lng: 73.8567 });
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  // Toggle Save / Bookmark
  const handleToggleSave = async (placeId) => {
    try {
      await toggleSavePlace(placeId);
      const res = await getSavedPlaces();
      if (res.savedPlaces) setSavedPlaces(res.savedPlaces);
    } catch (err) {
      console.warn('Save toggle error:', err);
    }
  };

  // Direct Directions CTA
  const handleGetDirectionsToPlace = (place) => {
    setSelectedPlace(null);
    setActiveSection('safety');
  };

  // Quick launch AI with question
  const handleAskAi = (query) => {
    setAiInitialQuery(query);
    setActiveSection('ai');
  };

  return (
    <div className="min-h-screen bg-ambient-mesh text-slate-100 flex flex-col lg:flex-row selection:bg-teal-500 selection:text-black">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentCity={currentCity}
        setCurrentCity={setCurrentCity}
        userLocation={userLocation}
        onDetectLocation={handleDetectLocation}
        isLocating={isLocating}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        savedCount={savedPlaces.length}
        systemHealth={systemHealth}
        onStartTour={() => setIsJudgeTourOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
          
          {/* SECTION 1: HOME */}
          {activeSection === 'home' && (
            <HomeView
              places={places}
              reports={reports}
              pulseData={pulseData}
              onNavigate={(sec) => setActiveSection(sec)}
              onSelectPlace={(p) => setSelectedPlace(p)}
              onToggleSave={handleToggleSave}
              savedPlaceIds={savedPlaceIds}
              onAskAi={handleAskAi}
              userLocation={userLocation}
              currentCity={currentCity}
              onStartTour={() => setIsJudgeTourOpen(true)}
            />
          )}

          {/* SECTION 2: EXPLORE PLACES */}
          {activeSection === 'explore' && (
            <ExplorePlacesView
              places={places}
              reports={reports}
              userLocation={userLocation}
              onSelectPlace={(p) => setSelectedPlace(p)}
              onToggleSave={handleToggleSave}
              savedPlaceIds={savedPlaceIds}
              onGetDirections={handleGetDirectionsToPlace}
              currentCity={currentCity}
            />
          )}

          {/* SECTION 3: HISTORY & CULTURE */}
          {activeSection === 'history' && (
            <HistoryCultureView
              places={places}
              onSelectPlace={(p) => setSelectedPlace(p)}
              onViewRouteOnMap={(tour) => {
                setActiveSection('explore');
              }}
              currentCity={currentCity}
            />
          )}

          {/* SECTION 4: SAFETY & ROUTES */}
          {activeSection === 'safety' && (
            <SafetyRoutesView
              places={places}
              reports={reports}
              userLocation={userLocation}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onViewRouteOnMap={(route) => {
                setActiveSection('explore');
              }}
              currentCity={currentCity}
            />
          )}

          {/* SECTION 5: TRAFFIC & CITY UPDATES */}
          {activeSection === 'traffic' && (
            <TrafficCityUpdatesView
              pulseData={pulseData}
              reports={reports}
              onRefresh={async () => {
                setIsPulseRefreshing(true);
                const p = await getCityPulse(currentCity);
                setPulseData(p);
                setIsPulseRefreshing(false);
              }}
              isRefreshing={isPulseRefreshing}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onSelectReportOnMap={(rep) => {
                setActiveSection('explore');
              }}
              currentCity={currentCity}
            />
          )}

          {/* SECTION 6: COMPARE PLACES */}
          {activeSection === 'compare' && (
            <ComparePlacesView
              places={places}
              currentCity={currentCity}
            />
          )}

          {/* SECTION 7: AI CITY ASSISTANT */}
          {activeSection === 'ai' && (
            <AiAssistantView
              userLocation={userLocation}
              currentCity={currentCity}
              onSelectPlace={(p) => setSelectedPlace(p)}
              onToggleSave={handleToggleSave}
              savedPlaceIds={savedPlaceIds}
            />
          )}

          {/* SECTION 8: DATA & SOURCES */}
          {activeSection === 'sources' && (
            <DataSourcesView />
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070b14] py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-extrabold text-white text-sm">CitySense AI</span> — Smart City Exploration, Safety & Intelligence Platform
              <p className="text-[11px] text-slate-400 mt-0.5">
                Powered by OpenStreetMap, Open-Meteo, OSRM Routing Engine, and Google Gemini AI.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {systemHealth && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Backend Healthy ({systemHealth.database?.placesCount} Places • {systemHealth.database?.reportsCount} Reports)
                </span>
              )}
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-semibold">{currentCity}, India</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating AI Assistant FAB Button (Direct access from any section) */}
      <button
        onClick={() => {
          setAiInitialQuery('');
          setIsAiModalOpen(true);
        }}
        title="Quick Ask CitySense AI"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs shadow-2xl shadow-teal-500/40 hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
          </span>
        </div>
        <span className="hidden sm:inline">Ask AI Assistant</span>
      </button>

      {/* Global Modals & Drawers */}
      <PlaceDetailsDrawer
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onDirections={handleGetDirectionsToPlace}
        onToggleSave={handleToggleSave}
        isSaved={selectedPlace ? savedPlaceIds.has(selectedPlace.id) : false}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuery={aiInitialQuery}
        userLocation={userLocation}
        currentCity={currentCity}
        onSelectPlace={(p) => setSelectedPlace(p)}
        onToggleSave={handleToggleSave}
        savedPlaceIds={savedPlaceIds}
      />

      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userLocation={userLocation}
        currentCity={currentCity}
        onReportCreated={() => loadData(currentCity)}
      />

      <SavedPlacesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPlaces={savedPlaces}
        onSelectPlace={(p) => setSelectedPlace(p)}
        onRemoveSaved={handleToggleSave}
      />

      <JudgeTourModal
        isOpen={isJudgeTourOpen}
        onClose={() => setIsJudgeTourOpen(false)}
        activeSection={activeSection}
        onNavigate={(sec) => setActiveSection(sec)}
      />

    </div>
  );
}
