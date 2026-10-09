/**
 * Geo calculation utilities for CitySense AI
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculate haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate distance in meters
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  return calculateDistanceKm(lat1, lon1, lat2, lon2) * 1000;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate perpendicular distance from point P to line segment AB in meters
 */
export function distanceToSegmentMeters(pLat, pLon, aLat, aLon, bLat, bLon) {
  // Convert spherical to approximate equirectangular flat coordinates in meters for local proximity
  const midLat = toRad((aLat + bLat) / 2);
  const xA = toRad(aLon) * EARTH_RADIUS_KM * 1000 * Math.cos(midLat);
  const yA = toRad(aLat) * EARTH_RADIUS_KM * 1000;
  const xB = toRad(bLon) * EARTH_RADIUS_KM * 1000 * Math.cos(midLat);
  const yB = toRad(bLat) * EARTH_RADIUS_KM * 1000;
  const xP = toRad(pLon) * EARTH_RADIUS_KM * 1000 * Math.cos(midLat);
  const yP = toRad(pLat) * EARTH_RADIUS_KM * 1000;

  const dx = xB - xA;
  const dy = yB - yA;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const dX = xP - xA;
    const dY = yP - yA;
    return Math.sqrt(dX * dX + dY * dY);
  }

  // Projection factor t
  let t = ((xP - xA) * dx + (yP - yA) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const projX = xA + t * dx;
  const projY = yA + t * dy;

  const dX = xP - projX;
  const dY = yP - projY;
  return Math.sqrt(dX * dX + dY * dY);
}

/**
 * Check how many hazard points are within a threshold (e.g. 150m) along a route coordinate polyline
 * @param {Array<[number, number]>} coordinates [[lon, lat], ...] as from GeoJSON
 * @param {Array<Object>} hazards [{latitude, longitude, severity, category, ...}]
 * @param {number} bufferMeters default 150 meters corridor buffer
 */
export function findHazardsAlongRoute(coordinates, hazards, bufferMeters = 150) {
  if (!coordinates || coordinates.length < 2 || !hazards || hazards.length === 0) {
    return [];
  }

  const matchingHazards = new Set();
  const matchedList = [];

  for (const hazard of hazards) {
    if (matchingHazards.has(hazard.id)) continue;
    const hLat = hazard.latitude;
    const hLon = hazard.longitude;

    // Check each line segment of the route
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lonA, latA] = coordinates[i];
      const [lonB, latB] = coordinates[i + 1];

      const dist = distanceToSegmentMeters(hLat, hLon, latA, lonA, latB, lonB);
      if (dist <= bufferMeters) {
        matchingHazards.add(hazard.id);
        matchedList.push({
          ...hazard,
          distanceFromRouteMeters: Math.round(dist)
        });
        break;
      }
    }
  }

  return matchedList;
}
