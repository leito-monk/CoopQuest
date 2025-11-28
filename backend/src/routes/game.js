import express from 'express';
import * as teamsModel from '../models/teams.js';
import * as checkpointsModel from '../models/checkpoints.js';
import { formatError, formatSuccess, checkAnswer } from '../utils/helpers.js';
import { authenticateTeam } from '../middleware/auth.js';
import { scanRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * GET /api/game/progress
 * Get team progress (authenticated)
 */
router.get('/progress', authenticateTeam, async (req, res) => {
  try {
    const progress = await teamsModel.getTeamProgress(req.team.teamId);
    const team = await teamsModel.getTeamById(req.team.teamId);
    
    res.json(formatSuccess({
      team: {
        id: team.id,
        name: team.name,
        score: team.score
      },
      checkpoints: progress
    }));
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json(formatError('Error al obtener progreso', 500));
  }
});

/**
 * POST /api/game/scan
 * Scan a QR code (authenticated, rate limited)
 */
router.post('/scan', authenticateTeam, scanRateLimiter, async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json(formatError('Código QR requerido', 400));
    }
    
    // Find checkpoint by QR code
    const checkpoint = await checkpointsModel.getCheckpointByQR(qrCode);
    
    if (!checkpoint) {
      return res.status(404).json(formatError('Código QR inválido', 404));
    }
    
    // Check if checkpoint belongs to team's event
    const team = await teamsModel.getTeamById(req.team.teamId);
    if (checkpoint.event_id !== team.event_id) {
      return res.status(400).json(formatError('Este código QR no pertenece a tu evento', 400));
    }
    
    // Get checkpoint status for this team
    const checkpointWithStatus = await checkpointsModel.getCheckpointWithTeamStatus(
      checkpoint.id,
      req.team.teamId
    );
    
    // Check if already completed or failed
    if (checkpointWithStatus.team_status === 'completed') {
      return res.status(400).json(formatError('Ya completaste este checkpoint', 400));
    }
    
    if (checkpointWithStatus.team_status === 'failed') {
      return res.status(400).json(formatError('Ya fallaste este checkpoint y no puedes reintentar', 400));
    }
    
    // Return checkpoint question (without answer)
    const { answer, ...checkpointData } = checkpoint;
    
    res.json(formatSuccess({
      checkpoint: checkpointData,
      message: 'Checkpoint encontrado. Responde la pregunta para ganar puntos.'
    }));
    
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json(formatError('Error al escanear código QR', 500));
  }
});

/**
 * POST /api/game/answer
 * Submit answer for a checkpoint (authenticated)
 */
router.post('/answer', authenticateTeam, async (req, res) => {
  try {
    const { checkpointId, answer } = req.body;
    
    if (!checkpointId || !answer) {
      return res.status(400).json(formatError('CheckpointId y respuesta son requeridos', 400));
    }
    
    // Get checkpoint
    const checkpoint = await checkpointsModel.getCheckpointById(checkpointId);
    
    if (!checkpoint) {
      return res.status(404).json(formatError('Checkpoint no encontrado', 404));
    }
    
    // Get checkpoint status for this team
    const checkpointWithStatus = await checkpointsModel.getCheckpointWithTeamStatus(
      checkpointId,
      req.team.teamId
    );
    
    // Check if already answered
    if (checkpointWithStatus.team_status !== 'pending') {
      return res.status(400).json(formatError('Ya respondiste este checkpoint', 400));
    }
    
    // Check answer
    const isCorrect = checkAnswer(answer, checkpoint.answer);
    
    // Record attempt
    const updatedTeam = await teamsModel.recordCheckpointAttempt(
      req.team.teamId,
      checkpointId,
      isCorrect
    );
    
    if (isCorrect) {
      res.json(formatSuccess({
        correct: true,
        points: checkpoint.points,
        newScore: updatedTeam.score,
        message: `¡Correcto! Ganaste ${checkpoint.points} puntos.`
      }));
    } else {
      res.json(formatSuccess({
        correct: false,
        message: 'Respuesta incorrecta. Este checkpoint se marca como fallido.',
        correctAnswer: checkpoint.answer
      }));
    }
    
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json(formatError('Error al enviar respuesta', 500));
  }
});

export default router;
