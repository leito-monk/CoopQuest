import express from 'express';
import * as eventsModel from '../models/events.js';
import * as checkpointsModel from '../models/checkpoints.js';
import * as teamsModel from '../models/teams.js';
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

export default router;
