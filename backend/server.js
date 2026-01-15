import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.js';
import authRoutes from './src/routes/authRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import pool from './src/db/config.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sharedocs API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sharedocs API Docs'
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\nSharedocs Backend Server`);
  console.log(`================================`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  
  // Test database connection
  try {
    await pool.query('SELECT NOW()');
    console.log(`[OK] Database connected: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error(`[ERROR] Database connection failed:`, error.message);
    console.error(`   Check your .env file and ensure PostgreSQL is running`);
  }
  
  console.log(`\nAvailable endpoints:`);
  console.log(`   GET  /                       - API health check`);
  console.log(`   GET  /docs                   - Swagger API documentation`);
  console.log(`   POST /api/auth/register      - Register new user`);
  console.log(`   POST /api/auth/login         - Login with email/password`);
  console.log(`   POST /api/auth/login/wallet  - Login with wallet address`);
  console.log(`   GET  /api/auth/health        - Auth service health check`);
  console.log(`================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n[WARN] SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n[WARN] SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

export default app;
