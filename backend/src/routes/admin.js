import express from 'express';
import * as eventsModel from '../models/events.js';
import * as checkpointsModel from '../models/checkpoints.js';
import * as teamsModel from '../models/teams.js';
import * as challengesModel from '../models/collaborativeChallenges.js';
import * as encountersModel from '../models/encounters.js';
import { formatError, formatSuccess, generateQRCode } from '../utils/helpers.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { generateBeautifulQR } from '../utils/qrGenerator.js';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/admin/login
 * Verify admin password
 */
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (password === process.env.ADMIN_PASSWORD) {
      res.json(formatSuccess({ authenticated: true }, 'Autenticación exitosa'));
    } else {
      res.status(401).json(formatError('Contraseña incorrecta', 401));
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json(formatError('Error en autenticación', 500));
  }
});

/**
 * GET /api/admin/events
 * Get all events with stats
 */
router.get('/events', authenticateAdmin, async (req, res) => {
  try {
    const events = await eventsModel.getAllEvents();
    res.json(formatSuccess(events));
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json(formatError('Error al obtener eventos', 500));
  }
});

/**
 * POST /api/admin/events
 * Create a new event
 */
router.post('/events', authenticateAdmin, async (req, res) => {
  try {
    const event = await eventsModel.createEvent(req.body);
    res.status(201).json(formatSuccess(event, 'Evento creado exitosamente'));
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json(formatError('Error al crear evento', 500));
  }
});

/**
 * PUT /api/admin/events/:id
 * Update an event
 */
router.put('/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await eventsModel.updateEvent(req.params.id, req.body);
    
    if (!event) {
      return res.status(404).json(formatError('Evento no encontrado', 404));
    }
    
    res.json(formatSuccess(event, 'Evento actualizado exitosamente'));
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json(formatError('Error al actualizar evento', 500));
  }
});

/**
 * DELETE /api/admin/events/:id
 * Delete an event
 */
router.delete('/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await eventsModel.deleteEvent(req.params.id);
    
    if (!event) {
      return res.status(404).json(formatError('Evento no encontrado', 404));
    }
    
    res.json(formatSuccess(null, 'Evento eliminado exitosamente'));
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json(formatError('Error al eliminar evento', 500));
  }
});

/**
 * GET /api/admin/checkpoints/:eventId
 * Get all checkpoints for an event
 */
router.get('/checkpoints/:eventId', authenticateAdmin, async (req, res) => {
  try {
    const checkpoints = await checkpointsModel.getCheckpointsByEvent(req.params.eventId);
    res.json(formatSuccess(checkpoints));
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    res.status(500).json(formatError('Error al obtener checkpoints', 500));
  }
});

/**
 * POST /api/admin/checkpoints
 * Create a new checkpoint
 */
router.post('/checkpoints', authenticateAdmin, async (req, res) => {
  try {
    const checkpoint = await checkpointsModel.createCheckpoint(req.body);
    res.status(201).json(formatSuccess(checkpoint, 'Checkpoint creado exitosamente'));
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    res.status(500).json(formatError('Error al crear checkpoint', 500));
  }
});

/**
 * PUT /api/admin/checkpoints/:id
 * Update a checkpoint
 */
router.put('/checkpoints/:id', authenticateAdmin, async (req, res) => {
  try {
    const checkpoint = await checkpointsModel.updateCheckpoint(req.params.id, req.body);
    
    if (!checkpoint) {
      return res.status(404).json(formatError('Checkpoint no encontrado', 404));
    }
    
    res.json(formatSuccess(checkpoint, 'Checkpoint actualizado exitosamente'));
  } catch (error) {
    console.error('Error updating checkpoint:', error);
    res.status(500).json(formatError('Error al actualizar checkpoint', 500));
  }
});

/**
 * DELETE /api/admin/checkpoints/:id
 * Delete a checkpoint
 */
router.delete('/checkpoints/:id', authenticateAdmin, async (req, res) => {
  try {
    const checkpoint = await checkpointsModel.deleteCheckpoint(req.params.id);
    
    if (!checkpoint) {
      return res.status(404).json(formatError('Checkpoint no encontrado', 404));
    }
    
    res.json(formatSuccess(null, 'Checkpoint eliminado exitosamente'));
  } catch (error) {
    console.error('Error deleting checkpoint:', error);
    res.status(500).json(formatError('Error al eliminar checkpoint', 500));
  }
});

/**
 * GET /api/admin/checkpoints/:id/qr
 * Get QR code image for a checkpoint
 */
router.get('/checkpoints/:id/qr', authenticateAdmin, async (req, res) => {
  try {
    const checkpoint = await checkpointsModel.getCheckpointById(req.params.id);
    
    if (!checkpoint) {
      return res.status(404).json(formatError('Checkpoint no encontrado', 404));
    }
    
    // Get event info for the QR design
    const event = await eventsModel.getEventById(checkpoint.event_id);
    
    if (!event) {
      return res.status(404).json(formatError('Evento no encontrado', 404));
    }
    
    // Generate beautiful QR code with event and checkpoint information
    const qrBuffer = await generateBeautifulQR(checkpoint, event);
    
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename="checkpoint-${checkpoint.order_num}-${checkpoint.name.toLowerCase().replace(/\s+/g, '-')}.png"`);
    res.send(qrBuffer);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json(formatError('Error al generar código QR', 500));
  }
});

/**
 * GET /api/admin/events/:id/export
 * Export event results as JSON
 */
router.get('/events/:id/export', authenticateAdmin, async (req, res) => {
  try {
    const event = await eventsModel.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json(formatError('Evento no encontrado', 404));
    }
    
    const teams = await teamsModel.getLeaderboard(req.params.id);
    const checkpoints = await checkpointsModel.getCheckpointsByEvent(req.params.id);
    const stats = await eventsModel.getEventStats(req.params.id);
    
    const exportData = {
      event,
      teams,
      checkpoints: checkpoints.map(cp => ({
        id: cp.id,
        name: cp.name,
        description: cp.description,
        points: cp.points,
        order_num: cp.order_num
      })),
      stats,
      exportedAt: new Date().toISOString()
    };
    
    res.json(formatSuccess(exportData));
    
  } catch (error) {
    console.error('Error exporting results:', error);
    res.status(500).json(formatError('Error al exportar resultados', 500));
  }
});

/**
 * GET /api/admin/challenges/:eventId
 * Get all collaborative challenges for an event
 */
router.get('/challenges/:eventId', authenticateAdmin, async (req, res) => {
  try {
    const challenges = await challengesModel.getAllChallenges(req.params.eventId);
    res.json(formatSuccess(challenges));
  } catch (error) {
    console.error('Error getting challenges:', error);
    res.status(500).json(formatError('Error al obtener desafíos', 500));
  }
});

/**
 * POST /api/admin/challenges
 * Create a new collaborative challenge
 */
router.post('/challenges', authenticateAdmin, async (req, res) => {
  try {
    const challenge = await challengesModel.createChallenge(req.body);
    res.status(201).json(formatSuccess(challenge, 'Desafío creado exitosamente'));
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json(formatError('Error al crear desafío', 500));
  }
});

/**
 * PUT /api/admin/challenges/:id
 * Update a collaborative challenge
 */
router.put('/challenges/:id', authenticateAdmin, async (req, res) => {
  try {
    const challenge = await challengesModel.updateChallenge(req.params.id, req.body);
    
    if (!challenge) {
      return res.status(404).json(formatError('Desafío no encontrado', 404));
    }
    
    res.json(formatSuccess(challenge, 'Desafío actualizado exitosamente'));
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json(formatError('Error al actualizar desafío', 500));
  }
});

/**
 * DELETE /api/admin/challenges/:id
 * Delete a collaborative challenge
 */
router.delete('/challenges/:id', authenticateAdmin, async (req, res) => {
  try {
    const challenge = await challengesModel.deleteChallenge(req.params.id);
    
    if (!challenge) {
      return res.status(404).json(formatError('Desafío no encontrado', 404));
    }
    
    res.json(formatSuccess(null, 'Desafío eliminado exitosamente'));
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json(formatError('Error al eliminar desafío', 500));
  }
});

/**
 * GET /api/admin/encounters/:eventId
 * Get all encounters for an event
 */
router.get('/encounters/:eventId', authenticateAdmin, async (req, res) => {
  try {
    const encounters = await encountersModel.getEventEncounters(req.params.eventId);
    res.json(formatSuccess(encounters));
  } catch (error) {
    console.error('Error getting encounters:', error);
    res.status(500).json(formatError('Error al obtener encuentros', 500));
  }
});

/**
 * GET /api/admin/encounters/:eventId/stats
 * Get encounter statistics for an event
 */
router.get('/encounters/:eventId/stats', authenticateAdmin, async (req, res) => {
  try {
    const encounters = await encountersModel.getEventEncounters(req.params.eventId);
    const teams = await teamsModel.getTeamsByEvent(req.params.eventId);
    
    const stats = {
      totalTeams: teams.length,
      totalEncounters: encounters.length,
      completedEncounters: encounters.filter(e => e.status === 'completed').length,
      failedEncounters: encounters.filter(e => e.status === 'failed').length,
      pendingEncounters: encounters.filter(e => e.status === 'pending').length,
      expiredEncounters: encounters.filter(e => e.status === 'expired').length,
      totalPointsAwarded: encounters.reduce((sum, e) => sum + (e.points_awarded || 0), 0)
    };
    
    res.json(formatSuccess(stats));
  } catch (error) {
    console.error('Error getting encounter stats:', error);
    res.status(500).json(formatError('Error al obtener estadísticas de encuentros', 500));
  }
});

export default router;
