// =============================================================================
// app.js — Express application assembly (middleware + routes + error handling).
// =============================================================================
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { config, isProd } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// API
app.use('/api', apiRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);

export default app;
