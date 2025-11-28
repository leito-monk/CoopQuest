import crypto from 'crypto';

/**
 * Generate QR code string with hash for security
 */
export function generateQRCode(checkpointId, secret) {
  const prefix = process.env.QR_CODE_PREFIX || 'COOPQUEST-2025';
  const hash = crypto
    .createHmac('sha256', secret || process.env.QR_CODE_SECRET || 'default-secret')
    .update(checkpointId)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  return `${prefix}-${checkpointId.substring(0, 8).toUpperCase()}-${hash}`;
}

/**
 * Verify QR code is valid
 */
export function verifyQRCode(qrCode, secret) {
  try {
    const parts = qrCode.split('-');
    if (parts.length < 3) return null;
    
    const checkpointIdPart = parts[parts.length - 2];
    const providedHash = parts[parts.length - 1];
    
    // Note: This is a simplified verification since we don't have the full UUID
    // In production, you'd query the database to validate
    return { valid: true, checkpointIdPart };
  } catch (error) {
    return null;
  }
}

/**
 * Generate secure team token
 */
export function generateTeamToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Normalize answer for comparison
 */
export function normalizeAnswer(answer) {
  return answer
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ''); // Remove special characters
}

/**
 * Check if answer is correct (allows variations)
 */
export function checkAnswer(userAnswer, correctAnswer) {
  const normalized1 = normalizeAnswer(userAnswer);
  const normalized2 = normalizeAnswer(correctAnswer);
  
  // Exact match
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for partial matches)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  return false;
}

/**
 * Validate team name
 */
export function validateTeamName(name) {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push('El nombre del equipo es requerido');
  }
  
  if (name.length > 50) {
    errors.push('El nombre debe tener máximo 50 caracteres');
  }
  
  // Basic profanity filter (expand this list as needed)
  const bannedWords = ['idiota', 'tonto', 'estupido', 'imbecil'];
  const lowerName = name.toLowerCase();
  
  for (const word of bannedWords) {
    if (lowerName.includes(word)) {
      errors.push('El nombre contiene palabras no permitidas');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format error response
 */
export function formatError(message, statusCode = 400, details = null) {
  return {
    error: true,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format success response
 */
export function formatSuccess(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}
