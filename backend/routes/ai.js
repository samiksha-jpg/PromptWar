import express from 'express';
import db from '../db.js';
import { calculateDistanceKm } from '../utils/geo.js';
import { getApiKey, hasValidApiKey, getMaskedKeyPreview } from '../env.js';

const router = express.Router();

/**
 * Natural language intent parser
 */
function parseUserIntent(query = '') {
  const q = query.toLowerCase();

  // Budget detection
  let maxBudget = null;
  const budgetMatch = q.match(/(?:under|below|less than|within|budget of)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
                      q.match(/(?:₹|rs\.?|inr)\s*(\d+)/i);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1], 10);
  } else if (q.includes('free')) {
    maxBudget = 0;
  } else if (q.includes('cheap') || q.includes('budget') || q.includes('affordable')) {
    maxBudget = 250;
  }

  // Duration / Time
  let durationHours = null;
  const timeMatch = q.match(/(\d+|one|two|three|four|five)\s*(?:hour|hr|hours|hrs)/i);
  if (timeMatch) {
    const wordToNum = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    durationHours = parseInt(timeMatch[1], 10) || wordToNum[timeMatch[1].toLowerCase()] || 2;
  }

  // Categories & Interests
  const categories = [];
  if (q.includes('food') || q.includes('eat') || q.includes('cafe') || q.includes('snack') || q.includes('chai') || q.includes('dosa') || q.includes('dinner') || q.includes('lunch') || q.includes('breakfast')) {
    categories.push('food');
  }
  if (q.includes('history') || q.includes('historical') || q.includes('heritage') || q.includes('fort') || q.includes('palace') || q.includes('monument') || q.includes('peshwa') || q.includes('museum')) {
    categories.push('heritage');
  }
  if (q.includes('nature') || q.includes('park') || q.includes('garden') || q.includes('lake') || q.includes('green') || q.includes('hill') || q.includes('tekdi') || q.includes('trek')) {
    categories.push('nature');
  }
  if (q.includes('hidden') || q.includes('gem') || q.includes('tourists miss') || q.includes('secret') || q.includes('less-known') || q.includes('peaceful') || q.includes('quiet')) {
    categories.push('gem');
  }
  if (q.includes('culture') || q.includes('art') || q.includes('craft')) {
    categories.push('culture');
  }

  const requiresAccessibility = q.includes('accessible') || q.includes('wheelchair') || q.includes('ramp') || q.includes('elderly');
  const isWeatherRelated = q.includes('weather') || q.includes('rain') || q.includes('sunny') || q.includes('heat') || q.includes('hot');
  const isRouteOrHazard = q.includes('route') || q.includes('hazard') || q.includes('safe') || q.includes('road') || q.includes('pothole') || q.includes('waterlogging');

  return {
    query,
    maxBudget,
    durationHours,
    categories: categories.length > 0 ? categories : ['all'],
    requiresAccessibility,
    isWeatherRelated,
    isRouteOrHazard
  };
}

/**
 * Retrieve grounded context from database for RAG
 */
function retrieveGroundedPlaces(intent, userLat, userLng, city = 'Pune') {
  let query = 'SELECT * FROM places WHERE city = ?';
  const params = [city];

  if (intent.categories.length > 0 && !intent.categories.includes('all')) {
    const orClauses = [];
    for (const cat of intent.categories) {
      if (cat === 'heritage') {
        orClauses.push("(category = 'tourist_attraction' OR category = 'heritage' OR tags LIKE '%heritage%' OR tags LIKE '%history%' OR historical_context != '')");
      } else if (cat === 'nature' || cat === 'parks') {
        orClauses.push("(category = 'parks' OR category = 'nature' OR tags LIKE '%parks%' OR tags LIKE '%nature%')");
      } else if (cat === 'gem') {
        orClauses.push("(is_hidden_gem = 1 OR category = 'hidden_gem' OR tags LIKE '%hidden_gem%')");
      } else if (cat === 'food') {
        orClauses.push("(category = 'food' OR tags LIKE '%food%')");
      } else if (cat === 'hotel') {
        orClauses.push("(category = 'hotel' OR tags LIKE '%hotel%')");
      } else if (cat === 'shopping') {
        orClauses.push("(category = 'shopping' OR tags LIKE '%shopping%')");
      } else if (cat === 'services') {
        orClauses.push("(category = 'services' OR tags LIKE '%services%' OR tags LIKE '%transit%')");
      } else {
        orClauses.push("(category = ? OR tags LIKE ?)");
        params.push(cat, `%${cat}%`);
      }
    }
    if (orClauses.length > 0) {
      query += ` AND (${orClauses.join(' OR ')})`;
    }
  }

  if (intent.maxBudget !== null) {
    if (intent.maxBudget === 0) {
      query += " AND (estimated_cost LIKE '%Free%' OR price_level = 1)";
    } else if (intent.maxBudget <= 250) {
      query += ' AND price_level = 1';
    } else if (intent.maxBudget <= 600) {
      query += ' AND price_level <= 2';
    }
  }

  if (intent.requiresAccessibility) {
    query += ' AND accessibility_score >= 4';
  }

  query += ' ORDER BY rating DESC, review_count DESC LIMIT 8';

  let places = db.prepare(query).all(...params);

  // If strict filtering returned empty, fallback to top rated in city
  if (places.length === 0) {
    places = db.prepare('SELECT * FROM places WHERE city = ? ORDER BY rating DESC LIMIT 6').all(city);
  }

  return places.map(p => {
    let distanceKm = null;
    if (userLat && userLng) {
      distanceKm = Math.round(calculateDistanceKm(userLat, userLng, p.latitude, p.longitude) * 10) / 10;
    }
    const costMatch = (p.estimated_cost || '').match(/\d+/);
    const approxCostInr = costMatch ? parseInt(costMatch[0], 10) : (p.price_level ? p.price_level * 100 : 0);
    return {
      ...p,
      distanceKm,
      approxCostInr,
      tags: p.tags ? JSON.parse(p.tags) : []
    };
  });
}

/**
 * Call Gemini API with server-side logging without exposing API key
 */
async function callGeminiLLM(systemPrompt, userPrompt, apiKey) {
  const models = [
    'models/gemini-flash-lite-latest',
    'models/gemini-2.5-flash-lite',
    'models/gemini-flash-latest',
    'models/gemini-3.5-flash-lite',
    'models/gemini-3.5-flash',
    'models/gemini-pro-latest'
  ];
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Question:\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    };

    try {
      console.log(`[AI Gateway] Attempting model ${model} with key (${getMaskedKeyPreview()})...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[AI Gateway] Successfully generated response from ${model}.`);
          return text;
        }
      } else {
        const errorText = await response.text();
        console.warn(`[AI Gateway] Model ${model} returned HTTP ${response.status}: ${errorText.substring(0, 120)}`);
        lastError = new Error(`Gemini API error (${model}): ${response.status}`);
      }
    } catch (err) {
      console.error(`[AI Gateway] Network error with ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini models');
}

/**
 * Intelligent Local Decision Engine Fallback
 */
function generateLocalDecisionResponse(intent, places, activeHazards) {
  if (places.length === 0) {
    return {
      text: `I couldn't find verified places strictly matching all your criteria (budget: ${intent.maxBudget ? `₹${intent.maxBudget}` : 'any'}, categories: ${intent.categories.join(', ')}). Try asking for general hidden gems or popular food hubs in Pune!`,
      recommendedPlaces: [],
      suggestedQuestions: [
        "What are the best street food spots on FC Road?",
        "Show hidden gems that tourists miss in Pune",
        "Which places are wheelchair accessible?"
      ]
    };
  }

  const topPlaces = places.slice(0, 3);
  let answerIntro = '';

  if (intent.maxBudget !== null && intent.categories.includes('food')) {
    answerIntro = `Here are the top-rated culinary spots in Pune within your budget of ₹${intent.maxBudget}:`;
  } else if (intent.durationHours && intent.categories.includes('heritage')) {
    answerIntro = `Here is a curated ${intent.durationHours}-hour historical itinerary based on verified Pune heritage landmarks:`;
  } else if (intent.categories.includes('gem')) {
    answerIntro = `Here are tranquil, lesser-known spots in Pune that tourists typically miss:`;
  } else if (intent.requiresAccessibility) {
    answerIntro = `Here are accessible Pune locations verified for step-free mobility:`;
  } else {
    answerIntro = `Based on your request, here are the top verified recommendations in Pune:`;
  }

  const placeDetails = topPlaces.map((p, idx) => {
    const distText = p.distanceKm ? ` (${p.distanceKm} km away)` : '';
    return `${idx + 1}. **${p.name}** (${p.neighborhood})${distText}\n` +
           `   • **Why go:** ${p.description}\n` +
           `   • **Cost:** ${p.estimated_cost} | **Rating:** ${p.rating}★ (${p.review_count} reviews)\n` +
           `   • **Best Time:** ${p.best_time_to_visit || 'Morning or Evening'}\n` +
           (p.historical_context ? `   • **Context:** ${p.historical_context}\n` : '');
  }).join('\n');

  let civicNote = '';
  if (activeHazards.length > 0) {
    civicNote = `\n\n⚠️ **City Condition Note:** We detected ${activeHazards.length} reported civic issues in the area. Check the interactive map for details.`;
  }

  return {
    text: `${answerIntro}\n\n${placeDetails}${civicNote}`,
    recommendedPlaces: topPlaces.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      neighborhood: p.neighborhood,
      latitude: p.latitude,
      longitude: p.longitude,
      estimated_cost: p.estimated_cost,
      rating: p.rating,
      image_url: p.image_url
    })),
    suggestedQuestions: [
      "How do I reach the first place on the map?",
      "Are there cheaper food alternatives nearby?",
      "What is the best route with fewer reported hazards?"
    ]
  };
}

/**
 * POST /api/ai/assistant
 * Intelligent conversational decision assistant with RAG
 */
router.post('/assistant', async (req, res) => {
  try {
    const { userLat, userLng, city = 'Pune', history = [] } = req.body;
    const query = (req.body.query || req.body.message || '').trim();

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query or message is required.' });
    }

    const intent = parseUserIntent(query);

    const places = retrieveGroundedPlaces(
      intent,
      userLat ? parseFloat(userLat) : null,
      userLng ? parseFloat(userLng) : null,
      city
    );

    const activeHazards = db.prepare(
      "SELECT title, category, neighborhood, severity FROM reports WHERE city = ? AND status != 'resolved' LIMIT 5"
    ).all(city);

    // Read configured key dynamically
    const apiKey = getApiKey();
    const hasKey = hasValidApiKey();

    let aiEngine = 'CitySense Grounded Decision Engine';
    let responsePayload = null;

    if (hasKey) {
      try {
        const systemPrompt = `You are CitySense AI, a helpful, transparent smart city exploration assistant for ${city}.
CRITICAL RULES:
1. ONLY recommend places from the provided Grounded Database Places below. NEVER invent business names, fake prices, or false operating hours.
2. If the user asks about something not in the database, honestly explain that verified data is currently limited.
3. Keep answers concise, structured, friendly, and practical.
4. Mention estimated costs and neighborhoods.

GROUNDED DATABASE PLACES:
${JSON.stringify(places.map(p => ({
  name: p.name,
  category: p.category,
  neighborhood: p.neighborhood,
  rating: p.rating,
  cost: p.estimated_cost,
  hours: p.opening_hours,
  description: p.description,
  history: p.historical_context,
  accessibility_score: p.accessibility_score,
  is_hidden_gem: p.is_hidden_gem
})), null, 2)}

ACTIVE CIVIC HAZARDS IN CITY:
${JSON.stringify(activeHazards, null, 2)}`;

        const generatedText = await callGeminiLLM(systemPrompt, query, apiKey);
        aiEngine = 'Google Gemini 1.5/Flash AI (RAG Grounded)';
        responsePayload = {
          text: generatedText,
          recommendedPlaces: places.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            neighborhood: p.neighborhood,
            latitude: p.latitude,
            longitude: p.longitude,
            estimated_cost: p.estimated_cost,
            rating: p.rating,
            image_url: p.image_url
          })),
          suggestedQuestions: [
            "Show these places on the map",
            "What are the nearest bus/metro points?",
            "Are there any waterlogging alerts nearby?"
          ]
        };
      } catch (llmErr) {
        console.warn('[AI Assistant] Gemini call failed, using local decision engine:', llmErr.message);
        responsePayload = generateLocalDecisionResponse(intent, places, activeHazards);
        aiEngine = 'CitySense Grounded Decision Engine (Gemini Fallback)';
      }
    } else {
      console.log('[AI Assistant] No external AI key found. Using Grounded Decision Engine.');
      responsePayload = generateLocalDecisionResponse(intent, places, activeHazards);
    }

    res.json({
      success: true,
      aiEngine,
      isAiKeyConfigured: hasKey,
      maskedKeyPreview: getMaskedKeyPreview(),
      intent,
      ...responsePayload
    });
  } catch (error) {
    console.error('[AI Assistant Handler Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
