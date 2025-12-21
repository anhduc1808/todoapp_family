require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('../generated/prisma');
const authRoutes = require('./modules/auth/routes');
const familyRoutes = require('./modules/families/routes');
const taskRoutes = require('./modules/tasks/routes');

const app = express();

app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api', taskRoutes);

module.exports = app;
