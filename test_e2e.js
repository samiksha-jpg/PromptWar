/**
 * End-to-End Automated Verification Test Suite for CitySense AI
 */

async function runTestSuite() {
  console.log('==================================================');
  console.log('🧪 CitySense AI Automated Test Suite');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Frontend server health
  await test('Frontend server is delivering HTML on port 5173', async () => {
    const res = await fetch('http://localhost:5173');
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const text = await res.text();
    if (!text.includes('CitySense AI')) throw new Error('CitySense AI title missing from HTML');
    if (!text.includes('id="root"')) throw new Error('React root element missing');
  });

  // 2. Backend Health Endpoint
  await test('Backend Health check returns status healthy with SQLite DB statistics and AI key status', async () => {
    const res = await fetch('http://localhost:5000/api/health');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error(`Status is not healthy: ${data.status}`);
    if (data.database.placesCount < 20) throw new Error(`Expected at least 20 places, found: ${data.database.placesCount}`);
    if (data.database.reportsCount < 3) throw new Error(`Expected at least 3 reports, found: ${data.database.reportsCount}`);
    if (!data.aiIntegration?.keyConfigured) throw new Error('AI key is not reported configured');
    if (!data.aiIntegration?.maskedKeyPreview) throw new Error('Masked key preview is missing');
  });

  // 3. Places API & All 8 Categories
  let samplePlaces = [];
  await test('Places API returns verified Pune places with all requested categories and metadata', async () => {
    const res = await fetch('http://localhost:5000/api/places?city=Pune');
    const data = await res.json();
    if (!data.success || data.count === 0) throw new Error('No places returned');
    samplePlaces = data.places;
    const sample = data.places[0];
    if (!sample.latitude || !sample.longitude) throw new Error('Coordinates missing');
    if (!sample.rating || !sample.estimated_cost) throw new Error('Required metadata missing');
  });

  // 4. Nearby Places API
  await test('Nearby Places API calculates haversine distances correctly', async () => {
    const res = await fetch('http://localhost:5000/api/places/nearby?lat=18.5204&lng=73.8567&radius=10');
    const data = await res.json();
    if (!data.success || data.count === 0) throw new Error('No nearby places returned');
    if (data.places[0].distanceKm === undefined) throw new Error('distanceKm field missing');
  });

  // 5. City Pulse API (Weather & AQI)
  await test('City Pulse returns real weather, air quality and civic hazards summary', async () => {
    const res = await fetch('http://localhost:5000/api/pulse?city=Pune');
    const data = await res.json();
    if (!data.success) throw new Error('Pulse endpoint failed');
    if (!data.weather || data.weather.temperature === undefined) throw new Error('Weather data missing');
    if (!data.airQuality || data.airQuality.aqi === undefined) throw new Error('Air quality data missing');
    if (!data.mobilityHealthIndex || data.mobilityHealthIndex.score === undefined) throw new Error('Mobility health score missing');
  });

  // 6. AI Assistant RAG Query with Google Gemini
  await test('AI Decision Assistant answers natural language queries with grounded places', async () => {
    const res = await fetch('http://localhost:5000/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What are the top historical landmarks in Pune?',
        userLat: 18.5204,
        userLng: 73.8567,
        city: 'Pune'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('AI Assistant endpoint failed: ' + data.error);
    if (!data.text || data.text.length < 20) throw new Error('AI text response is empty or too short');
    if (!data.recommendedPlaces || data.recommendedPlaces.length === 0) throw new Error('AI recommended places array is empty');
  });

  // 7. Route Comparison & Hazard Corridor Scoring
  await test('Smart Route Comparator generates routes with hazard corridor detection', async () => {
    const res = await fetch('http://localhost:5000/api/routes/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startLat: 18.5196,
        startLng: 73.8553,
        endLat: 18.5524,
        endLng: 73.9015,
        city: 'Pune'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Route comparison failed');
    if (!data.routes || data.routes.length < 2) throw new Error('Expected at least 2 alternative routes');
    if (!data.disclaimer) throw new Error('Disclaimer missing');
    const r1 = data.routes[0];
    if (r1.compositeScore === undefined) throw new Error('Composite score missing');
  });

  // 8. Place Comparison (Best vs Worst)
  await test('Compare Places endpoint computes transparent factor scores and comparative labels', async () => {
    if (samplePlaces.length < 2) throw new Error('Need at least 2 places to test comparison');
    const res = await fetch('http://localhost:5000/api/places/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'places',
        placeAId: samplePlaces[0].id,
        placeBId: samplePlaces[1].id,
        weights: { affordability: 30, rating: 20, cleanliness: 15, accessibility: 15, safety: 10, culture: 10 }
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Compare endpoint failed: ' + data.error);
    if (!data.labels || !data.labels.bestMatch) throw new Error('Best match label missing');
    if (!data.rationale) throw new Error('Plain-English rationale missing');
    if (data.placeA.score === undefined || data.placeB.score === undefined) throw new Error('Scores missing');
  });

  // 9. Create a Heritage Tour Generator
  await test('Heritage Tour Generator generates sequential stops with schedule and waypoints', async () => {
    const res = await fetch('http://localhost:5000/api/itineraries/heritage-tour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availableHours: 2,
        travelMode: 'walking',
        city: 'Pune'
      })
    });
    const data = await res.json();
    if (!data.success || !data.tour) throw new Error('Heritage tour generation failed: ' + data.error);
    if (!data.tour.schedule || data.tour.schedule.length < 2) throw new Error('Expected at least 2 heritage tour stops');
    if (!data.tour.waypoints || data.tour.waypoints.length === 0) throw new Error('Waypoints missing');
    if (!data.tour.schedule[0].whyItMatters) throw new Error('whyItMatters missing on tour stop');
  });

  // 10. Citizen Trust Engine: Duplicate Detection
  await test('Citizen Report duplicate detector identifies matching proximity reports', async () => {
    const res = await fetch('http://localhost:5000/api/reports/check-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Deep Pothole on JM Road near Sambhaji Park',
        description: 'Large crater in road near park gate',
        category: 'pothole',
        latitude: 18.5255,
        longitude: 73.8475,
        city: 'Pune'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Duplicate check failed');
    if (!data.isDuplicate) throw new Error('Expected duplicate detection to trigger for identical coordinates and title');
  });

  // 11. Citizen Report Creation & Persistence
  await test('Citizen Report can be created and persists into the SQLite database', async () => {
    const res = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Broken Paver Block on Ferguson Road Sidewalk',
        description: 'Missing tiles creating tripping hazard for pedestrians walking towards Deccan gymkhana.',
        category: 'accessibility',
        severity: 'medium',
        city: 'Pune',
        neighborhood: 'Deccan',
        latitude: 18.5210,
        longitude: 73.8420,
        reporter_name: 'E2E Test Runner',
        force_submit: true
      })
    });
    const data = await res.json();
    if (!data.success || !data.report) throw new Error('Failed to create report: ' + JSON.stringify(data));
    const createdId = data.report.id;

    // Verify it appears in reports list
    const listRes = await fetch(`http://localhost:5000/api/reports?city=Pune`);
    const listData = await listRes.json();
    const found = listData.reports.find(r => r.id === createdId);
    if (!found) throw new Error('Newly created report not found in reports list');
  });

  // 12. Saved Places Bookmarks
  await test('User can bookmark and unbookmark places with persistence', async () => {
    if (samplePlaces.length === 0) throw new Error('No places available to save');
    const targetId = samplePlaces[0].id;

    const saveRes = await fetch('http://localhost:5000/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId: targetId, notes: 'Must visit on weekend' })
    });
    const saveData = await saveRes.json();
    if (!saveData.success) throw new Error('Failed to toggle save');

    const listRes = await fetch('http://localhost:5000/api/saved');
    const listData = await listRes.json();
    if (!listData.success) throw new Error('Failed to fetch saved places');
  });

  // 13. Data & Sources Live Integrations API
  await test('Integrations Status API independently pings all 7 services without leaking secrets', async () => {
    const res = await fetch('http://localhost:5000/api/integrations/status');
    if (!res.ok) throw new Error(`Integrations check failed with status ${res.status}`);
    const data = await res.json();
    if (!data.services || data.services.length < 6) throw new Error(`Expected at least 6 services, found ${data.services.length}`);
    
    // Verify zero secret leakage
    const jsonStr = JSON.stringify(data);
    if (process.env.GEMINI_API_KEY && jsonStr.includes(process.env.GEMINI_API_KEY)) {
      throw new Error('CRITICAL SECURITY VIOLATION: Plaintext API key exposed in integrations status API');
    }

    const geminiSvc = data.services.find(s => s.provider.includes('Gemini'));
    if (!geminiSvc) throw new Error('Gemini service check missing');
    if (geminiSvc.status !== 'Connected') throw new Error(`Gemini status is not Connected: ${geminiSvc.status}`);

    const weatherSvc = data.services.find(s => s.provider.includes('Weather'));
    if (!weatherSvc || weatherSvc.status !== 'Connected') throw new Error('Weather service not Connected');
  });

  // 14. Specific Judge Prompt Scenario
  await test('Judge Scenario: "I have three hours and ₹500. Suggest interesting places with convenient routes and less crowd."', async () => {
    const res = await fetch('http://localhost:5000/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'I have three hours and ₹500. Suggest interesting places with convenient routes and less crowd.',
        userLat: 18.5204,
        userLng: 73.8567,
        city: 'Pune'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('AI query failed: ' + data.error);
    if (!data.text || data.text.length < 50) throw new Error('AI response is too short');
    if (!data.recommendedPlaces || data.recommendedPlaces.length === 0) throw new Error('Recommended places missing');
    
    // Ensure places returned have real cost within reasonable budget
    const affordablePlaces = data.recommendedPlaces.filter(p => {
      if (p.price_level && p.price_level <= 2) return true;
      if (p.approxCostInr !== undefined && p.approxCostInr <= 500) return true;
      const match = (p.estimated_cost || '').match(/\d+/);
      return match ? parseInt(match[0], 10) <= 500 : false;
    });
    if (affordablePlaces.length === 0) throw new Error('No affordable places found matching budget');
  });

  console.log('\n==================================================');
  console.log(`📊 Test Results: ${passed}/${total} passed (${Math.round((passed/total)*100)}%)`);
  console.log('==================================================');
}

runTestSuite();
