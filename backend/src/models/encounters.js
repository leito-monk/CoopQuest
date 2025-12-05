import { query, transaction } from '../database/db.js';

/**
 * Get encounter by ID
 */
export async function getEncounterById(id) {
  const result = await query(
    `SELECT te.*, 
            scanner.name as scanner_team_name,
            scanned.name as scanned_team_name,
            cc.question as challenge_question,
            cc.answer_hint as challenge_hint,
            cc.requires_exact_match,
            cc.points as challenge_points,
            cc.time_limit_seconds,
            cc.challenge_type
     FROM team_encounters te
     JOIN teams scanner ON te.scanner_team_id = scanner.id
     JOIN teams scanned ON te.scanned_team_id = scanned.id
     LEFT JOIN collaborative_challenges cc ON te.challenge_id = cc.id
     WHERE te.id = $1`,
    [id]
  );
  return result.rows[0];
}

/**
 * Get encounters for a team (both as scanner and scanned)
 */
export async function getTeamEncounters(teamId, eventId) {
  const result = await query(
    `SELECT te.*, 
            scanner.name as scanner_team_name,
            scanned.name as scanned_team_name,
            cc.question as challenge_question,
            cc.challenge_type
     FROM team_encounters te
     JOIN teams scanner ON te.scanner_team_id = scanner.id
     JOIN teams scanned ON te.scanned_team_id = scanned.id
     LEFT JOIN collaborative_challenges cc ON te.challenge_id = cc.id
     WHERE te.event_id = $1 AND (te.scanner_team_id = $2 OR te.scanned_team_id = $2)
     ORDER BY te.started_at DESC`,
    [eventId, teamId]
  );
  return result.rows;
}

/**
 * Check if encounter already exists between two teams
 */
export async function encounterExists(eventId, scannerTeamId, scannedTeamId) {
  const result = await query(
    `SELECT id FROM team_encounters 
     WHERE event_id = $1 AND scanner_team_id = $2 AND scanned_team_id = $3`,
    [eventId, scannerTeamId, scannedTeamId]
  );
  return result.rows.length > 0;
}

/**
 * Create new encounter
 */
export async function createEncounter(eventId, scannerTeamId, scannedTeamId, challengeId) {
  const result = await query(
    `INSERT INTO team_encounters (event_id, scanner_team_id, scanned_team_id, challenge_id, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [eventId, scannerTeamId, scannedTeamId, challengeId]
  );
  return result.rows[0];
}

/**
 * Submit answer for an encounter
 */
export async function submitEncounterAnswer(encounterId, teamId, answer) {
  // First, get the encounter to determine if this team is scanner or scanned
  const encounter = await getEncounterById(encounterId);
  
  if (!encounter) {
    throw new Error('Encounter not found');
  }
  
  const isScanner = encounter.scanner_team_id === teamId;
  const field = isScanner ? 'scanner_answer' : 'scanned_answer';
  
  const result = await query(
    `UPDATE team_encounters
     SET ${field} = $2
     WHERE id = $1
     RETURNING *`,
    [encounterId, answer]
  );
  
  return result.rows[0];
}

/**
 * Complete encounter and award points if both answers match
 */
export async function completeEncounter(encounterId) {
  return await transaction(async (client) => {
    // Get encounter with challenge details
    const encounterResult = await client.query(
      `SELECT te.*, cc.requires_exact_match, cc.points
       FROM team_encounters te
       LEFT JOIN collaborative_challenges cc ON te.challenge_id = cc.id
       WHERE te.id = $1`,
      [encounterId]
    );
    
    const encounter = encounterResult.rows[0];
    
    if (!encounter) {
      throw new Error('Encounter not found');
    }
    
    // Check if both have answered
    if (!encounter.scanner_answer || !encounter.scanned_answer) {
      return { completed: false, encounter };
    }
    
    // Compare answers
    const normalizeAnswer = (answer) => 
      (answer || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const scannerNorm = normalizeAnswer(encounter.scanner_answer);
    const scannedNorm = normalizeAnswer(encounter.scanned_answer);
    
    let success;
    if (encounter.requires_exact_match) {
      success = scannerNorm === scannedNorm;
    } else {
      // For non-exact match, allow partial matches or both having some content
      success = scannerNorm.length > 0 && scannedNorm.length > 0;
    }
    
    const points = success ? (encounter.points || 50) : 0;
    const status = success ? 'completed' : 'failed';
    
    // Update encounter
    await client.query(
      `UPDATE team_encounters
       SET status = $2, points_awarded = $3, completed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [encounterId, status, points]
    );
    
    // Award points to both teams if successful
    if (success && points > 0) {
      await client.query(
        'UPDATE teams SET score = score + $1 WHERE id = $2',
        [points, encounter.scanner_team_id]
      );
      await client.query(
        'UPDATE teams SET score = score + $1 WHERE id = $2',
        [points, encounter.scanned_team_id]
      );
    }
    
    // Get updated encounter
    const updatedResult = await client.query(
      `SELECT te.*, 
              scanner.name as scanner_team_name,
              scanned.name as scanned_team_name
       FROM team_encounters te
       JOIN teams scanner ON te.scanner_team_id = scanner.id
       JOIN teams scanned ON te.scanned_team_id = scanned.id
       WHERE te.id = $1`,
      [encounterId]
    );
    
    return { 
      completed: true, 
      success, 
      points, 
      encounter: updatedResult.rows[0] 
    };
  });
}

/**
 * Mark encounter as expired
 */
export async function expireEncounter(encounterId) {
  const result = await query(
    `UPDATE team_encounters
     SET status = 'expired', completed_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [encounterId]
  );
  return result.rows[0];
}

/**
 * Get pending encounters that have expired
 */
export async function getExpiredEncounters() {
  const result = await query(
    `SELECT te.*, cc.time_limit_seconds
     FROM team_encounters te
     LEFT JOIN collaborative_challenges cc ON te.challenge_id = cc.id
     WHERE te.status = 'pending' 
     AND te.started_at < NOW() - (COALESCE(cc.time_limit_seconds, 120) * INTERVAL '1 second')`
  );
  return result.rows;
}

/**
 * Get teams that a team has not yet encountered (as scanner)
 */
export async function getUnencounteredTeams(teamId, eventId) {
  const result = await query(
    `SELECT t.id, t.name, t.personal_qr_code, t.score
     FROM teams t
     WHERE t.event_id = $1 
     AND t.id != $2
     AND t.id NOT IN (
       SELECT scanned_team_id 
       FROM team_encounters 
       WHERE event_id = $1 AND scanner_team_id = $2
     )
     ORDER BY t.name`,
    [eventId, teamId]
  );
  return result.rows;
}

/**
 * Get encounter statistics for a team
 */
export async function getTeamEncounterStats(teamId, eventId) {
  const result = await query(
    `SELECT 
       COUNT(*) FILTER (WHERE (scanner_team_id = $2 OR scanned_team_id = $2) AND status = 'completed') as completed_encounters,
       COUNT(*) FILTER (WHERE (scanner_team_id = $2 OR scanned_team_id = $2) AND status = 'failed') as failed_encounters,
       COALESCE(SUM(points_awarded) FILTER (WHERE scanner_team_id = $2 AND status = 'completed'), 0) +
       COALESCE(SUM(points_awarded) FILTER (WHERE scanned_team_id = $2 AND status = 'completed'), 0) as total_encounter_points
     FROM team_encounters
     WHERE event_id = $1`,
    [eventId, teamId]
  );
  
  const totalTeamsResult = await query(
    'SELECT COUNT(*) as total FROM teams WHERE event_id = $1 AND id != $2',
    [eventId, teamId]
  );
  
  const stats = result.rows[0];
  stats.total_teams = parseInt(totalTeamsResult.rows[0].total);
  
  return stats;
}

/**
 * Get all encounters for an event (admin)
 */
export async function getEventEncounters(eventId) {
  const result = await query(
    `SELECT te.*, 
            scanner.name as scanner_team_name,
            scanned.name as scanned_team_name,
            cc.question as challenge_question,
            cc.challenge_type
     FROM team_encounters te
     JOIN teams scanner ON te.scanner_team_id = scanner.id
     JOIN teams scanned ON te.scanned_team_id = scanned.id
     LEFT JOIN collaborative_challenges cc ON te.challenge_id = cc.id
     WHERE te.event_id = $1
     ORDER BY te.started_at DESC`,
    [eventId]
  );
  return result.rows;
}

/**
 * Count early encounters for bonus points
 */
export async function countEarlyEncounters(eventId) {
  const result = await query(
    `SELECT COUNT(*) as count 
     FROM team_encounters 
     WHERE event_id = $1 AND status = 'completed'`,
    [eventId]
  );
  return parseInt(result.rows[0].count);
}

/**
 * Get active (pending) encounter for a team
 */
export async function getActiveEncounter(teamId) {
  const result = await query(
    `SELECT te.*, 
            scanner.name as scanner_team_name,
            scanned.name as scanned_team_name,
            cc.question as challenge_question,
            cc.answer_hint as challenge_hint,
            cc.requires_exact_match,
            cc.points as challenge_points,
            cc.time_limit_seconds,
            cc.challenge_type
     FROM team_encounters te
     JOIN teams scanner ON te.scanner_team_id = scanner.id
     JOIN teams scanned ON te.scanned_team_id = scanned.id
     LEFT JOIN collaborative_challenges cc ON te.challenge_id = cc.id
     WHERE te.status = 'pending' 
     AND (te.scanner_team_id = $1 OR te.scanned_team_id = $1)
     ORDER BY te.started_at DESC
     LIMIT 1`,
    [teamId]
  );
  return result.rows[0];
}
