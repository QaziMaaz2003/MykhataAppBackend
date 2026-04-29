import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import healthRoutes from './routes/health.js';
import transactionRoutes from './routes/transactions.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MyKhataApp Backend API',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🌍 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});

export default app;
