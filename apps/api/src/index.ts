import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Health-check endpoints
// ---------------------------------------------------------------------------
const healthPayload = () => ({
  success: true,
  data: {
    message: 'Odoo Cafe POS API is running',
    timestamp: new Date().toISOString(),
  },
});

app.get('/', (_req, res) => {
  res.json(healthPayload());
});

app.get('/api/health', (_req, res) => {
  res.json(healthPayload());
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 API server listening on http://localhost:${PORT}`);
});
