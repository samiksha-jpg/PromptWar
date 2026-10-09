import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  SlidersHorizontal, 
  CheckCircle2, 
  ExternalLink, 
  Navigation, 
  Sparkles,
  Layers,
  Map as MapIcon,
  Grid
} from 'lucide-react';
import MapView from '../MapView';

export const EXPLORE_CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '🌐' },
  { id: 'tourist_attraction', label: 'Tourist Attractions', icon: '🏛️' },
  { id: 'food', label: 'Restaurants & Street Food', icon: '🍛' },
  { id: 'hotel', label: 'Hotels & Stays', icon: '🏨' },
  { id: 'budget_friendly', label: 'Budget-Friendly', icon: '🏷️' },
  { id: 'parks', label: 'Parks & Recreation', icon: '🌳' },
  { id: 'shopping', label: 'Shopping & Markets', icon: '🛍️' },
  { id: 'hidden_gem', label: 'Hidden Gems', icon: '💎' },
  { id: 'services', label: 'Nearby Services & Transit', icon: '🏥' }
];

export default function ExplorePlacesView({
  places = [],
  reports = [],
  userLocation,
  onSelectPlace,
  onToggleSave,
  savedPlaceIds = new Set(),
  onGetDirections,
  currentCity = 'Pune'
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all'); // 'all', '1', '2', '3', '4'
  const [minRating, setMinRating] = useState('all'); // 'all', '4.0', '4.5'
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'price_asc', 'reviews'
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'split'

  // Filter & Sort
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory = place.category === selectedCategory || 
          (selectedCategory === 'budget_friendly' && (place.price_level === 1 || place.category === 'budget_friendly')) ||
          (selectedCategory === 'hidden_gem' && (place.is_hidden_gem === 1 || place.category === 'hidden_gem')) ||
          (selectedCategory === 'tourist_attraction' && (place.category === 'tourist_attraction' || place.category === 'heritage'));
        if (!matchesCategory) return false;
      }

      // Search term
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const matchesSearch = 
          place.name.toLowerCase().includes(term) ||
          place.description?.toLowerCase().includes(term) ||
          place.neighborhood?.toLowerCase().includes(term) ||
          place.subcategory?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Budget filter
      if (budgetFilter !== 'all') {
        if (place.price_level > Number(budgetFilter)) return false;
      }

      // Rating filter
      if (minRating !== 'all') {
        if (place.rating < Number(minRating)) return false;
      }

      // Accessibility filter
      if (accessibilityOnly) {
        if ((place.accessibility_score || 0) < 4) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price_level - b.price_level;
      if (sortBy === 'reviews') return b.review_count - a.review_count;
      return 0;
    });
  }, [places, selectedCategory, searchQuery, budgetFilter, minRating, accessibilityOnly, sortBy]);

  const currentCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [18.5204, 73.8567];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-teal-400" />
            <span>Explore Places in {currentCity}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Discover verified tourist destinations, authentic eateries, hotels, budget spots, parks, bazaars, and essential public facilities.
          </p>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-space-850 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'grid' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards Grid</span>
            </button>
            <button
              onClick={() => setViewLayout('split')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'split' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Categories Filter Pills */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {EXPLORE_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-glow-teal scale-102'
                    : 'bg-space-850 text-slate-300 hover:text-white hover:bg-space-800 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Advanced Filter Bar */}
      <div className="p-4 rounded-2xl bg-space-850/90 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-teal-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, cuisine, street, neighborhood..."
              className="w-full bg-space-950 text-slate-200 text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Budget Filter */}
          <div className="md:col-span-2">
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
            >
              <option value="all" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Budget: Any Price</option>
              <option value="1" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Free / Budget (₹)</option>
              <option value="2" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Moderate (₹₹)</option>
              <option value="3" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Upscale (₹₹₹)</option>
              <option value="4" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Luxury (₹₹₹₹)</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="md:col-span-2">
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
            >
              <option value="all" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Rating: All</option>
              <option value="4.0" className="bg-[#0b1120] text-slate-100 py-1 font-medium">★ 4.0 & above</option>
              <option value="4.5" className="bg-[#0b1120] text-slate-100 py-1 font-medium">★ 4.5 & above</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-400"
            >
              <option value="rating" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Sort: Highest Rated</option>
              <option value="price_asc" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Sort: Lowest Cost First</option>
              <option value="reviews" className="bg-[#0b1120] text-slate-100 py-1 font-medium">Sort: Most Reviewed</option>
            </select>
          </div>

        </div>

        {/* Toggle options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={accessibilityOnly}
                onChange={(e) => setAccessibilityOnly(e.target.checked)}
                className="rounded border-slate-700 bg-space-950 text-teal-400 focus:ring-0"
              />
              <span>♿ Step-free wheelchair accessible only</span>
            </label>
          </div>

          <div className="text-slate-400 font-medium">
            Showing <strong className="text-teal-300">{filteredPlaces.length}</strong> of {places.length} places
          </div>
        </div>
      </div>

      {/* Split Map View Mode */}
      {viewLayout === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[620px] overflow-y-auto space-y-4 pr-1">
            {filteredPlaces.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                isSaved={savedPlaceIds.has(place.id)}
                onSelect={() => onSelectPlace(place)}
                onToggleSave={() => onToggleSave(place.id)}
                onGetDirections={() => onGetDirections(place)}
              />
            ))}
            {filteredPlaces.length === 0 && <EmptyResults />}
          </div>

          <div className="lg:col-span-7 h-[620px] rounded-2xl overflow-hidden border border-slate-800 sticky top-4">
            <MapView
              places={filteredPlaces}
              reports={reports}
              userLocation={userLocation}
              onSelectPlace={onSelectPlace}
              initialCenter={currentCenter}
            />
          </div>
        </div>
      )}

      {/* Standard Grid Cards View Mode */}
      {viewLayout === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPlaces.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                isSaved={savedPlaceIds.has(place.id)}
                onSelect={() => onSelectPlace(place)}
                onToggleSave={() => onToggleSave(place.id)}
                onGetDirections={() => onGetDirections(place)}
              />
            ))}
          </div>

          {filteredPlaces.length === 0 && <EmptyResults />}
        </>
      )}

    </div>
  );
}

function PlaceCard({ place, isSaved, onSelect, onToggleSave, onGetDirections }) {
  return (
    <div 
      onClick={onSelect}
      className="group rounded-2xl bg-space-850/85 border border-slate-800 hover:border-teal-500/50 shadow-card-dark hover:shadow-glow-teal overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-850 via-space-850/20 to-transparent" />
          
          {/* Category pill */}
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-space-950/85 text-teal-300 border border-teal-500/20 backdrop-blur-md">
            {place.category?.replace('_', ' ')}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-space-950/80 text-slate-300 hover:text-pink-400 border border-white/10 backdrop-blur-md transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-pink-400 text-pink-400' : ''}`} />
          </button>

          {/* Rating Badge */}
          <span className="absolute bottom-2.5 right-3 text-xs font-black text-amber-400 bg-space-950/90 border border-white/10 px-2 py-0.5 rounded-lg">
            ★ {place.rating} ({place.review_count})
          </span>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-display font-bold text-base text-white group-hover:text-teal-300 transition-colors line-clamp-1">
              {place.name}
            </h3>
          </div>

          <p className="text-xs text-teal-400 font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{place.neighborhood}</span>
            {place.subcategory && <span className="text-slate-400">• {place.subcategory}</span>}
          </p>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="text-teal-300 font-bold">{place.estimated_cost}</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{place.opening_hours?.split('(')[0] || 'Open Today'}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGetDirections();
            }}
            className="flex-1 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
          >
            <Navigation className="w-3 h-3" />
            <span>Directions</span>
          </button>

          <span className="text-xs font-bold text-slate-400 group-hover:text-teal-300 flex items-center gap-0.5 transition-colors">
            Details →
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="text-center py-16 p-8 rounded-2xl bg-space-850/60 border border-slate-800 space-y-3">
      <Compass className="w-10 h-10 text-slate-600 mx-auto" />
      <h4 className="text-base font-bold text-white">No Places Match Your Search</h4>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">
        Try selecting 'All Categories', relaxing the budget or rating filter, or searching for a different term.
      </p>
    </div>
  );
}
