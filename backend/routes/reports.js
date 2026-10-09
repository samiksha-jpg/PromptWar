import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import db from '../db.js';
import { predictReportCategory, detectDuplicateReport, validateReportContent } from '../utils/nlp.js';

const router = express.Router();

// Multer storage for report photo uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `report_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

/**
 * GET /api/reports
 * Fetch reports with filters
 */
router.get('/', (req, res) => {
  try {
    const { category, status, severity, city = 'Pune', limit = 50 } = req.query;

    let query = 'SELECT * FROM reports WHERE city = ?';
    const params = [city];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (severity && severity !== 'all') {
      query += ' AND severity = ?';
      params.push(severity);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const reports = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('[Reports GET Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reports/check-duplicate
 * Real-time pre-submission check for duplicates
 */
router.post('/check-duplicate', (req, res) => {
  try {
    const { title, description, category, latitude, longitude, city = 'Pune' } = req.body;

    if (!latitude || !longitude) {
      return res.json({ success: true, isDuplicate: false });
    }

    const activeReports = db.prepare(
      "SELECT * FROM reports WHERE city = ? AND status != 'resolved' AND status != 'rejected'"
    ).all(city);

    const dupResult = detectDuplicateReport({
      title: title || '',
      description: description || '',
      category: category || '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }, activeReports);

    res.json({
      success: true,
      ...dupResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reports/predict-category
 * AI NLP suggestion for report category based on text
 */
router.post('/predict-category', (req, res) => {
  try {
    const { title, description } = req.body;
    const prediction = predictReportCategory(title, description);
    res.json({ success: true, ...prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reports
 * Create a new citizen civic report
 */
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const {
      title,
      description,
      category: userCategory,
      severity = 'medium',
      city = 'Pune',
      neighborhood,
      latitude,
      longitude,
      reporter_name = 'Citizen Contributor',
      force_submit = false
    } = req.body;

    // Validate inputs
    if (!title || !description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, latitude, and longitude are required.'
      });
    }

    // Content moderation
    const textValid = validateReportContent(`${title} ${description}`);
    if (!textValid.isValid) {
      return res.status(400).json({ success: false, error: textValid.reason });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // AI Category classification if not specified or to validate
    const aiPrediction = predictReportCategory(title, description);
    const finalCategory = userCategory && userCategory !== 'auto' ? userCategory : aiPrediction.category;

    // Duplicate detection
    const activeReports = db.prepare(
      "SELECT * FROM reports WHERE city = ? AND status != 'resolved' AND status != 'rejected'"
    ).all(city);

    const dupCheck = detectDuplicateReport({
      title,
      description,
      category: finalCategory,
      latitude: lat,
      longitude: lon
    }, activeReports);

    // If duplicate found and user didn't force_submit, return duplicate warning
    if (dupCheck.isDuplicate && !force_submit) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: 'A similar issue was already reported nearby.',
        duplicateInfo: dupCheck
      });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO reports (
        title, description, category, severity, city, neighborhood,
        latitude, longitude, photo_url, status, corroborations_count,
        reporter_name, is_ai_flagged_duplicate, duplicate_of_id,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, 'pending', 1,
        ?, ?, ?,
        ?, ?
      )
    `);

    const result = insertStmt.run(
      title.trim(),
      description.trim(),
      finalCategory,
      severity,
      city,
      neighborhood || 'Pune Central',
      lat,
      lon,
      photoUrl,
      reporter_name.trim() || 'Citizen Contributor',
      dupCheck.isDuplicate ? 1 : 0,
      dupCheck.isDuplicate ? dupCheck.matchedReport.id : null,
      now,
      now
    );

    const createdReport = db.prepare('SELECT * FROM reports WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Citizen report submitted successfully for review.',
      report: createdReport,
      aiCategorized: !userCategory || userCategory === 'auto',
      predictedCategory: aiPrediction.category
    });
  } catch (error) {
    console.error('[Reports POST Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reports/:id/corroborate
 * Citizen verification: "Still an issue" or "Mark as resolved"
 */
router.post('/:id/corroborate', (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const { action = 'still_there', comment } = req.body;

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const now = new Date().toISOString();

    // Insert corroboration log
    db.prepare(`
      INSERT INTO report_corroborations (report_id, user_action, comment, created_at)
      VALUES (?, ?, ?, ?)
    `).run(reportId, action, comment || '', now);

    // Update report
    let newStatus = report.status;
    let newCount = report.corroborations_count + 1;

    if (action === 'resolved' && newCount >= 5) {
      newStatus = 'resolved';
    } else if (action === 'still_there' && report.status === 'pending' && newCount >= 3) {
      newStatus = 'verified';
    }

    db.prepare(`
      UPDATE reports
      SET corroborations_count = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(newCount, newStatus, now, reportId);

    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);

    res.json({
      success: true,
      message: action === 'resolved' ? 'Thank you! Marked resolved vote recorded.' : 'Thank you! Issue corroboration recorded.',
      report: updated
    });
  } catch (error) {
    console.error('[Corroborate Error]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Moderation / authority status change: verified, under_repair, resolved, rejected
 */
router.patch('/:id/status', (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'verified', 'under_repair', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE reports
      SET status = ?, updated_at = ?
      WHERE id = ?
    `).run(status, now, reportId);

    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      report: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
