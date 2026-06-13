import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import posRoutes from './routes/posRoutes.js';
import { authenticateToken, requireAdmin } from './middleware/authMiddleware.js';

// Import Sockets
import { setupKdsSockets } from './sockets/kdsHandlers.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// REST API Routes
// ---------------------------------------------------------------------------
// Health check
app.get('/', (_req, res) => {
  res.json({ success: true, data: { message: 'Odoo Cafe POS API is running', timestamp: new Date().toISOString() } });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { message: 'Odoo Cafe POS API is running', timestamp: new Date().toISOString() } });
});

// Auth
app.use('/api/auth', authRoutes);

// Admin (Protected)
app.use('/api/admin', authenticateToken, requireAdmin, adminRoutes);

// POS (Protected)
app.use('/api/pos', authenticateToken, posRoutes);

// ---------------------------------------------------------------------------
// WebSockets Setup
// ---------------------------------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust in production
    methods: ['GET', 'POST'],
  },
});

setupKdsSockets(io);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`🚀 API server listening on http://localhost:${PORT}`);
});
