import jwt from 'jsonwebtoken';
import { formatError } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

/**
 * Middleware to verify team token
 */
export function authenticateTeam(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatError('No se proporcionó token de autenticación', 401));
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.team = decoded;
      next();
    } catch (error) {
      return res.status(401).json(formatError('Token inválido o expirado', 401));
    }
  } catch (error) {
    return res.status(500).json(formatError('Error en autenticación', 500));
  }
}

/**
 * Middleware to verify admin password
 */
export function authenticateAdmin(req, res, next) {
  try {
    const adminPassword = req.headers['x-admin-password'] || req.body.adminPassword;
    
    if (!adminPassword) {
      return res.status(401).json(formatError('Se requiere contraseña de administrador', 401));
    }
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json(formatError('Contraseña de administrador incorrecta', 403));
    }
    
    next();
  } catch (error) {
    return res.status(500).json(formatError('Error en autenticación de admin', 500));
  }
}

/**
 * Generate JWT token for team
 */
export function generateToken(team) {
  return jwt.sign(
    {
      teamId: team.id,
      teamName: team.name,
      eventId: team.event_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
