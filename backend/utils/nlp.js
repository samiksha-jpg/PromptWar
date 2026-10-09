/**
 * NLP and Text Intelligence Utilities for CitySense AI
 */
import { calculateDistanceMeters } from './geo.js';

// Category keyword mappings for auto-categorization
const CATEGORY_KEYWORDS = {
  pothole: [
    'pothole', 'pot hole', 'hole in road', 'crater', 'broken road', 'tarmac crater',
    'asphalt crater', 'bumpy road', 'road ditch', 'uneven surface', 'cracked road'
  ],
  waterlogging: [
    'waterlogging', 'water logging', 'flooding', 'flooded', 'stagnant water',
    'drainage block', 'water puddle', 'gutter overflow', 'sewage leak', 'monsoon flood',
    'waterlogged', 'water accumulation'
  ],
  broken_streetlight: [
    'streetlight', 'street light', 'dark road', 'no light', 'lamp post broken',
    'blinking light', 'broken lamp', 'dark alley', 'no lighting', 'wire hanging', 'blackout'
  ],
  garbage: [
    'garbage', 'trash', 'debris', 'waste dump', 'overflowing bin', 'litter',
    'rubbish', 'plastic waste', 'foul smell', 'dumping ground', 'uncollected garbage'
  ],
  road_obstruction: [
    'road block', 'tree fallen', 'construction debris', 'barricade', 'fallen branch',
    'illegal parking', 'encroachment', 'digging work', 'blocked lane', 'cement block'
  ],
  accessibility: [
    'wheelchair', 'broken footpath', 'no ramp', 'sidewalk broken', 'high curb',
    'blocked walkway', 'blind tactile missing', 'footpath encroachment', 'pedestrian hazard'
  ]
};

/**
 * Predict category from report text using keyword density & semantics
 */
export function predictReportCategory(title = '', description = '') {
  const combined = `${title} ${description}`.toLowerCase();
  let bestCategory = 'road_obstruction';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let count = 0;
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        count += 1;
      }
    }
    if (count > maxMatches) {
      maxMatches = count;
      bestCategory = category;
    }
  }

  return {
    category: maxMatches > 0 ? bestCategory : 'pothole',
    confidence: maxMatches > 0 ? Math.min(0.95, 0.5 + maxMatches * 0.15) : 0.4
  };
}

/**
 * Tokenize string into meaningful lowercase words, removing common stop words
 */
function tokenize(text) {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'in', 'at', 'of', 'on', 'and', 'or', 'for', 'to', 'near',
    'there', 'this', 'that', 'with', 'by', 'it', 'from', 'be', 'very', 'here', 'please'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Jaccard token similarity between two strings (0.0 to 1.0)
 */
export function calculateTokenSimilarity(str1, str2) {
  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokens1, ...tokens2]).size;
  return intersectionCount / unionCount;
}

/**
 * Check if a new report is likely a duplicate of an existing active report
 * Criteria: Proximity < 200m, Same or similar category, AND text similarity > 0.35
 */
export function detectDuplicateReport(newReport, existingReports) {
  const DUPLICATE_DISTANCE_THRESHOLD_METERS = 200;
  const TEXT_SIMILARITY_THRESHOLD = 0.30;

  for (const existing of existingReports) {
    // Only compare against active/pending/verified reports
    if (existing.status === 'resolved' || existing.status === 'rejected') continue;

    const distanceMeters = calculateDistanceMeters(
      newReport.latitude,
      newReport.longitude,
      existing.latitude,
      existing.longitude
    );

    if (distanceMeters <= DUPLICATE_DISTANCE_THRESHOLD_METERS) {
      const sameCategory = newReport.category === existing.category;
      const titleSim = calculateTokenSimilarity(newReport.title, existing.title);
      const descSim = calculateTokenSimilarity(newReport.description, existing.description);
      const overallTextSim = Math.max(titleSim, descSim, (titleSim + descSim) / 2);

      if (sameCategory || overallTextSim >= TEXT_SIMILARITY_THRESHOLD) {
        return {
          isDuplicate: true,
          matchedReport: existing,
          distanceMeters: Math.round(distanceMeters),
          textSimilarity: Math.round(overallTextSim * 100) / 100,
          reason: `Potential duplicate of #${existing.id} ("${existing.title}") located ${Math.round(distanceMeters)}m away.`
        };
      }
    }
  }

  return { isDuplicate: false, matchedReport: null };
}

/**
 * Check for toxic / abusive spam text
 */
export function validateReportContent(text) {
  const forbiddenPatterns = [
    /\b(buy now|casino|viagra|free crypto|click here to win)\b/i
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, reason: 'Report contains promotional spam patterns.' };
    }
  }
  return { isValid: true };
}

/**
 * Transparent City Match Score formula
 * Scores a place from 0 to 100 based on user configured weights:
 * - affordability: weight (0-100)
 * - safety: weight (0-100)
 * - accessibility: weight (0-100)
 * - cleanliness: weight (0-100)
 * - rating: weight (0-100)
 */
export function calculateCityMatchScore(place, userWeights = {}, nearbyHazardsCount = 0) {
  const weights = {
    affordability: userWeights.affordability ?? 50,
    safety: userWeights.safety ?? 70,
    accessibility: userWeights.accessibility ?? 60,
    cleanliness: userWeights.cleanliness ?? 60,
    rating: userWeights.rating ?? 80
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;

  // Normalized factor sub-scores (0 to 100)
  // Affordability: price_level 1 => 95, 2 => 70, 3 => 45, 4 => 20
  const affordabilityScore = place.price_level === 1 ? 95 : place.price_level === 2 ? 70 : 45;

  // Rating: 5.0 => 100, 4.0 => 80
  const ratingScore = Math.min(100, Math.round((place.rating / 5.0) * 100));

  // Accessibility: 1-5 => 20-100
  const accessibilityScore = (place.accessibility_score || 3) * 20;

  // Cleanliness: 1-5 => 20-100
  const cleanlinessScore = (place.cleanliness_score || 4) * 20;

  // Safety / Civic health: penalized if nearby unresolved hazards exist
  const hazardPenalty = Math.min(40, nearbyHazardsCount * 12);
  const safetyScore = Math.max(20, 95 - hazardPenalty);

  const weightedTotal =
    (affordabilityScore * weights.affordability +
     ratingScore * weights.rating +
     accessibilityScore * weights.accessibility +
     cleanlinessScore * weights.cleanliness +
     safetyScore * weights.safety) / totalWeight;

  const finalScore = Math.round(weightedTotal);

  return {
    score: finalScore,
    breakdown: {
      affordability: { score: affordabilityScore, weight: weights.affordability },
      rating: { score: ratingScore, weight: weights.rating },
      accessibility: { score: accessibilityScore, weight: weights.accessibility },
      cleanliness: { score: cleanlinessScore, weight: weights.cleanliness },
      safety: { score: safetyScore, weight: weights.safety, nearbyHazardsCount }
    },
    reasoning: generateMatchScoreExplanation(place, finalScore, {
      affordabilityScore,
      ratingScore,
      accessibilityScore,
      cleanlinessScore,
      safetyScore,
      nearbyHazardsCount
    })
  };
}

function generateMatchScoreExplanation(place, score, details) {
  const highlights = [];
  if (details.ratingScore >= 90) highlights.push(`exceptional visitor rating (${place.rating}★)`);
  if (details.affordabilityScore >= 90) highlights.push(`high affordability (${place.estimated_cost})`);
  if (details.accessibilityScore >= 80) highlights.push(`step-free accessibility`);
  if (details.cleanlinessScore >= 80) highlights.push(`well-maintained surroundings`);
  if (details.nearbyHazardsCount > 0) {
    highlights.push(`caution: ${details.nearbyHazardsCount} active civic issues reported nearby`);
  }

  return `Score of ${score}/100 driven by ${highlights.join(', ')}.`;
}
