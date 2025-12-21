const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../auth/middleware')
const { listMyNotifications, markAsRead } = require('./service')

router.use(authMiddleware)

router.get('/', listMyNotifications)
router.patch('/:id/read', markAsRead)

module.exports = router
