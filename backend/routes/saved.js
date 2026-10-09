import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * GET /api/saved
 * List user bookmarked places
 */
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.id as saved_id, s.notes, s.created_at as saved_at, p.*
      FROM saved_places s
      JOIN places p ON s.place_id = p.id
      ORDER BY s.created_at DESC
    `).all();

    const formatted = rows.map(r => ({
      savedId: r.saved_id,
      notes: r.notes,
      savedAt: r.saved_at,
      place: {
        id: r.id,
        name: r.name,
        category: r.category,
        neighborhood: r.neighborhood,
        description: r.description,
        rating: r.rating,
        price_level: r.price_level,
        estimated_cost: r.estimated_cost,
        latitude: r.latitude,
        longitude: r.longitude,
        image_url: r.image_url,
        is_hidden_gem: r.is_hidden_gem,
        tags: r.tags ? JSON.parse(r.tags) : []
      }
    }));

    res.json({
      success: true,
      count: formatted.length,
      savedPlaces: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/saved
 * Save or toggle bookmark for a place
 */
router.post('/', (req, res) => {
  try {
    const { placeId, notes } = req.body;
    if (!placeId) {
      return res.status(400).json({ success: false, error: 'placeId is required' });
    }

    const place = db.prepare('SELECT id FROM places WHERE id = ?').get(placeId);
    if (!place) {
      return res.status(404).json({ success: false, error: 'Place not found' });
    }

    // Check if already saved
    const existing = db.prepare('SELECT id FROM saved_places WHERE place_id = ?').get(placeId);
    if (existing) {
      // Toggle off / remove
      db.prepare('DELETE FROM saved_places WHERE id = ?').run(existing.id);
      return res.json({
        success: true,
        action: 'removed',
        message: 'Place removed from saved favourites.'
      });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO saved_places (place_id, notes, created_at)
      VALUES (?, ?, ?)
    `).run(placeId, notes || '', now);

    res.status(201).json({
      success: true,
      action: 'saved',
      message: 'Place saved to favourites!',
      savedId: result.lastInsertRowid
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/saved/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM saved_places WHERE id = ? OR place_id = ?').run(req.params.id, req.params.id);
    res.json({
      success: true,
      changes: result.changes,
      message: 'Removed from saved places'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
