const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../auth/middleware');
const service = require('./service');

router.use(authMiddleware);

router.get('/tasks/my', service.getMyTasks);
router.get('/families/:familyId/tasks', service.listTasksForFamily);
router.post('/families/:familyId/tasks', service.createTaskForFamily);

// Comments - Phải đặt TRƯỚC routes generic /tasks/:taskId
router.get('/tasks/:taskId/comments', service.getTaskComments);
router.post('/tasks/:taskId/comments', service.addTaskComment);
router.delete('/tasks/:taskId/comments/:commentId', service.deleteTaskComment);

// Reactions - Phải đặt TRƯỚC routes generic /tasks/:taskId
router.get('/tasks/:taskId/reactions', service.getTaskReactions);
router.post('/tasks/:taskId/reactions', service.addTaskReaction);
router.delete('/tasks/:taskId/reactions/:reactionId', service.removeTaskReaction);

// Task routes - Đặt SAU routes cụ thể
router.get('/tasks/:taskId', service.getTaskDetail);
router.put('/tasks/:taskId', service.updateTask);
router.patch('/tasks/:taskId/status', service.updateTaskStatus);
router.delete('/tasks/:taskId', service.deleteTask);

module.exports = router;
