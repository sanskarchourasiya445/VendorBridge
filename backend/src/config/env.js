// =============================================================================
// config/env.js — centralised, validated environment configuration.
// =============================================================================
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'vendorbridge-dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

export const isProd = config.nodeEnv === 'production';

export default config;
