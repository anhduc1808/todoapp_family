require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./modules/auth/routes');
const familyRoutes = require('./modules/families/routes');
const taskRoutes = require('./modules/tasks/routes');
const notificationRoutes = require('./modules/notifications/routes');
const translationRoutes = require('./modules/translation/routes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_family', (familyId) => {
    socket.join(`family_${familyId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach Prisma and io to request
let prisma;
try {
  // Check if Prisma Client exists
  try {
    prisma = new PrismaClient();
    console.log('Prisma Client initialized successfully');
  } catch (prismaError) {
    console.error('Prisma Client initialization error:', prismaError);
    console.error('Error details:', {
      message: prismaError.message,
      code: prismaError.code,
      path: prismaError.path
    });
    throw prismaError;
  }
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  console.error('Make sure Prisma Client is generated. Run: npx prisma generate');
  process.exit(1);
}

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Family TodoApp backend running',
      database: 'connected',
      prisma: 'initialized',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Test endpoint để kiểm tra Prisma
app.get('/api/test/prisma', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ error: 'Prisma client not initialized' });
    }
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    res.json({ 
      success: true, 
      prisma: 'working',
      result: result 
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    res.status(500).json({ 
      error: 'Prisma test failed',
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Test endpoint để kiểm tra User table
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
    res.json({ 
      success: true, 
      userCount: userCount,
      users: users,
      message: 'User table accessible'
    });
  } catch (error) {
    console.error('User table test error:', error);
    res.status(500).json({ 
      error: 'User table test failed',
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translate', translationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    code: err.code || 'UNKNOWN_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
});
