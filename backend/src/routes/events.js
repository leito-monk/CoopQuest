import express from 'express';
import * as eventsModel from '../models/events.js';
import { formatError, formatSuccess } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/events
 * Get all events
 */
router.get('/', async (req, res) => {
  try {
    const events = await eventsModel.getAllEvents();
    res.json(formatSuccess(events));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json(formatError('Error al obtener eventos', 500));
  }
});

/**
 * GET /api/events/active
 * Get active events
 */
router.get('/active', async (req, res) => {
  try {
    const events = await eventsModel.getActiveEvents();
    res.json(formatSuccess(events));
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json(formatError('Error al obtener eventos activos', 500));
  }
});

/**
 * GET /api/events/:id
 * Get event by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await eventsModel.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json(formatError('Evento no encontrado', 404));
    }
    
    res.json(formatSuccess(event));
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json(formatError('Error al obtener evento', 500));
  }
});

/**
 * GET /api/events/:id/stats
 * Get event statistics
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await eventsModel.getEventStats(req.params.id);
    res.json(formatSuccess(stats));
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json(formatError('Error al obtener estadísticas', 500));
  }
});

export default router;
