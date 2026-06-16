import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { initializeDatabase } from './database';
import { setupWebSocketSignaling } from './websocket/signaling';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import discoverRoutes from './routes/discover';
import translateRoutes from './routes/translate';
import messagesRoutes from './routes/messages';
import callsRoutes from './routes/calls';

// Environment
const PORT = parseInt(process.env.PORT || '3000', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database
initializeDatabase();

// Create Express app
const app = express();

// ─── Security Middleware ────────────────────────────────────────

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
}));

// CORS
app.use(cors({
  origin: NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000']
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Static Files ──────────────────────────────────────────────

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Request Logging ───────────────────────────────────────────

if (NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ────────────────────────────────────────────────────

// Public health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/call', callsRoutes);
app.use('/api', apiLimiter); // Apply general rate limiting to all other API routes

// ─── Error Handling ────────────────────────────────────────────

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Server Startup ────────────────────────────────────────────

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on the same HTTP server
const wss = new WebSocketServer({
  server,
  path: '/ws',
});

// Set up WebSocket signaling
setupWebSocketSignaling(wss);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║    双心 Bridge | Два Сердца                        ║
║    Server is running!                             ║
╠══════════════════════════════════════════════════╣
║  HTTP API:     http://0.0.0.0:${PORT}/api           ║
║  WebSocket:    ws://0.0.0.0:${PORT}/ws              ║
║  Health:       http://0.0.0.0:${PORT}/api/health    ║
║  Environment:  ${NODE_ENV.padEnd(30)}║
╚══════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  wss.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

export { app, server, wss };