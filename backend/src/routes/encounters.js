import express from 'express';
import * as encountersModel from '../models/encounters.js';
import * as teamsModel from '../models/teams.js';
import * as challengesModel from '../models/collaborativeChallenges.js';
import { formatError, formatSuccess, isPersonalQRCode } from '../utils/helpers.js';
import { authenticateTeam } from '../middleware/auth.js';
import { scanRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Store WebSocket broadcast function (will be set from index.js)
let broadcastToEvent = null;

export function setBroadcastFunction(fn) {
  broadcastToEvent = fn;
}

/**
 * GET /api/encounters/teams/online
 * Get online teams for an event (authenticated)
 */
router.get('/teams/online', authenticateTeam, async (req, res) => {
  try {
    const teams = await teamsModel.getOnlineTeams(req.team.eventId);
    
    // Filter out the requesting team
    const otherTeams = teams.filter(t => t.id !== req.team.teamId);
    
    res.json(formatSuccess(otherTeams));
  } catch (error) {
    console.error('Error getting online teams:', error);
    res.status(500).json(formatError('Error al obtener equipos', 500));
  }
});

/**
 * GET /api/encounters/pending
 * Get pending encounters for a team (teams not yet scanned)
 */
router.get('/pending', authenticateTeam, async (req, res) => {
  try {
    const unencounteredTeams = await encountersModel.getUnencounteredTeams(
      req.team.teamId,
      req.team.eventId
    );
    
    const stats = await encountersModel.getTeamEncounterStats(
      req.team.teamId,
      req.team.eventId
    );
    
    res.json(formatSuccess({
      pendingTeams: unencounteredTeams,
      stats
    }));
  } catch (error) {
    console.error('Error getting pending encounters:', error);
    res.status(500).json(formatError('Error al obtener encuentros pendientes', 500));
  }
});

/**
 * GET /api/encounters/history
 * Get encounter history for a team
 */
router.get('/history', authenticateTeam, async (req, res) => {
  try {
    const encounters = await encountersModel.getTeamEncounters(
      req.team.teamId,
      req.team.eventId
    );
    
    res.json(formatSuccess(encounters));
  } catch (error) {
    console.error('Error getting encounter history:', error);
    res.status(500).json(formatError('Error al obtener historial de encuentros', 500));
  }
});

/**
 * GET /api/encounters/active
 * Get active (pending) encounter for a team
 */
router.get('/active', authenticateTeam, async (req, res) => {
  try {
    const encounter = await encountersModel.getActiveEncounter(req.team.teamId);
    
    if (!encounter) {
      return res.json(formatSuccess(null, 'No hay encuentro activo'));
    }
    
    // Calculate time remaining
    const startedAt = new Date(encounter.started_at);
    const timeLimit = encounter.time_limit_seconds || 120;
    const elapsed = (Date.now() - startedAt.getTime()) / 1000;
    const timeRemaining = Math.max(0, timeLimit - elapsed);
    
    // Determine if this team has already answered
    const isScanner = encounter.scanner_team_id === req.team.teamId;
    const hasAnswered = isScanner ? !!encounter.scanner_answer : !!encounter.scanned_answer;
    const otherHasAnswered = isScanner ? !!encounter.scanned_answer : !!encounter.scanner_answer;
    
    res.json(formatSuccess({
      ...encounter,
      timeRemaining: Math.round(timeRemaining),
      isScanner,
      hasAnswered,
      otherHasAnswered
    }));
  } catch (error) {
    console.error('Error getting active encounter:', error);
    res.status(500).json(formatError('Error al obtener encuentro activo', 500));
  }
});

/**
 * POST /api/encounters/scan
 * Scan a team's personal QR code to initiate an encounter
 */
router.post('/scan', authenticateTeam, scanRateLimiter, async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json(formatError('Código QR requerido', 400));
    }
    
    // Verify it's a personal QR code
    if (!isPersonalQRCode(qrCode)) {
      return res.status(400).json(formatError('Este no es un QR de participante', 400));
    }
    
    // Find the scanned team
    const scannedTeam = await teamsModel.getTeamByPersonalQR(qrCode);
    
    if (!scannedTeam) {
      return res.status(404).json(formatError('Equipo no encontrado', 404));
    }
    
    // Check if same event
    if (scannedTeam.event_id !== req.team.eventId) {
      return res.status(400).json(formatError('Este equipo no pertenece a tu evento', 400));
    }
    
    // Check if scanning self
    if (scannedTeam.id === req.team.teamId) {
      return res.status(400).json(formatError('No puedes escanear tu propio QR', 400));
    }
    
    // Check if encounter already exists
    const exists = await encountersModel.encounterExists(
      req.team.eventId,
      req.team.teamId,
      scannedTeam.id
    );
    
    if (exists) {
      return res.status(400).json(formatError('Ya escaneaste a este equipo anteriormente', 400));
    }
    
    // Check if team has an active pending encounter
    const activeEncounter = await encountersModel.getActiveEncounter(req.team.teamId);
    if (activeEncounter) {
      return res.status(400).json(formatError('Ya tienes un encuentro en curso. Complétalo primero.', 400));
    }
    
    // Get a random challenge
    const challenge = await challengesModel.getRandomChallenge(req.team.eventId);
    
    if (!challenge) {
      return res.status(500).json(formatError('No hay desafíos disponibles', 500));
    }
    
    // Create the encounter
    const encounter = await encountersModel.createEncounter(
      req.team.eventId,
      req.team.teamId,
      scannedTeam.id,
      challenge.id
    );
    
    // Get full encounter details
    const fullEncounter = await encountersModel.getEncounterById(encounter.id);
    
    // Broadcast to both teams via WebSocket
    if (broadcastToEvent) {
      broadcastToEvent(req.team.eventId, {
        type: 'encounter:started',
        encounterId: encounter.id,
        scannerTeamId: req.team.teamId,
        scannerTeamName: req.team.teamName,
        scannedTeamId: scannedTeam.id,
        scannedTeamName: scannedTeam.name,
        challenge: {
          question: challenge.question,
          hint: challenge.answer_hint,
          type: challenge.challenge_type,
          timeLimit: challenge.time_limit_seconds,
          requiresExactMatch: challenge.requires_exact_match
        }
      });
    }
    
    res.json(formatSuccess({
      encounter: fullEncounter,
      scannedTeam: {
        id: scannedTeam.id,
        name: scannedTeam.name
      },
      message: '¡Encuentro iniciado!'
    }));
    
  } catch (error) {
    console.error('Error scanning team QR:', error);
    res.status(500).json(formatError('Error al escanear código QR', 500));
  }
});

/**
 * POST /api/encounters/:id/answer
 * Submit answer for an encounter
 */
router.post('/:id/answer', authenticateTeam, async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    
    if (!answer || answer.trim().length === 0) {
      return res.status(400).json(formatError('Respuesta requerida', 400));
    }
    
    // Get encounter
    const encounter = await encountersModel.getEncounterById(id);
    
    if (!encounter) {
      return res.status(404).json(formatError('Encuentro no encontrado', 404));
    }
    
    // Check if team is part of this encounter
    if (encounter.scanner_team_id !== req.team.teamId && encounter.scanned_team_id !== req.team.teamId) {
      return res.status(403).json(formatError('No eres parte de este encuentro', 403));
    }
    
    // Check if encounter is still pending
    if (encounter.status !== 'pending') {
      return res.status(400).json(formatError('Este encuentro ya terminó', 400));
    }
    
    // Check if already answered
    const isScanner = encounter.scanner_team_id === req.team.teamId;
    if ((isScanner && encounter.scanner_answer) || (!isScanner && encounter.scanned_answer)) {
      return res.status(400).json(formatError('Ya enviaste tu respuesta', 400));
    }
    
    // Submit answer
    await encountersModel.submitEncounterAnswer(id, req.team.teamId, answer.trim());
    
    // Notify other team that this team answered
    if (broadcastToEvent) {
      broadcastToEvent(req.team.eventId, {
        type: 'encounter:answered',
        encounterId: id,
        teamId: req.team.teamId,
        teamName: req.team.teamName
      });
    }
    
    // Try to complete the encounter
    const result = await encountersModel.completeEncounter(id);
    
    if (result.completed) {
      // Encounter is complete - broadcast result
      if (broadcastToEvent) {
        broadcastToEvent(req.team.eventId, {
          type: 'encounter:completed',
          encounterId: id,
          success: result.success,
          points: result.points,
          scannerTeamId: result.encounter.scanner_team_id,
          scannedTeamId: result.encounter.scanned_team_id
        });
      }
      
      res.json(formatSuccess({
        completed: true,
        success: result.success,
        points: result.points,
        message: result.success 
          ? `¡Encuentro exitoso! Ambos equipos ganan ${result.points} puntos.`
          : 'Las respuestas no coincidieron. ¡Mejor suerte la próxima!'
      }));
    } else {
      res.json(formatSuccess({
        completed: false,
        message: 'Respuesta enviada. Esperando al otro equipo...'
      }));
    }
    
  } catch (error) {
    console.error('Error submitting encounter answer:', error);
    res.status(500).json(formatError('Error al enviar respuesta', 500));
  }
});

/**
 * GET /api/encounters/:id
 * Get encounter status
 */
router.get('/:id', authenticateTeam, async (req, res) => {
  try {
    const encounter = await encountersModel.getEncounterById(req.params.id);
    
    if (!encounter) {
      return res.status(404).json(formatError('Encuentro no encontrado', 404));
    }
    
    // Check if team is part of this encounter
    if (encounter.scanner_team_id !== req.team.teamId && encounter.scanned_team_id !== req.team.teamId) {
      return res.status(403).json(formatError('No eres parte de este encuentro', 403));
    }
    
    // Calculate time remaining
    const startedAt = new Date(encounter.started_at);
    const timeLimit = encounter.time_limit_seconds || 120;
    const elapsed = (Date.now() - startedAt.getTime()) / 1000;
    const timeRemaining = Math.max(0, timeLimit - elapsed);
    
    // Determine answer status
    const isScanner = encounter.scanner_team_id === req.team.teamId;
    const hasAnswered = isScanner ? !!encounter.scanner_answer : !!encounter.scanned_answer;
    const otherHasAnswered = isScanner ? !!encounter.scanned_answer : !!encounter.scanner_answer;
    
    res.json(formatSuccess({
      ...encounter,
      timeRemaining: Math.round(timeRemaining),
      isScanner,
      hasAnswered,
      otherHasAnswered
    }));
    
  } catch (error) {
    console.error('Error getting encounter:', error);
    res.status(500).json(formatError('Error al obtener encuentro', 500));
  }
});

/**
 * GET /api/encounters/qr/:teamId
 * Get personal QR code for a team
 */
router.get('/qr/:teamId', authenticateTeam, async (req, res) => {
  try {
    // Only allow getting own QR or if same event
    const team = await teamsModel.getTeamById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json(formatError('Equipo no encontrado', 404));
    }
    
    if (team.event_id !== req.team.eventId) {
      return res.status(403).json(formatError('No tienes acceso a este equipo', 403));
    }
    
    res.json(formatSuccess({
      teamId: team.id,
      teamName: team.name,
      personalQRCode: team.personal_qr_code
    }));
    
  } catch (error) {
    console.error('Error getting team QR:', error);
    res.status(500).json(formatError('Error al obtener QR', 500));
  }
});

export default router;
