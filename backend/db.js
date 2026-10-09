import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'citysense.db');
const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode if applicable
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  console.log('[DB] Initializing SQLite database at:', DB_PATH);

  // 1. Places table
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Pune',
      category TEXT NOT NULL,
      subcategory TEXT,
      description TEXT NOT NULL,
      historical_context TEXT,
      address TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 120,
      price_level INTEGER DEFAULT 1,
      estimated_cost TEXT,
      opening_hours TEXT,
      accessibility_score INTEGER DEFAULT 4,
      cleanliness_score INTEGER DEFAULT 4,
      is_hidden_gem INTEGER DEFAULT 0,
      best_time_to_visit TEXT,
      tags TEXT,
      image_url TEXT,
      source TEXT DEFAULT 'Verified CitySense Curation',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Citizen Reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Pune',
      neighborhood TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      photo_url TEXT,
      status TEXT DEFAULT 'pending',
      corroborations_count INTEGER DEFAULT 1,
      reporter_name TEXT DEFAULT 'Citizen Contributor',
      is_ai_flagged_duplicate INTEGER DEFAULT 0,
      duplicate_of_id INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 3. Report Corroborations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS report_corroborations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      user_action TEXT NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `);

  // 4. Saved Places table
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );
  `);

  // 5. Itineraries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Pune',
      theme TEXT NOT NULL,
      estimated_duration TEXT NOT NULL,
      estimated_cost TEXT NOT NULL,
      places_json TEXT NOT NULL,
      is_curated INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  // Create indexes for fast geospatial and search queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
    CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
    CREATE INDEX IF NOT EXISTS idx_places_coords ON places(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_reports_city ON reports(city);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_coords ON reports(latitude, longitude);
  `);

  // Seed places if table is empty or has older count
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM places').get();
  if (countRow.cnt < 30) {
    db.exec('DELETE FROM places;');
    seedPlaces();
  }

  // Seed initial realistic citizen reports if table is empty
  const reportCount = db.prepare('SELECT COUNT(*) as cnt FROM reports').get();
  if (reportCount.cnt === 0) {
    seedReports();
  }

  // Seed curated itineraries if table is empty
  const itineraryCount = db.prepare('SELECT COUNT(*) as cnt FROM itineraries').get();
  if (itineraryCount.cnt === 0) {
    seedItineraries();
  }

  console.log('[DB] Database tables initialized and verified.');
}

function seedPlaces() {
  const seedFile = path.join(__dirname, 'seeds', 'pune_data.json');
  if (!fs.existsSync(seedFile)) {
    console.warn('[DB] Seed file not found at:', seedFile);
    return;
  }

  const places = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  const insertStmt = db.prepare(`
    INSERT INTO places (
      name, city, category, subcategory, description, historical_context,
      address, neighborhood, latitude, longitude, rating, review_count,
      price_level, estimated_cost, opening_hours, accessibility_score,
      cleanliness_score, is_hidden_gem, best_time_to_visit, tags, image_url, source
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  for (const p of places) {
    insertStmt.run(
      p.name,
      p.city || 'Pune',
      p.category,
      p.subcategory || '',
      p.description,
      p.historical_context || '',
      p.address,
      p.neighborhood,
      p.latitude,
      p.longitude,
      p.rating,
      p.review_count,
      p.price_level,
      p.estimated_cost,
      p.opening_hours,
      p.accessibility_score,
      p.cleanliness_score,
      p.is_hidden_gem,
      p.best_time_to_visit,
      JSON.stringify(p.tags || []),
      p.image_url,
      p.source
    );
  }
  console.log(`[DB] Successfully seeded ${places.length} places.`);
}

function seedReports() {
  const sampleReports = [
    {
      title: "Deep Pothole on JM Road near Sambhaji Park Gate",
      description: "Severe crater approx 1.5 feet wide in the middle lane causing two-wheelers to swerve dangerously into traffic.",
      category: "pothole",
      severity: "high",
      city: "Pune",
      neighborhood: "Shivaji Nagar",
      latitude: 18.5255,
      longitude: 73.8475,
      status: "verified",
      corroborations_count: 8,
      reporter_name: "Rohan D. (PMC Citizen Volunteer)",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      title: "Monsoon Waterlogging on Sangamwadi Bridge Underpass",
      description: "Accumulated storm water roughly 8 inches deep after early showers; slow moving traffic toward Yerwada.",
      category: "waterlogging",
      severity: "medium",
      city: "Pune",
      neighborhood: "Sangamwadi",
      latitude: 18.5392,
      longitude: 73.8710,
      status: "under_repair",
      corroborations_count: 12,
      reporter_name: "Priya M.",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      title: "Dark Stretch: 3 Broken Streetlights on North Main Road",
      description: "Streetlights not powering on between Lane 3 and Lane 4. Low visibility for pedestrians at night.",
      category: "broken_streetlight",
      severity: "medium",
      city: "Pune",
      neighborhood: "Koregaon Park",
      latitude: 18.5370,
      longitude: 73.8912,
      status: "verified",
      corroborations_count: 6,
      reporter_name: "Amit S.",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      title: "Broken Paver Blocks & Footpath Obstruction on FC Road",
      description: "Excavation debris left on pedestrian walkway near Goodluck Chowk; wheelchairs and strollers cannot pass.",
      category: "accessibility",
      severity: "high",
      city: "Pune",
      neighborhood: "Deccan",
      latitude: 18.5195,
      longitude: 73.8410,
      status: "pending",
      corroborations_count: 4,
      reporter_name: "Sneha K. (Accessibility Advocate)",
      created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 16).toISOString()
    },
    {
      title: "Fallen Tree Branch partially blocking Karve Road",
      description: "Large banyan branch snapped during gusty wind, partially blocking the left bus corridor.",
      category: "road_obstruction",
      severity: "medium",
      city: "Pune",
      neighborhood: "Kothrud",
      latitude: 18.5080,
      longitude: 73.8210,
      status: "resolved",
      corroborations_count: 14,
      reporter_name: "Municipal Garden Dept Update",
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 10).toISOString()
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO reports (
      title, description, category, severity, city, neighborhood,
      latitude, longitude, photo_url, status, corroborations_count,
      reporter_name, is_ai_flagged_duplicate, duplicate_of_id,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, 0, NULL,
      ?, ?
    )
  `);

  for (const r of sampleReports) {
    insertStmt.run(
      r.title,
      r.description,
      r.category,
      r.severity,
      r.city,
      r.neighborhood,
      r.latitude,
      r.longitude,
      null,
      r.status,
      r.corroborations_count,
      r.reporter_name,
      r.created_at,
      r.updated_at
    );
  }
  console.log(`[DB] Successfully seeded ${sampleReports.length} realistic citizen reports.`);
}

function seedItineraries() {
  const curated = [
    {
      title: "Old Pune Peshwa Heritage Trail",
      description: "Step back into the 18th-century Maratha heartland. Explore the majestic stone bastions of Shaniwar Wada, the 8th-century monolithic rock caves of Pataleshwar, and the bustling Gothic halls of Mandai.",
      theme: "heritage",
      estimated_duration: "3.5 hours",
      estimated_cost: "₹100 - ₹150",
      city: "Pune",
      places: [1, 2, 9, 7], // IDs in places table
      created_at: new Date().toISOString()
    },
    {
      title: "Student Food Crawl & Irani Cafes",
      description: "Taste Pune's legendary culinary nostalgia. From steaming Bun Maska and Irani Chai at Cafe Goodluck to crispy Mysore Masala Dosa & SPDP at Vaishali, and colonial cold coffee at Marz-O-Rin.",
      theme: "food",
      estimated_duration: "3 hours",
      estimated_cost: "₹250 - ₹400",
      city: "Pune",
      places: [4, 14, 10],
      created_at: new Date().toISOString()
    },
    {
      title: "Green Hilltops & Zen Sanctuaries",
      description: "Escape the city buzz into tranquil nature reserves. Watch sunrise over Pune from the highest crest of Vetal Tekdi, wander through the Japanese bamboo brook at Osho Teerth Park, and stroll Saras Baug.",
      theme: "nature",
      estimated_duration: "4 hours",
      estimated_cost: "₹20 - ₹50 (Mostly Free)",
      city: "Pune",
      places: [5, 6, 11],
      created_at: new Date().toISOString()
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO itineraries (
      title, description, city, theme, estimated_duration,
      estimated_cost, places_json, is_curated, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  for (const it of curated) {
    insertStmt.run(
      it.title,
      it.description,
      it.city,
      it.theme,
      it.estimated_duration,
      it.estimated_cost,
      JSON.stringify(it.places),
      it.created_at
    );
  }
  console.log(`[DB] Seeded ${curated.length} curated itineraries.`);
}

export default db;
