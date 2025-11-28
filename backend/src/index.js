import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

// Import routes
import eventsRoutes from './routes/events.js';
import checkpointsRoutes from './routes/checkpoints.js';
import teamsRoutes from './routes/teams.js';
import gameRoutes from './routes/game.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { apiRateLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time leaderboard
const wss = new WebSocketServer({ server, path: '/ws' });

// Store active connections by event ID
const eventConnections = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');
  
  let currentEventId = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'subscribe' && data.eventId) {
        // Unsubscribe from previous event if any
        if (currentEventId) {
          const connections = eventConnections.get(currentEventId) || [];
          eventConnections.set(
            currentEventId,
            connections.filter(c => c !== ws)
          );
        }
        
        // Subscribe to new event
        currentEventId = data.eventId;
        const connections = eventConnections.get(currentEventId) || [];
        connections.push(ws);
        eventConnections.set(currentEventId, connections);
        
        console.log(`📡 Client subscribed to event: ${currentEventId}`);
        
        ws.send(JSON.stringify({
          type: 'subscribed',
          eventId: currentEventId
        }));
      }
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    
    // Remove connection from all events
    if (currentEventId) {
      const connections = eventConnections.get(currentEventId) || [];
      eventConnections.set(
        currentEventId,
        connections.filter(c => c !== ws)
      );
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Function to broadcast leaderboard update
export function broadcastLeaderboardUpdate(eventId, leaderboard) {
  const connections = eventConnections.get(eventId) || [];
  
  const message = JSON.stringify({
    type: 'leaderboard_update',
    eventId,
    data: leaderboard
  });
  
  connections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
  
  console.log(`📡 Broadcasted leaderboard update to ${connections.length} clients for event ${eventId}`);
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiRateLimiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/events', eventsRoutes);
app.use('/api/checkpoints', checkpointsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint no encontrado',
    statusCode: 404
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎯 CoopQuest Backend API                           ║
║                                                       ║
║   🚀 Server running on port ${PORT}                     ║
║   🌐 http://localhost:${PORT}                           ║
║   📡 WebSocket: ws://localhost:${PORT}/ws               ║
║                                                       ║
║   📊 Health: http://localhost:${PORT}/health            ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
