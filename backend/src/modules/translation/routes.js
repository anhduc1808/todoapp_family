const express = require('express');
const router = express.Router();
const service = require('./service');

// Translate single text
router.post('/', service.translateText);

// Translate batch texts
router.post('/batch', service.translateBatch);

// Health check
router.get('/health', service.healthCheck);

module.exports = router;
