const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../auth/middleware');
const service = require('./service');

router.use(authMiddleware);

router.get('/tasks/my', service.getMyTasks);
router.get('/families/:familyId/tasks', service.listTasksForFamily);
router.post('/families/:familyId/tasks', service.createTaskForFamily);
router.get('/tasks/:taskId', service.getTaskDetail);
router.put('/tasks/:taskId', service.updateTask);
router.patch('/tasks/:taskId/status', service.updateTaskStatus);
router.delete('/tasks/:taskId', service.deleteTask);

module.exports = router;
