import express from 'express';
import db from '../db.js';
import { calculateDistanceKm } from '../utils/geo.js';

const router = express.Router();

/**
 * Helper to hydrate itinerary places
 */
function hydrateItinerary(itin) {
  let placeIds = [];
  try {
    placeIds = JSON.parse(itin.places_json || '[]');
  } catch (e) {
    placeIds = [];
  }

  const places = [];
  let totalDistanceKm = 0;
  let prevPlace = null;

  for (const id of placeIds) {
    const p = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
    if (p) {
      const formatted = {
        ...p,
        tags: p.tags ? JSON.parse(p.tags) : []
      };
      if (prevPlace) {
        totalDistanceKm += calculateDistanceKm(
          prevPlace.latitude, prevPlace.longitude,
          p.latitude, p.longitude
        );
      }
      places.push(formatted);
      prevPlace = p;
    }
  }

  return {
    ...itin,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    places
  };
}

/**
 * GET /api/itineraries
 * Curated & community itineraries
 */
router.get('/', (req, res) => {
  try {
    const { city = 'Pune', theme } = req.query;

    let query = 'SELECT * FROM itineraries WHERE city = ?';
    const params = [city];

    if (theme && theme !== 'all') {
      query += ' AND theme = ?';
      params.push(theme);
    }

    query += ' ORDER BY is_curated DESC, id ASC';

    const list = db.prepare(query).all(...params);
    const hydrated = list.map(hydrateItinerary);

    res.json({
      success: true,
      count: hydrated.length,
      itineraries: hydrated
    });
  } catch (error) {
    console.error('[Itineraries Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/itineraries/:id
 */
router.get('/:id', (req, res) => {
  try {
    const itin = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(req.params.id);
    if (!itin) {
      return res.status(404).json({ success: false, error: 'Itinerary not found' });
    }
    res.json({
      success: true,
      itinerary: hydrateItinerary(itin)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/itineraries
 * Create custom user itinerary
 */
router.post('/', (req, res) => {
  try {
    const { title, description, city = 'Pune', theme = 'custom', estimated_duration, estimated_cost, placeIds = [] } = req.body;

    if (!title || !placeIds || placeIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Title and at least one place are required.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO itineraries (
        title, description, city, theme, estimated_duration,
        estimated_cost, places_json, is_curated, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      title.trim(),
      description ? description.trim() : 'Custom User Created Day Route',
      city,
      theme,
      estimated_duration || `${placeIds.length * 1.2} hours`,
      estimated_cost || 'Pay per spot',
      JSON.stringify(placeIds),
      now
    );

    const created = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Custom itinerary saved successfully!',
      itinerary: hydrateItinerary(created)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/itineraries/heritage-tour
 * Create a custom Heritage Tour based on available time and travel preferences
 */
router.post('/heritage-tour', (req, res) => {
  try {
    const { availableHours = 2, travelMode = 'walking', city = 'Pune' } = req.body;
    const hours = Math.max(1, Math.min(8, Number(availableHours) || 2));

    // Fetch heritage spots in city
    const allHeritage = db.prepare(`
      SELECT * FROM places 
      WHERE city = ? AND (
        category = 'tourist_attraction' OR 
        category = 'hidden_gem' OR 
        tags LIKE '%heritage%' OR 
        tags LIKE '%history%' OR
        historical_context IS NOT NULL
      )
    `).all(city);

    if (allHeritage.length === 0) {
      return res.status(404).json({ success: false, error: 'No heritage places found for this city.' });
    }

    // Filter/Score candidates based on travel preference
    let candidates = allHeritage.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));

    if (travelMode === 'walking') {
      // Prioritize Old Pune clustered landmarks (within 1.5 km of Shaniwar Wada)
      const baseLat = 18.5196;
      const baseLng = 73.8553;
      candidates = candidates.filter(p => {
        const d = calculateDistanceKm(baseLat, baseLng, p.latitude, p.longitude);
        return d <= 3.5;
      });
    } else if (travelMode === 'family') {
      // Prioritize high accessibility and family friendly spots
      candidates = candidates.filter(p => p.accessibility_score >= 3);
    }

    if (candidates.length === 0) {
      candidates = allHeritage.map(p => ({
        ...p,
        tags: p.tags ? JSON.parse(p.tags) : []
      }));
    }

    // Determine number of stops based on available hours
    let targetStops = 2;
    if (hours >= 6) targetStops = 5;
    else if (hours >= 4) targetStops = 4;
    else if (hours >= 2) targetStops = 3;

    // Greedy TSP sort from starting place with highest rating
    candidates.sort((a, b) => b.rating - a.rating);
    const selectedStops = [candidates[0]];
    const remaining = candidates.slice(1);

    while (selectedStops.length < targetStops && remaining.length > 0) {
      const last = selectedStops[selectedStops.length - 1];
      let nearestIdx = 0;
      let minDistance = 99999;
      for (let i = 0; i < remaining.length; i++) {
        const dist = calculateDistanceKm(last.latitude, last.longitude, remaining[i].latitude, remaining[i].longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }
      selectedStops.push(remaining.splice(nearestIdx, 1)[0]);
    }

    // Build timeline and route coordinates
    let totalDistanceKm = 0;
    const waypoints = [];
    const schedule = [];
    let currentMinutes = 9 * 60; // 09:00 AM start

    selectedStops.forEach((stop, idx) => {
      waypoints.push([stop.longitude, stop.latitude]);

      if (idx > 0) {
        const prev = selectedStops[idx - 1];
        const segDist = calculateDistanceKm(prev.latitude, prev.longitude, stop.latitude, stop.longitude);
        totalDistanceKm += segDist;
        const travelMins = travelMode === 'walking' 
          ? Math.round(segDist * 13) // ~4.6 km/h walking
          : Math.round(segDist * 3.5); // ~17 km/h city auto/cab
        currentMinutes += travelMins;
      }

      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const visitMins = hours <= 2 ? 35 : 55;
      const endMinutes = currentMinutes + visitMins;
      const endH = Math.floor(endMinutes / 60);
      const endM = endMinutes % 60;

      const formatTime = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const displayM = m < 10 ? `0${m}` : m;
        return `${displayH}:${displayM} ${ampm}`;
      };

      schedule.push({
        stopIndex: idx + 1,
        timeWindow: `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`,
        placeId: stop.id,
        name: stop.name,
        neighborhood: stop.neighborhood,
        description: stop.description,
        historical_context: stop.historical_context,
        estimated_cost: stop.estimated_cost,
        opening_hours: stop.opening_hours,
        best_time_to_visit: stop.best_time_to_visit,
        source: stop.source,
        image_url: stop.image_url,
        latitude: stop.latitude,
        longitude: stop.longitude,
        whyItMatters: stop.historical_context 
          ? stop.historical_context.split('.')[0] + '.'
          : `Significant historic legacy in ${stop.neighborhood}.`
      });

      currentMinutes = endMinutes + 10; // 10 min buffer
    });

    res.json({
      success: true,
      tour: {
        title: `${hours}-Hour Pune Heritage Experience (${travelMode.toUpperCase()})`,
        availableHours: hours,
        travelMode,
        city,
        totalStops: selectedStops.length,
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        estimatedDurationText: `${hours} hours`,
        schedule,
        waypoints,
        disclaimer: 'Heritage opening times and ticket rates are subject to Archaeological Survey of India (ASI) regulations.'
      }
    });
  } catch (error) {
    console.error('[Heritage Tour Generator Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

