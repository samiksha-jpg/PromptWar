/**
 * CitySense AI API Client
 */

const BASE_URL = '/api';

export async function getPlaces(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/places?${query}`);
  if (!res.ok) throw new Error('Failed to fetch places');
  return res.json();
}

export async function getNearbyPlaces(lat, lng, radius = 5, category = 'all') {
  const res = await fetch(`${BASE_URL}/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}`);
  if (!res.ok) throw new Error('Failed to fetch nearby places');
  return res.json();
}

export async function getPlaceDetails(id) {
  const res = await fetch(`${BASE_URL}/places/${id}`);
  if (!res.ok) throw new Error('Failed to fetch place details');
  return res.json();
}

export async function getNeighborhoods(city = 'Pune') {
  const res = await fetch(`${BASE_URL}/places/meta/neighborhoods?city=${city}`);
  if (!res.ok) throw new Error('Failed to fetch neighborhoods');
  return res.json();
}

export async function calculateMatchScore(weights, placeId = null) {
  const res = await fetch(`${BASE_URL}/places/match-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weights, placeId })
  });
  if (!res.ok) throw new Error('Failed to calculate match score');
  return res.json();
}

export async function getCityPulse(city = 'Pune', lat = 18.5204, lng = 73.8567) {
  const res = await fetch(`${BASE_URL}/pulse?city=${city}&lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to fetch city pulse');
  return res.json();
}

export async function compareRoutes(startLat, startLng, endLat, endLng, city = 'Pune') {
  const res = await fetch(`${BASE_URL}/routes/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startLat, startLng, endLat, endLng, city })
  });
  if (!res.ok) throw new Error('Failed to compare routes');
  return res.json();
}

export async function askAiAssistant(query, userLat = null, userLng = null, city = 'Pune', history = []) {
  const res = await fetch(`${BASE_URL}/ai/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, userLat, userLng, city, history })
  });
  if (!res.ok) throw new Error('Failed to query AI assistant');
  return res.json();
}

export async function getReports(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/reports?${query}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function checkReportDuplicate(payload) {
  const res = await fetch(`${BASE_URL}/reports/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function predictCategory(title, description) {
  const res = await fetch(`${BASE_URL}/reports/predict-category`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  return res.json();
}

export async function submitReport(formData) {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    body: formData // multipart/form-data
  });
  const data = await res.json();
  if (!res.ok && res.status !== 409) {
    throw new Error(data.error || 'Failed to submit report');
  }
  return { status: res.status, data };
}

export async function corroborateReport(id, action = 'still_there', comment = '') {
  const res = await fetch(`${BASE_URL}/reports/${id}/corroborate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, comment })
  });
  if (!res.ok) throw new Error('Failed to corroborate report');
  return res.json();
}

export async function updateReportStatus(id, status) {
  const res = await fetch(`${BASE_URL}/reports/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function getItineraries(city = 'Pune') {
  const res = await fetch(`${BASE_URL}/itineraries?city=${city}`);
  if (!res.ok) throw new Error('Failed to fetch itineraries');
  return res.json();
}

export async function createItinerary(payload) {
  const res = await fetch(`${BASE_URL}/itineraries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create itinerary');
  return res.json();
}

export async function getSavedPlaces() {
  const res = await fetch(`${BASE_URL}/saved`);
  if (!res.ok) throw new Error('Failed to fetch saved places');
  return res.json();
}

export async function toggleSavePlace(placeId, notes = '') {
  const res = await fetch(`${BASE_URL}/saved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId, notes })
  });
  if (!res.ok) throw new Error('Failed to toggle save');
  return res.json();
}

export async function getSystemHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Failed to check health');
  return res.json();
}

export async function comparePlaces(payload) {
  const res = await fetch(`${BASE_URL}/places/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to compare places');
  }
  return res.json();
}

export async function generateHeritageTour(payload) {
  const res = await fetch(`${BASE_URL}/itineraries/heritage-tour`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate heritage tour');
  }
  return res.json();
}

export async function getIntegrationsStatus() {
  const res = await fetch(`${BASE_URL}/integrations/status`);
  if (!res.ok) throw new Error('Failed to fetch integrations status');
  return res.json();
}

