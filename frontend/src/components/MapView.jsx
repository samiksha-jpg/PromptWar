import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, List, Map as MapIcon, Filter, AlertTriangle, Sparkles, Navigation, Info, Eye } from 'lucide-react';

// Custom SVG Icons for Leaflet markers
function createCustomIcon(category, isHazard = false) {
  let bgColor = '#14b8a6'; // Teal default
  let iconSvg = '';

  if (isHazard) {
    bgColor = '#f43f5e'; // Rose / Red for hazards
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else if (category === 'heritage') {
    bgColor = '#f59e0b'; // Amber
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>`;
  } else if (category === 'food') {
    bgColor = '#10b981'; // Emerald
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.4 7.4"/><path d="m18 9 3 3"/></svg>`;
  } else if (category === 'nature') {
    bgColor = '#06b6d4'; // Cyan
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 7-7c1.3 0 2.5.3 3.5.9A7.5 7.5 0 0 1 20 13a7 7 0 0 1-7 7Z"/><path d="M11 20v-9"/></svg>`;
  } else if (category === 'gem') {
    bgColor = '#a855f7'; // Purple
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M11 3 8 9l4 12 4-12-3-6"/></svg>`;
  } else {
    bgColor = '#0284c7';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="background-color: ${bgColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2px solid #ffffff;">
        ${iconSvg}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16]
  });
}

export default function MapView({
  places = [],
  reports = [],
  activeRoute = null,
  userLocation = null,
  selectedPlace = null,
  onSelectPlace,
  onSelectReport,
  onSetAsRouteOrigin,
  onSetAsRouteDest,
  initialCenter = [18.5204, 73.8567],
  initialZoom = 13
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [showHazards, setShowHazards] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false
    });

    // Clean modern dark tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker layers
    const markersLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    routeLayerRef.current = routeLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-pin',
          html: `
            <div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 15px #3b82f6;">
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup('<b>Your Current Location</b>');
      }
    }
  }, [userLocation]);

  // Render Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Render Places
    const filteredPlaces = places.filter(p => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'gem') return p.is_hidden_gem === 1;
      return p.category === activeCategory;
    });

    filteredPlaces.forEach(p => {
      const marker = L.marker([p.latitude, p.longitude], {
        icon: createCustomIcon(p.category)
      });

      // Interactive popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 min-w-[200px] text-slate-100';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-slate-100 mb-1">${p.name}</div>
        <div class="text-xs text-brand-400 font-semibold mb-1">${p.neighborhood} • ${p.category.toUpperCase()}</div>
        <p class="text-xs text-slate-300 line-clamp-2 mb-2">${p.description}</p>
        <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-700">
          <span>★ ${p.rating} (${p.review_count})</span>
          <span class="text-teal-300 font-medium">${p.estimated_cost || '₹'}</span>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectPlace) onSelectPlace(p);
      });

      marker.addTo(layer);
    });

    // 2. Render Citizen Hazards / Reports
    if (showHazards) {
      reports.forEach(r => {
        if (r.status === 'resolved') return; // Skip resolved

        const hMarker = L.marker([r.latitude, r.longitude], {
          icon: createCustomIcon(r.category, true)
        });

        const hPopup = document.createElement('div');
        hPopup.className = 'p-2 min-w-[200px] text-slate-100';
        hPopup.innerHTML = `
          <div class="flex items-center gap-1.5 font-bold text-sm text-rose-400 mb-1">
            <span>⚠️ ${r.title}</span>
          </div>
          <div class="text-[11px] text-amber-300 font-semibold mb-1">
            Severity: ${r.severity.toUpperCase()} • Status: ${r.status}
          </div>
          <p class="text-xs text-slate-300 line-clamp-2 mb-2">${r.description}</p>
          <div class="text-[11px] text-slate-400 border-t border-slate-700 pt-1">
            Corroborated by ${r.corroborations_count || 1} citizens
          </div>
        `;

        hMarker.bindPopup(hPopup);
        hMarker.on('click', () => {
          if (onSelectReport) onSelectReport(r);
        });

        hMarker.addTo(layer);
      });
    }

  }, [places, reports, activeCategory, showHazards]);

  // Render Active Route if provided
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    const rLayer = routeLayerRef.current;
    rLayer.clearLayers();

    if (activeRoute && activeRoute.geometry && activeRoute.geometry.coordinates) {
      // Coordinates from GeoJSON are [lng, lat], Leaflet wants [lat, lng]
      const latLngs = activeRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      // Glow backing
      const glowLine = L.polyline(latLngs, {
        color: '#2dd4bf',
        weight: 8,
        opacity: 0.35
      }).addTo(rLayer);

      // Main Route line
      const mainLine = L.polyline(latLngs, {
        color: '#0d9488',
        weight: 4,
        opacity: 0.95
      }).addTo(rLayer);

      // Fit map to route bounds
      mapInstanceRef.current.fitBounds(mainLine.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute]);

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'gem', label: '💎 Hidden Gems' },
    { id: 'heritage', label: '🏛️ Heritage' },
    { id: 'food', label: '🍛 Food & Cafes' },
    { id: 'nature', label: '🌿 Parks & Nature' }
  ];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-navy-900">
      
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-navy-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 pointer-events-auto shadow-lg overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Toggle Tools: Civic Hazards & View Mode */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Hazards toggle button */}
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition-all ${
              showHazards
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-navy-950/85 text-slate-400 border-slate-700/80 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Civic Hazards</span>
            <span className="bg-rose-500/30 px-1.5 py-0.2 rounded text-[10px] font-bold">
              {reports.filter(r => r.status !== 'resolved').length}
            </span>
          </button>

          {/* View Mode Toggle: Map vs List View */}
          <div className="flex items-center bg-navy-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List-based View (Accessibility)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Map Element */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full transition-opacity ${viewMode === 'map' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Accessible List-Based View Mode */}
      {viewMode === 'list' && (
        <div className="absolute inset-0 z-20 bg-navy-900/95 overflow-y-auto p-4 pt-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Places List View ({places.length})</span>
                <span className="text-xs font-normal text-slate-400">Accessible tabular alternative</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {places
                .filter(p => activeCategory === 'all' || (activeCategory === 'gem' ? p.is_hidden_gem : p.category === activeCategory))
                .map(place => (
                  <div
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className="p-3.5 rounded-xl bg-navy-800/80 border border-slate-700/80 hover:border-brand-500/40 cursor-pointer transition-all flex gap-3"
                  >
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white truncate">{place.name}</h4>
                        <span className="text-xs text-amber-400 font-semibold">★ {place.rating}</span>
                      </div>
                      <p className="text-xs text-brand-400 font-medium">{place.neighborhood} • {place.subcategory}</p>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{place.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/60 text-[11px] text-slate-400">
                        <span>{place.estimated_cost}</span>
                        <span className="text-brand-300 font-semibold">View Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Overlay at Bottom Left */}
      {viewMode === 'map' && (
        <div className="absolute bottom-3 left-3 z-[1000] hidden md:flex items-center gap-3 bg-navy-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Heritage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Food</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Nature</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Gem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Hazard Alert</span>
          </div>
        </div>
      )}

    </div>
  );
}
