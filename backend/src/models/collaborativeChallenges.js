import { query } from '../database/db.js';

/**
 * Get all collaborative challenges for an event
 */
export async function getChallengesByEvent(eventId) {
  const result = await query(
    `SELECT * FROM collaborative_challenges 
     WHERE (event_id = $1 OR event_id IS NULL) AND is_active = true
     ORDER BY created_at`,
    [eventId]
  );
  return result.rows;
}

/**
 * Get a random active challenge for an event
 */
export async function getRandomChallenge(eventId) {
  const result = await query(
    `SELECT * FROM collaborative_challenges 
     WHERE (event_id = $1 OR event_id IS NULL) AND is_active = true
     ORDER BY RANDOM()
     LIMIT 1`,
    [eventId]
  );
  return result.rows[0];
}

/**
 * Get challenge by ID
 */
export async function getChallengeById(id) {
  const result = await query(
    'SELECT * FROM collaborative_challenges WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

/**
 * Create new collaborative challenge
 */
export async function createChallenge(challengeData) {
  const { 
    event_id, 
    challenge_type, 
    question, 
    answer_hint, 
    requires_exact_match, 
    points, 
    time_limit_seconds 
  } = challengeData;
  
  const result = await query(
    `INSERT INTO collaborative_challenges 
     (event_id, challenge_type, question, answer_hint, requires_exact_match, points, time_limit_seconds)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [event_id || null, challenge_type, question, answer_hint, requires_exact_match || false, points || 50, time_limit_seconds || 120]
  );
  
  return result.rows[0];
}

/**
 * Update collaborative challenge
 */
export async function updateChallenge(id, challengeData) {
  const { 
    challenge_type, 
    question, 
    answer_hint, 
    requires_exact_match, 
    points, 
    time_limit_seconds,
    is_active 
  } = challengeData;
  
  const result = await query(
    `UPDATE collaborative_challenges
     SET challenge_type = COALESCE($2, challenge_type),
         question = COALESCE($3, question),
         answer_hint = COALESCE($4, answer_hint),
         requires_exact_match = COALESCE($5, requires_exact_match),
         points = COALESCE($6, points),
         time_limit_seconds = COALESCE($7, time_limit_seconds),
         is_active = COALESCE($8, is_active)
     WHERE id = $1
     RETURNING *`,
    [id, challenge_type, question, answer_hint, requires_exact_match, points, time_limit_seconds, is_active]
  );
  
  return result.rows[0];
}

/**
 * Delete collaborative challenge
 */
export async function deleteChallenge(id) {
  const result = await query(
    'DELETE FROM collaborative_challenges WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

/**
 * Get all challenges (including inactive) for admin
 */
export async function getAllChallenges(eventId = null) {
  let sql = 'SELECT * FROM collaborative_challenges';
  const params = [];
  
  if (eventId) {
    sql += ' WHERE event_id = $1 OR event_id IS NULL';
    params.push(eventId);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const result = await query(sql, params);
  return result.rows;
}
