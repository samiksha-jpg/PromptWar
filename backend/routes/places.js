import express from 'express';
import db from '../db.js';
import { calculateDistanceKm } from '../utils/geo.js';
import { calculateCityMatchScore } from '../utils/nlp.js';

const router = express.Router();

/**
 * GET /api/places
 * Search and filter places
 */
router.get('/', (req, res) => {
  try {
    const { category, search, city = 'Pune', hidden, maxPrice } = req.query;

    let query = 'SELECT * FROM places WHERE city = ?';
    const params = [city];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (hidden === 'true' || hidden === '1') {
      query += ' AND is_hidden_gem = 1';
    }

    if (maxPrice) {
      query += ' AND price_level <= ?';
      params.push(Number(maxPrice));
    }

    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR description LIKE ? OR neighborhood LIKE ? OR tags LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY rating DESC, review_count DESC';

    const places = db.prepare(query).all(...params);

    // Parse JSON tags
    const formatted = places.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));

    res.json({
      success: true,
      count: formatted.length,
      places: formatted
    });
  } catch (error) {
    console.error('[Places API Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/places/nearby
 * Find places within radius (km) of coordinates
 */
router.get('/nearby', (req, res) => {
  try {
    const { lat, lng, radius = 5, category, city = 'Pune' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude are required.' });
    }

    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    const maxRadiusKm = parseFloat(radius);

    // Fetch places in city
    let query = 'SELECT * FROM places WHERE city = ?';
    const params = [city];
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    const allPlaces = db.prepare(query).all(...params);

    // Filter by haversine distance
    const nearby = allPlaces
      .map(p => {
        const distKm = calculateDistanceKm(uLat, uLng, p.latitude, p.longitude);
        return {
          ...p,
          tags: p.tags ? JSON.parse(p.tags) : [],
          distanceKm: Math.round(distKm * 10) / 10,
          distanceMeters: Math.round(distKm * 1000)
        };
      })
      .filter(p => p.distanceKm <= maxRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: nearby.length,
      radiusKm: maxRadiusKm,
      places: nearby
    });
  } catch (error) {
    console.error('[Nearby Places API Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/places/:id
 */
router.get('/:id', (req, res) => {
  try {
    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(req.params.id);
    if (!place) {
      return res.status(404).json({ success: false, error: 'Place not found' });
    }

    // Get nearby active hazards count (within 500m)
    const activeReports = db.prepare("SELECT latitude, longitude FROM reports WHERE status != 'resolved' AND status != 'rejected'").all();
    let nearbyHazards = 0;
    for (const rep of activeReports) {
      const d = calculateDistanceKm(place.latitude, place.longitude, rep.latitude, rep.longitude);
      if (d <= 0.5) nearbyHazards++;
    }

    // Calculate default City Match Score
    const matchScore = calculateCityMatchScore(place, {}, nearbyHazards);

    res.json({
      success: true,
      place: {
        ...place,
        tags: place.tags ? JSON.parse(place.tags) : [],
        nearbyHazardsCount: nearbyHazards,
        matchScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/places/meta/neighborhoods
 * Distinct neighborhood stats & civic health
 */
router.get('/meta/neighborhoods', (req, res) => {
  try {
    const { city = 'Pune' } = req.query;
    const places = db.prepare('SELECT * FROM places WHERE city = ?').all(city);
    const reports = db.prepare("SELECT * FROM reports WHERE city = ? AND status != 'resolved'").all(city);

    const grouped = {};
    for (const p of places) {
      if (!grouped[p.neighborhood]) {
        grouped[p.neighborhood] = {
          name: p.neighborhood,
          placesCount: 0,
          totalRating: 0,
          categories: new Set(),
          latSum: 0,
          lngSum: 0,
          activeHazards: 0
        };
      }
      grouped[p.neighborhood].placesCount++;
      grouped[p.neighborhood].totalRating += p.rating;
      grouped[p.neighborhood].categories.add(p.category);
      grouped[p.neighborhood].latSum += p.latitude;
      grouped[p.neighborhood].lngSum += p.longitude;
    }

    // Attach hazard counts
    for (const r of reports) {
      if (grouped[r.neighborhood]) {
        grouped[r.neighborhood].activeHazards++;
      }
    }

    const result = Object.values(grouped).map(n => ({
      name: n.name,
      placesCount: n.placesCount,
      averageRating: Math.round((n.totalRating / n.placesCount) * 10) / 10,
      categories: Array.from(n.categories),
      centerLat: n.latSum / n.placesCount,
      centerLng: n.lngSum / n.placesCount,
      activeHazards: n.activeHazards,
      civicStatus: n.activeHazards === 0 ? 'Clear' : n.activeHazards < 3 ? 'Caution' : 'Elevated Issues'
    }));

    res.json({
      success: true,
      neighborhoods: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/places/match-score
 * Calculate Match Score for places according to user preference weights
 */
router.post('/match-score', (req, res) => {
  try {
    const { weights = {}, placeId } = req.body;

    const activeReports = db.prepare("SELECT latitude, longitude FROM reports WHERE status != 'resolved' AND status != 'rejected'").all();

    if (placeId) {
      const place = db.prepare('SELECT * FROM places WHERE id = ?').get(placeId);
      if (!place) return res.status(404).json({ success: false, error: 'Place not found' });

      let nearbyHazards = 0;
      for (const rep of activeReports) {
        if (calculateDistanceKm(place.latitude, place.longitude, rep.latitude, rep.longitude) <= 0.5) {
          nearbyHazards++;
        }
      }

      const match = calculateCityMatchScore(place, weights, nearbyHazards);
      return res.json({
        success: true,
        placeId,
        match
      });
    }

    // Score all places and rank them
    const allPlaces = db.prepare('SELECT * FROM places').all();
    const scoredPlaces = allPlaces.map(p => {
      let nearbyHazards = 0;
      for (const rep of activeReports) {
        if (calculateDistanceKm(p.latitude, p.longitude, rep.latitude, rep.longitude) <= 0.5) {
          nearbyHazards++;
        }
      }
      const match = calculateCityMatchScore(p, weights, nearbyHazards);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        neighborhood: p.neighborhood,
        rating: p.rating,
        price_level: p.price_level,
        estimated_cost: p.estimated_cost,
        image_url: p.image_url,
        matchScore: match.score,
        breakdown: match.breakdown,
        reasoning: match.reasoning
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      weights,
      rankedPlaces: scoredPlaces
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/places/compare
 * Compare two places or two neighborhoods side-by-side with user-adjustable weights
 */
router.post('/compare', (req, res) => {
  try {
    const { 
      type = 'places',
      placeAId, 
      placeBId,
      neighborhoodA,
      neighborhoodB,
      userLat,
      userLng,
      weights = {} 
    } = req.body;

    const w = {
      affordability: weights.affordability !== undefined ? Number(weights.affordability) : 20,
      rating: weights.rating !== undefined ? Number(weights.rating) : 20,
      cleanliness: weights.cleanliness !== undefined ? Number(weights.cleanliness) : 15,
      accessibility: weights.accessibility !== undefined ? Number(weights.accessibility) : 15,
      safety: weights.safety !== undefined ? Number(weights.safety) : 15,
      culture: weights.culture !== undefined ? Number(weights.culture) : 15
    };
    const totalW = (w.affordability + w.rating + w.cleanliness + w.accessibility + w.safety + w.culture) || 100;

    const activeReports = db.prepare("SELECT latitude, longitude, severity FROM reports WHERE status != 'resolved' AND status != 'rejected'").all();

    if (type === 'places') {
      const placeA = db.prepare('SELECT * FROM places WHERE id = ?').get(placeAId);
      const placeB = db.prepare('SELECT * FROM places WHERE id = ?').get(placeBId);

      if (!placeA || !placeB) {
        return res.status(404).json({ success: false, error: 'One or both places could not be found.' });
      }

      // Count nearby active hazards for each (within 500m)
      let hazardsA = 0;
      let hazardsB = 0;
      for (const rep of activeReports) {
        if (calculateDistanceKm(placeA.latitude, placeA.longitude, rep.latitude, rep.longitude) <= 0.5) hazardsA++;
        if (calculateDistanceKm(placeB.latitude, placeB.longitude, rep.latitude, rep.longitude) <= 0.5) hazardsB++;
      }

      // Evaluate factors (0-100)
      const priceScoreMap = { 1: 100, 2: 70, 3: 45, 4: 20 };
      const factorsA = {
        affordability: priceScoreMap[placeA.price_level] || 75,
        rating: Math.min(100, Math.round((placeA.rating / 5) * 100)),
        cleanliness: Math.round((placeA.cleanliness_score / 5) * 100),
        accessibility: Math.round((placeA.accessibility_score / 5) * 100),
        safety: Math.max(20, 100 - (hazardsA * 25)),
        culture: (placeA.historical_context || placeA.category === 'tourist_attraction') ? 95 : 60
      };

      const factorsB = {
        affordability: priceScoreMap[placeB.price_level] || 75,
        rating: Math.min(100, Math.round((placeB.rating / 5) * 100)),
        cleanliness: Math.round((placeB.cleanliness_score / 5) * 100),
        accessibility: Math.round((placeB.accessibility_score / 5) * 100),
        safety: Math.max(20, 100 - (hazardsB * 25)),
        culture: (placeB.historical_context || placeB.category === 'tourist_attraction') ? 95 : 60
      };

      const scoreA = Math.round(
        (factorsA.affordability * w.affordability +
         factorsA.rating * w.rating +
         factorsA.cleanliness * w.cleanliness +
         factorsA.accessibility * w.accessibility +
         factorsA.safety * w.safety +
         factorsA.culture * w.culture) / totalW
      );

      const scoreB = Math.round(
        (factorsB.affordability * w.affordability +
         factorsB.rating * w.rating +
         factorsB.cleanliness * w.cleanliness +
         factorsB.accessibility * w.accessibility +
         factorsB.safety * w.safety +
         factorsB.culture * w.culture) / totalW
      );

      const winner = scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'tie';

      // Comparative badges
      const labels = {
        bestMatch: winner === 'A' ? placeA.name : winner === 'B' ? placeB.name : 'Equal Overall Fit',
        moreAffordable: factorsA.affordability > factorsB.affordability ? placeA.name : factorsB.affordability > factorsA.affordability ? placeB.name : 'Similar Cost',
        betterRated: placeA.rating > placeB.rating ? placeA.name : placeB.rating > placeA.rating ? placeB.name : 'Equal Ratings',
        moreAccessible: placeA.accessibility_score > placeB.accessibility_score ? placeA.name : placeB.accessibility_score > placeA.accessibility_score ? placeB.name : 'Equal Accessibility',
        moreReportedHazards: hazardsA > hazardsB ? placeA.name : hazardsB > hazardsA ? placeB.name : 'Identical Hazard Level'
      };

      // Transparent rationale
      let rationale = '';
      if (winner === 'A') {
        const topAdv = factorsA.affordability > factorsB.affordability ? 'affordability' : factorsA.accessibility > factorsB.accessibility ? 'accessibility' : 'ratings';
        rationale = `${placeA.name} scores higher (${scoreA} vs ${scoreB}) primarily due to superior ${topAdv} based on your selected priority weights.`;
      } else if (winner === 'B') {
        const topAdv = factorsB.affordability > factorsA.affordability ? 'affordability' : factorsB.accessibility > factorsA.accessibility ? 'accessibility' : 'ratings';
        rationale = `${placeB.name} scores higher (${scoreB} vs ${scoreA}) primarily due to superior ${topAdv} based on your selected priority weights.`;
      } else {
        rationale = `Both places score equally (${scoreA}/100) under your weighted preferences.`;
      }

      return res.json({
        success: true,
        type: 'places',
        weights: w,
        winner,
        labels,
        rationale,
        placeA: {
          ...placeA,
          score: scoreA,
          factors: factorsA,
          hazardsNearby: hazardsA
        },
        placeB: {
          ...placeB,
          score: scoreB,
          factors: factorsB,
          hazardsNearby: hazardsB
        }
      });
    }

    // Neighborhoods comparison
    if (type === 'neighborhoods') {
      const placesA = db.prepare('SELECT * FROM places WHERE neighborhood = ?').all(neighborhoodA);
      const placesB = db.prepare('SELECT * FROM places WHERE neighborhood = ?').all(neighborhoodB);

      if (placesA.length === 0 || placesB.length === 0) {
        return res.status(404).json({ success: false, error: 'Insufficient data to compare one or both neighborhoods.' });
      }

      const avgRatingA = placesA.reduce((s, p) => s + p.rating, 0) / placesA.length;
      const avgRatingB = placesB.reduce((s, p) => s + p.rating, 0) / placesB.length;
      const avgPriceA = placesA.reduce((s, p) => s + p.price_level, 0) / placesA.length;
      const avgPriceB = placesB.reduce((s, p) => s + p.price_level, 0) / placesB.length;
      const avgAccessA = placesA.reduce((s, p) => s + p.accessibility_score, 0) / placesA.length;
      const avgAccessB = placesB.reduce((s, p) => s + p.accessibility_score, 0) / placesB.length;

      const hazardsA = db.prepare("SELECT COUNT(*) as cnt FROM reports WHERE neighborhood = ? AND status != 'resolved'").get(neighborhoodA).cnt;
      const hazardsB = db.prepare("SELECT COUNT(*) as cnt FROM reports WHERE neighborhood = ? AND status != 'resolved'").get(neighborhoodB).cnt;

      const factorsA = {
        affordability: Math.round(Math.max(20, 100 - (avgPriceA - 1) * 25)),
        rating: Math.round((avgRatingA / 5) * 100),
        cleanliness: 85,
        accessibility: Math.round((avgAccessA / 5) * 100),
        safety: Math.max(20, 100 - (hazardsA * 20)),
        culture: placesA.some(p => p.category === 'tourist_attraction' || p.tags?.includes('heritage')) ? 90 : 60
      };

      const factorsB = {
        affordability: Math.round(Math.max(20, 100 - (avgPriceB - 1) * 25)),
        rating: Math.round((avgRatingB / 5) * 100),
        cleanliness: 85,
        accessibility: Math.round((avgAccessB / 5) * 100),
        safety: Math.max(20, 100 - (hazardsB * 20)),
        culture: placesB.some(p => p.category === 'tourist_attraction' || p.tags?.includes('heritage')) ? 90 : 60
      };

      const scoreA = Math.round(
        (factorsA.affordability * w.affordability +
         factorsA.rating * w.rating +
         factorsA.cleanliness * w.cleanliness +
         factorsA.accessibility * w.accessibility +
         factorsA.safety * w.safety +
         factorsA.culture * w.culture) / totalW
      );

      const scoreB = Math.round(
        (factorsB.affordability * w.affordability +
         factorsB.rating * w.rating +
         factorsB.cleanliness * w.cleanliness +
         factorsB.accessibility * w.accessibility +
         factorsB.safety * w.safety +
         factorsB.culture * w.culture) / totalW
      );

      const winner = scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'tie';

      return res.json({
        success: true,
        type: 'neighborhoods',
        weights: w,
        winner,
        neighborhoodA: {
          name: neighborhoodA,
          score: scoreA,
          placesCount: placesA.length,
          avgRating: Math.round(avgRatingA * 10) / 10,
          factors: factorsA,
          activeHazards: hazardsA
        },
        neighborhoodB: {
          name: neighborhoodB,
          score: scoreB,
          placesCount: placesB.length,
          avgRating: Math.round(avgRatingB * 10) / 10,
          factors: factorsB,
          activeHazards: hazardsB
        },
        labels: {
          bestMatch: winner === 'A' ? neighborhoodA : winner === 'B' ? neighborhoodB : 'Equal Match',
          moreAffordable: factorsA.affordability > factorsB.affordability ? neighborhoodA : neighborhoodB,
          betterRated: avgRatingA > avgRatingB ? neighborhoodA : neighborhoodB,
          moreAccessible: avgAccessA > avgAccessB ? neighborhoodA : neighborhoodB,
          moreReportedHazards: hazardsA > hazardsB ? neighborhoodA : hazardsB > hazardsA ? neighborhoodB : 'Similar Hazards'
        },
        rationale: `${winner === 'A' ? neighborhoodA : winner === 'B' ? neighborhoodB : 'Both areas'} emerged with the highest overall score based on empirical place data and active reports.`
      });
    }

    res.status(400).json({ success: false, error: 'Invalid comparison type specified.' });
  } catch (error) {
    console.error('[Places Compare Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
