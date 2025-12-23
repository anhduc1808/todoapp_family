exports.listTasksForFamily = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const familyId = parseInt(req.params.familyId, 10);
  const { memberId, status } = req.query;

  try {
    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const where = { familyId };
    if (status) where.status = status;
    if (memberId) {
      where.assignees = {
        some: { userId: parseInt(memberId, 10) },
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTaskForFamily = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const familyId = parseInt(req.params.familyId, 10);
  const { title, description, priority, dueDate, assigneeIds, imageUrl } = req.body;

  if (!title) return res.status(400).json({ message: 'Missing title' });

  try {
    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });
    
    // Chỉ owner và admin mới được tạo công việc
    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ chủ nhóm và quản trị viên mới có quyền tạo công việc' });
    }

    const task = await prisma.task.create({
      data: {
        familyId,
        title,
        description,
        priority: priority || 'normal',
        dueDate: dueDate ? new Date(dueDate) : null,
        imageUrl: imageUrl || null,
        createdById: userId,
        assignees: assigneeIds && assigneeIds.length
          ? {
              create: assigneeIds.map((id) => ({ userId: id })),
            }
          : undefined,
      },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    // Tạo notification cho người được giao
    if (assigneeIds && assigneeIds.length > 0) {
      const notificationData = assigneeIds.map((id) => ({
        userId: id,
        type: 'assigned',
        taskId: task.id,
      }))
      await prisma.notification.createMany({ data: notificationData })
    }

    if (io) {
      io.to(`family_${familyId}`).emit('task_created', { task });
    }

    res.status(201).json({ task });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.getTaskDetail = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        family: true,
        assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!task) return res.status(404).json({ message: 'Not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: task.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);
  const { title, description, priority, dueDate, assigneeIds, imageUrl } = req.body;

  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: existing.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        priority: priority ?? existing.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        assignees: assigneeIds
          ? {
              deleteMany: {},
              create: assigneeIds.map((id) => ({ userId: id })),
            }
          : undefined,
      },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (io) {
      io.to(`family_${existing.familyId}`).emit('task_updated', { task: updated });
    }

    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'Missing status' });

  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: existing.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    if (io) {
      io.to(`family_${existing.familyId}`).emit('task_updated', { task: updated });
    }

    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyTasks = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const { status, familyId } = req.query;

  try {
    // Lấy tất cả tasks được giao cho user hiện tại
    const where = {
      assignees: {
        some: { userId },
      },
    };

    // Lọc theo status nếu có
    if (status) {
      where.status = status;
    }

    // Lọc theo family nếu có
    if (familyId) {
      where.familyId = parseInt(familyId, 10);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        family: {
          select: { id: true, name: true },
        },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);

  try {
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: true,
        comments: true,
        reactions: true,
      },
    });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: existing.familyId },
    });

    // Cho phép: owner/admin hoặc chính người tạo task
    const isCreator = existing.createdById === userId;
    const isOwnerOrAdmin = membership && (membership.role === 'owner' || membership.role === 'admin');
    if (!isCreator && !isOwnerOrAdmin) {
      return res
        .status(403)
        .json({ message: 'Chỉ chủ nhóm, quản trị viên hoặc người tạo mới được xóa công việc' });
    }

    // Xóa trong transaction để tránh lỗi khóa ngoại
    await prisma.$transaction(async (tx) => {
      // 1) Reactions gắn trực tiếp task
      await tx.reaction.deleteMany({ where: { taskId } });

      // 2) Reactions trong comments -> xóa comments
      const comments = await tx.comment.findMany({ where: { taskId }, select: { id: true } });
      const commentIds = comments.map((c) => c.id);
      if (commentIds.length) {
        await tx.reaction.deleteMany({ where: { commentId: { in: commentIds } } });
      }
      await tx.comment.deleteMany({ where: { taskId } });

      // 3) Notifications
      await tx.notification.deleteMany({ where: { taskId } });

      // 4) Assignees
      await tx.taskAssignee.deleteMany({ where: { taskId } });

      // 5) Cuối cùng: task
      await tx.task.delete({ where: { id: taskId } });
    });

    if (io) {
      io.to(`family_${existing.familyId}`).emit('task_deleted', { taskId });
    }

    console.log(`Task ${taskId} deleted successfully by user ${userId}`);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    console.error('Delete task error details:', {
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Failed to delete task',
      code: err.code || 'UNKNOWN_ERROR',
    });
  }
};
