import express from 'express';
import * as checkpointsModel from '../models/checkpoints.js';
import { formatError, formatSuccess } from '../utils/helpers.js';
import { authenticateTeam } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/checkpoints/:eventId
 * Get all checkpoints for an event
 */
router.get('/:eventId', async (req, res) => {
  try {
    const checkpoints = await checkpointsModel.getCheckpointsByEvent(req.params.eventId);
    
    // Don't send answers to clients
    const sanitized = checkpoints.map(cp => ({
      id: cp.id,
      event_id: cp.event_id,
      name: cp.name,
      description: cp.description,
      points: cp.points,
      order_num: cp.order_num,
      created_at: cp.created_at
    }));
    
    res.json(formatSuccess(sanitized));
  } catch (error) {
    console.error('Error fetching checkpoints:', error);
    res.status(500).json(formatError('Error al obtener checkpoints', 500));
  }
});

/**
 * GET /api/checkpoints/detail/:id
 * Get checkpoint by ID (authenticated)
 */
router.get('/detail/:id', authenticateTeam, async (req, res) => {
  try {
    const checkpoint = await checkpointsModel.getCheckpointWithTeamStatus(
      req.params.id,
      req.team.teamId
    );
    
    if (!checkpoint) {
      return res.status(404).json(formatError('Checkpoint no encontrado', 404));
    }
    
    // Don't send answer
    const { answer, ...sanitized } = checkpoint;
    
    res.json(formatSuccess(sanitized));
  } catch (error) {
    console.error('Error fetching checkpoint:', error);
    res.status(500).json(formatError('Error al obtener checkpoint', 500));
  }
});

export default router;
