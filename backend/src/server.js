require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { PrismaClient } = require('../generated/prisma');
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
  prisma = new PrismaClient();
  console.log('Prisma Client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
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
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translate', translationRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
