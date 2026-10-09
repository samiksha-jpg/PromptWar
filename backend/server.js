// Initialize environment configuration FIRST before any other imports
import './env.js';

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import db, { initDatabase } from './db.js';
import { hasValidApiKey, getMaskedKeyPreview } from './env.js';
import placesRouter from './routes/places.js';
import reportsRouter from './routes/reports.js';
import routesRouter from './routes/routes.js';
import pulseRouter from './routes/pulse.js';
import aiRouter from './routes/ai.js';
import itinerariesRouter from './routes/itineraries.js';
import savedRouter from './routes/saved.js';
import integrationsRouter from './routes/integrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database schema and seeds
initDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check and API configuration status
app.get('/api/health', (req, res) => {
  try {
    const placesCount = db.prepare('SELECT COUNT(*) as count FROM places').get().count;
    const reportsCount = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
    const itinerariesCount = db.prepare('SELECT COUNT(*) as count FROM itineraries').get().count;

    const isConfigured = hasValidApiKey();

    res.json({
      status: 'healthy',
      platform: 'CitySense AI Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        engine: 'SQLite (node:sqlite DatabaseSync)',
        placesCount,
        reportsCount,
        itinerariesCount
      },
      aiIntegration: {
        keyConfigured: isConfigured,
        geminiConfigured: isConfigured,
        maskedKeyPreview: getMaskedKeyPreview(),
        engine: isConfigured ? 'Google Gemini AI (RAG Grounded)' : 'CitySense Grounded Decision Engine (Zero-Key Active)'
      },
      externalAPIs: {
        weather: 'Open-Meteo Weather & AQI (Operational)',
        routing: 'OSRM OpenStreetMap Routing Engine'
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Mount Routes
app.use('/api/places', placesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/routes', routesRouter);
app.use('/api/pulse', pulseRouter);
app.use('/api/ai', aiRouter);
app.use('/api/itineraries', itinerariesRouter);
app.use('/api/saved', savedRouter);
app.use('/api/integrations', integrationsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 CitySense AI Backend running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 AI Key Status: ${hasValidApiKey() ? 'CONFIGURED (' + getMaskedKeyPreview() + ')' : 'NOT DETECTED'}`);
  console.log(`===============================================`);
});
