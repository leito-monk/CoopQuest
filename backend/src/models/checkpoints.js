import { query } from '../database/db.js';
import { generateQRCode } from '../utils/helpers.js';

/**
 * Get all checkpoints for an event
 */
export async function getCheckpointsByEvent(eventId) {
  const result = await query(
    'SELECT * FROM checkpoints WHERE event_id = $1 ORDER BY order_num, created_at',
    [eventId]
  );
  return result.rows;
}

/**
 * Get checkpoint by ID
 */
export async function getCheckpointById(id) {
  const result = await query(
    'SELECT * FROM checkpoints WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

/**
 * Get checkpoint by QR code
 */
export async function getCheckpointByQR(qrCode) {
  const result = await query(
    'SELECT * FROM checkpoints WHERE qr_code = $1',
    [qrCode]
  );
  return result.rows[0];
}

/**
 * Create new checkpoint
 */
export async function createCheckpoint(checkpointData) {
  const { event_id, name, description, question, answer, points, order_num } = checkpointData;
  
  // Generate unique QR code
  const tempId = Date.now().toString();
  const qrCode = generateQRCode(tempId, process.env.QR_CODE_SECRET);
  
  const result = await query(
    `INSERT INTO checkpoints (event_id, name, description, qr_code, question, answer, points, order_num)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [event_id, name, description, qrCode, question, answer, points || 100, order_num || 0]
  );
  
  return result.rows[0];
}

/**
 * Update checkpoint
 */
export async function updateCheckpoint(id, checkpointData) {
  const { name, description, question, answer, points, order_num } = checkpointData;
  
  const result = await query(
    `UPDATE checkpoints
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         question = COALESCE($4, question),
         answer = COALESCE($5, answer),
         points = COALESCE($6, points),
         order_num = COALESCE($7, order_num)
     WHERE id = $1
     RETURNING *`,
    [id, name, description, question, answer, points, order_num]
  );
  
  return result.rows[0];
}

/**
 * Delete checkpoint
 */
export async function deleteCheckpoint(id) {
  const result = await query(
    'DELETE FROM checkpoints WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

/**
 * Get checkpoint with team status
 */
export async function getCheckpointWithTeamStatus(checkpointId, teamId) {
  const result = await query(
    `SELECT 
       c.*,
       tc.status as team_status,
       tc.answered_at
     FROM checkpoints c
     LEFT JOIN team_checkpoints tc ON c.id = tc.checkpoint_id AND tc.team_id = $2
     WHERE c.id = $1`,
    [checkpointId, teamId]
  );
  return result.rows[0];
}
