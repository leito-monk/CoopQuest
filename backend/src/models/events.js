import { query } from '../database/db.js';
import { generateQRCode } from '../utils/helpers.js';

/**
 * Get all events
 */
export async function getAllEvents() {
  const result = await query(
    'SELECT * FROM events ORDER BY date DESC'
  );
  return result.rows;
}

/**
 * Get event by ID
 */
export async function getEventById(id) {
  const result = await query(
    'SELECT * FROM events WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

/**
 * Get active events
 */
export async function getActiveEvents() {
  const result = await query(
    'SELECT * FROM events WHERE status = $1 ORDER BY date DESC',
    ['active']
  );
  return result.rows;
}

/**
 * Create new event
 */
export async function createEvent(eventData) {
  const { name, description, date, location } = eventData;
  
  const result = await query(
    `INSERT INTO events (name, description, date, location, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description, date, location, 'draft']
  );
  
  return result.rows[0];
}

/**
 * Update event
 */
export async function updateEvent(id, eventData) {
  const { name, description, date, location, status } = eventData;
  
  const result = await query(
    `UPDATE events
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         date = COALESCE($4, date),
         location = COALESCE($5, location),
         status = COALESCE($6, status)
     WHERE id = $1
     RETURNING *`,
    [id, name, description, date, location, status]
  );
  
  return result.rows[0];
}

/**
 * Delete event
 */
export async function deleteEvent(id) {
  const result = await query(
    'DELETE FROM events WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

/**
 * Get event statistics
 */
export async function getEventStats(eventId) {
  const teamsResult = await query(
    'SELECT COUNT(*) as total FROM teams WHERE event_id = $1',
    [eventId]
  );
  
  const checkpointsResult = await query(
    'SELECT COUNT(*) as total FROM checkpoints WHERE event_id = $1',
    [eventId]
  );
  
  const completedResult = await query(
    `SELECT COUNT(*) as total 
     FROM team_checkpoints tc
     JOIN teams t ON tc.team_id = t.id
     WHERE t.event_id = $1 AND tc.status = 'completed'`,
    [eventId]
  );
  
  const checkpointStatsResult = await query(
    `SELECT 
       c.name,
       c.id,
       COUNT(CASE WHEN tc.status = 'completed' THEN 1 END) as completed_count,
       COUNT(CASE WHEN tc.status = 'failed' THEN 1 END) as failed_count
     FROM checkpoints c
     LEFT JOIN team_checkpoints tc ON c.id = tc.checkpoint_id
     WHERE c.event_id = $1
     GROUP BY c.id, c.name
     ORDER BY completed_count DESC`,
    [eventId]
  );
  
  return {
    totalTeams: parseInt(teamsResult.rows[0].total),
    totalCheckpoints: parseInt(checkpointsResult.rows[0].total),
    totalCompletions: parseInt(completedResult.rows[0].total),
    checkpointStats: checkpointStatsResult.rows
  };
}
