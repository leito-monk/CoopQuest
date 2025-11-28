import { query, transaction } from '../database/db.js';
import { generateTeamToken } from '../utils/helpers.js';

/**
 * Get all teams for an event
 */
export async function getTeamsByEvent(eventId) {
  const result = await query(
    'SELECT id, event_id, name, score, created_at FROM teams WHERE event_id = $1 ORDER BY score DESC, created_at',
    [eventId]
  );
  return result.rows;
}

/**
 * Get team by ID
 */
export async function getTeamById(id) {
  const result = await query(
    'SELECT id, event_id, name, score, created_at FROM teams WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

/**
 * Get team by token
 */
export async function getTeamByToken(token) {
  const result = await query(
    'SELECT * FROM teams WHERE token = $1',
    [token]
  );
  return result.rows[0];
}

/**
 * Create new team
 */
export async function createTeam(eventId, teamName) {
  const token = generateTeamToken();
  
  const result = await query(
    `INSERT INTO teams (event_id, name, token)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [eventId, teamName, token]
  );
  
  // Initialize team_checkpoints for all event checkpoints
  const team = result.rows[0];
  
  await query(
    `INSERT INTO team_checkpoints (team_id, checkpoint_id, status)
     SELECT $1, id, 'pending'
     FROM checkpoints
     WHERE event_id = $2`,
    [team.id, eventId]
  );
  
  return team;
}

/**
 * Get team progress
 */
export async function getTeamProgress(teamId) {
  const result = await query(
    `SELECT 
       c.id,
       c.name,
       c.description,
       c.points,
       c.order_num,
       tc.status,
       tc.answered_at
     FROM checkpoints c
     JOIN team_checkpoints tc ON c.id = tc.checkpoint_id
     WHERE tc.team_id = $1
     ORDER BY c.order_num, c.created_at`,
    [teamId]
  );
  return result.rows;
}

/**
 * Update team score
 */
export async function updateTeamScore(teamId, pointsToAdd) {
  const result = await query(
    `UPDATE teams
     SET score = score + $2
     WHERE id = $1
     RETURNING *`,
    [teamId, pointsToAdd]
  );
  return result.rows[0];
}

/**
 * Record checkpoint attempt
 */
export async function recordCheckpointAttempt(teamId, checkpointId, isCorrect) {
  return await transaction(async (client) => {
    // Update team_checkpoint status
    const status = isCorrect ? 'completed' : 'failed';
    const answered_at = new Date();
    
    await client.query(
      `UPDATE team_checkpoints
       SET status = $1, answered_at = $2
       WHERE team_id = $3 AND checkpoint_id = $4`,
      [status, answered_at, teamId, checkpointId]
    );
    
    // If correct, add points to team
    if (isCorrect) {
      const checkpointResult = await client.query(
        'SELECT points FROM checkpoints WHERE id = $1',
        [checkpointId]
      );
      
      const points = checkpointResult.rows[0].points;
      
      await client.query(
        'UPDATE teams SET score = score + $1 WHERE id = $2',
        [points, teamId]
      );
    }
    
    // Return updated team
    const teamResult = await client.query(
      'SELECT * FROM teams WHERE id = $1',
      [teamId]
    );
    
    return teamResult.rows[0];
  });
}

/**
 * Get leaderboard for event
 */
export async function getLeaderboard(eventId) {
  const result = await query(
    `SELECT 
       t.id,
       t.name,
       t.score,
       COUNT(CASE WHEN tc.status = 'completed' THEN 1 END) as completed_checkpoints,
       COUNT(CASE WHEN tc.status = 'failed' THEN 1 END) as failed_checkpoints,
       COUNT(tc.id) as total_checkpoints
     FROM teams t
     LEFT JOIN team_checkpoints tc ON t.id = tc.team_id
     WHERE t.event_id = $1
     GROUP BY t.id, t.name, t.score
     ORDER BY t.score DESC, completed_checkpoints DESC, t.created_at`,
    [eventId]
  );
  return result.rows;
}
