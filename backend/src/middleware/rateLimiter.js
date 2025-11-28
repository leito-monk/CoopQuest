import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for QR scanning
 * Max 1 scan every 5 seconds per team
 */
export const scanRateLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1,
  message: {
    error: true,
    message: 'Espera 5 segundos antes de escanear otro código QR',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.team?.teamId || req.ip
});

/**
 * Rate limiter for API endpoints
 * Max 100 requests per 15 minutes
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: true,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for registration
 * Max 5 registrations per 15 minutes per IP
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: true,
    message: 'Demasiados registros desde esta IP, intenta más tarde',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});
