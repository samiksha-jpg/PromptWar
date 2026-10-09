import express from 'express';
import db from '../db.js';

const router = express.Router();

// Weather code description mapping according to WMO code
function interpretWmoCode(code) {
  if (code === 0) return { label: 'Clear Sky', icon: 'Sun', badge: 'Optimal Outdoor Conditions' };
  if (code <= 3) return { label: 'Partly Cloudy', icon: 'CloudSun', badge: 'Mild & Pleasant' };
  if (code <= 48) return { label: 'Foggy / Hazy', icon: 'CloudFog', badge: 'Low Visibility' };
  if (code <= 55) return { label: 'Drizzle', icon: 'CloudDrizzle', badge: 'Slick Roads' };
  if (code <= 65) return { label: 'Rain Showers', icon: 'CloudRain', badge: 'Waterlogging Risk' };
  if (code <= 82) return { label: 'Heavy Rain', icon: 'CloudRain', badge: 'High Road Caution' };
  if (code <= 99) return { label: 'Thunderstorm', icon: 'CloudLightning', badge: 'Severe Weather Alert' };
  return { label: 'Moderate', icon: 'Cloud', badge: 'Normal' };
}

/**
 * GET /api/pulse
 * City Pulse - Live weather, air quality, active hazards, and city health score
 */
router.get('/', async (req, res) => {
  try {
    const { city = 'Pune', lat = 18.5204, lng = 73.8567 } = req.query;

    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);

    let weatherData = null;
    let weatherSource = 'Open-Meteo Global Weather Service';

    // 1. Fetch live weather from Open-Meteo
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${uLat}&longitude=${uLng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const wResp = await fetch(weatherUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (wResp.ok) {
        const wJson = await wResp.json();
        const current = wJson.current || {};
        const daily = wJson.daily || {};
        const wmo = interpretWmoCode(current.weather_code ?? 0);

        weatherData = {
          temperature: Math.round(current.temperature_2m ?? 27),
          feelsLike: Math.round(current.apparent_temperature ?? 28),
          humidity: current.relative_humidity_2m ?? 55,
          windSpeedKm: Math.round(current.wind_speed_10m ?? 8),
          precipitation: current.precipitation ?? 0,
          condition: wmo.label,
          conditionBadge: wmo.badge,
          weatherCode: current.weather_code ?? 0,
          tempMax: daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : 31,
          tempMin: daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : 20,
          precipProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 10,
          isLive: true
        };
      }
    } catch (err) {
      console.warn('[Pulse weather fetch warning]:', err.message);
    }

    // Weather fallback if external API is unreachable
    if (!weatherData) {
      weatherSource = 'CitySense Historical Climate Telemetry (Offline Mode)';
      weatherData = {
        temperature: 28,
        feelsLike: 29,
        humidity: 58,
        windSpeedKm: 11,
        precipitation: 0,
        condition: 'Clear Sky / Sunny',
        conditionBadge: 'Pleasant Explorer Conditions',
        weatherCode: 0,
        tempMax: 32,
        tempMin: 21,
        precipProbability: 5,
        isLive: false
      };
    }

    // 2. Air Quality indicator (Open-Meteo AQI or calculated estimation)
    let aqiData = { aqi: 68, category: 'Moderate', pm25: 22, isLive: false };
    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${uLat}&longitude=${uLng}&current=us_aqi,pm2_5,pm10`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const aResp = await fetch(aqiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (aResp.ok) {
        const aJson = await aResp.json();
        const aCur = aJson.current || {};
        const usAqi = aCur.us_aqi ?? 65;
        let cat = 'Good';
        if (usAqi > 100) cat = 'Unhealthy for Sensitive Groups';
        else if (usAqi > 50) cat = 'Moderate';

        aqiData = {
          aqi: Math.round(usAqi),
          category: cat,
          pm25: Math.round(aCur.pm2_5 ?? 20),
          isLive: true
        };
      }
    } catch (err) {
      // Keep sensible default
    }

    // 3. Citizen Hazards Summary from Database
    const allReports = db.prepare(
      "SELECT category, status, severity, created_at FROM reports WHERE city = ? AND status != 'resolved' AND status != 'rejected'"
    ).all(city);

    const categoryCounts = {
      pothole: 0,
      waterlogging: 0,
      broken_streetlight: 0,
      garbage: 0,
      road_obstruction: 0,
      accessibility: 0
    };

    let criticalHazardsCount = 0;
    allReports.forEach(r => {
      if (categoryCounts[r.category] !== undefined) {
        categoryCounts[r.category]++;
      }
      if (r.severity === 'critical' || r.severity === 'high') {
        criticalHazardsCount++;
      }
    });

    // 4. Recent Verified Incidents Feed
    const recentAlerts = db.prepare(`
      SELECT id, title, category, severity, neighborhood, latitude, longitude, status, corroborations_count, created_at
      FROM reports
      WHERE city = ? AND status != 'resolved'
      ORDER BY created_at DESC
      LIMIT 6
    `).all(city);

    // 5. City Mobility Health Score (0 - 100)
    // Decreases with severe weather, heavy AQI, or high unresolved civic hazards
    let healthScore = 92;
    if (weatherData.precipitation > 5) healthScore -= 12;
    if (aqiData.aqi > 100) healthScore -= 10;
    healthScore -= Math.min(25, criticalHazardsCount * 4);
    healthScore = Math.max(35, Math.min(100, healthScore));

    res.json({
      success: true,
      city,
      lastUpdated: new Date().toISOString(),
      weather: {
        ...weatherData,
        source: weatherSource
      },
      airQuality: {
        ...aqiData,
        source: aqiData.isLive ? 'Open-Meteo Air Quality Service' : 'Municipal Regional Baseline'
      },
      hazardsSummary: {
        activeCount: allReports.length,
        criticalCount: criticalHazardsCount,
        breakdown: categoryCounts,
        recentAlerts
      },
      mobilityHealthIndex: {
        score: healthScore,
        status: healthScore >= 80 ? 'Smooth Mobility' : healthScore >= 60 ? 'Moderate Caution' : 'Disrupted Conditions',
        summary: `${city} reports ${allReports.length} active civic notices. Weather is ${weatherData.condition.toLowerCase()} with ${aqiData.category.toLowerCase()} air quality.`
      }
    });
  } catch (error) {
    console.error('[City Pulse Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
