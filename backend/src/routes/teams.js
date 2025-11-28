import express from 'express';
import * as teamsModel from '../models/teams.js';
import * as eventsModel from '../models/events.js';
import { formatError, formatSuccess, validateTeamName } from '../utils/helpers.js';
import { generateToken } from '../middleware/auth.js';
import { registrationRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/teams/register
 * Register a new team
 */
router.post('/register', registrationRateLimiter, async (req, res) => {
  try {
    const { eventId, teamName } = req.body;
    
    if (!eventId || !teamName) {
      return res.status(400).json(formatError('EventId y nombre del equipo son requeridos', 400));
    }
    
    // Validate team name
    const validation = validateTeamName(teamName);
    if (!validation.valid) {
      return res.status(400).json(formatError(validation.errors.join(', '), 400));
    }
    
    // Check if event exists and is active
    const event = await eventsModel.getEventById(eventId);
    if (!event) {
      return res.status(404).json(formatError('Evento no encontrado', 404));
    }
    
    if (event.status !== 'active') {
      return res.status(400).json(formatError('El evento no está activo', 400));
    }
    
    // Create team
    try {
      const team = await teamsModel.createTeam(eventId, teamName.trim());
      
      // Generate JWT token
      const token = generateToken(team);
      
      res.status(201).json(formatSuccess({
        team: {
          id: team.id,
          name: team.name,
          score: team.score,
          eventId: team.event_id
        },
        token
      }, 'Equipo registrado exitosamente'));
      
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json(formatError('Ya existe un equipo con ese nombre en este evento', 409));
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error registering team:', error);
    res.status(500).json(formatError('Error al registrar equipo', 500));
  }
});

/**
 * GET /api/teams/leaderboard/:eventId
 * Get leaderboard for an event
 */
router.get('/leaderboard/:eventId', async (req, res) => {
  try {
    const leaderboard = await teamsModel.getLeaderboard(req.params.eventId);
    res.json(formatSuccess(leaderboard));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json(formatError('Error al obtener clasificación', 500));
  }
});

export default router;
