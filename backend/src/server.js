require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const config = require('./config');
const authRoutes = require('./modules/auth/routes');
const familyRoutes = require('./modules/families/routes');
const taskRoutes = require('./modules/tasks/routes');
const notificationRoutes = require('./modules/notifications/routes');
const translationRoutes = require('./modules/translation/routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : '*',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  logger.info('Client connected', socket.id);

  socket.on('join_family', (familyId) => {
    socket.join(`family_${familyId}`);
    logger.debug(`Client ${socket.id} joined family ${familyId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', socket.id);
  });
});

app.use(cors({
  origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Prisma Client
let prisma;
try {
  prisma = new PrismaClient();
  logger.info('Prisma Client initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Prisma Client:', error);
  process.exit(1);
}

// Test database connection
prisma.$connect()
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((error) => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Family TodoApp backend running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// Test endpoints - Only available in development
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test/prisma', async (req, res) => {
    try {
      if (!prisma) {
        return res.status(500).json({ error: 'Prisma client not initialized' });
      }
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      res.json({ success: true, prisma: 'working', result });
    } catch (error) {
      logger.error('Prisma test error:', error);
      res.status(500).json({
        error: 'Prisma test failed',
        message: error.message,
        code: error.code,
      });
    }
  });

  app.get('/api/test/users', async (req, res) => {
    try {
      if (!prisma) {
        return res.status(500).json({ error: 'Prisma client not initialized' });
      }
      const userCount = await prisma.user.count();
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, createdAt: true },
        take: 5
      });
      res.json({ success: true, userCount, users, message: 'User table accessible' });
    } catch (error) {
      logger.error('User table test error:', error);
      res.status(500).json({
        error: 'User table test failed',
        message: error.message,
        code: error.code,
      });
    }
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translate', translationRoutes);

// 404 Handler (must be before error handler)
app.use(notFound);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Backend server listening on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Database: ${config.databaseUrl ? 'Configured' : 'Not configured'}`);
  logger.info(`JWT Secret: ${config.jwtSecret ? 'Set' : 'Using default (NOT SECURE)'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
