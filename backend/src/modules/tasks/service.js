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
        assignees: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            reactions: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
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

// ========== COMMENTS ==========

exports.getTaskComments = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { familyId: true },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: task.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        reactions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addTaskComment = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        family: { include: { members: { select: { userId: true } } } },
        assignees: { select: { userId: true } },
      },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: task.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        reactions: true,
      },
    });

    // Tạo notifications cho các thành viên khác (trừ người comment)
    const notifyUserIds = [
      ...task.family.members.map((m) => m.userId),
      ...task.assignees.map((a) => a.userId),
    ]
      .filter((id) => id !== userId)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    if (notifyUserIds.length > 0) {
      const notificationData = notifyUserIds.map((id) => ({
        userId: id,
        type: 'comment',
        taskId,
        commentId: comment.id,
      }));

      await prisma.notification.createMany({ data: notificationData });
    }

    if (io) {
      io.to(`family_${task.familyId}`).emit('comment_added', { comment, taskId });
      notifyUserIds.forEach((id) => {
        io.to(`user_${id}`).emit('notification_new', { type: 'comment', taskId });
      });
    }

    res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTaskComment = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);
  const commentId = parseInt(req.params.commentId, 10);

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: { select: { familyId: true } },
      },
    });

    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.taskId !== taskId) return res.status(400).json({ message: 'Invalid task ID' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: comment.task.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    // Chỉ cho phép xóa comment của chính mình hoặc owner/admin
    const isOwner = membership.role === 'owner';
    const isAdmin = membership.role === 'admin';
    const isCommentOwner = comment.userId === userId;

    if (!isCommentOwner && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await prisma.$transaction(async (tx) => {
      // Xóa reactions của comment
      await tx.reaction.deleteMany({ where: { commentId } });
      // Xóa notifications liên quan
      await tx.notification.deleteMany({ where: { commentId } });
      // Xóa comment
      await tx.comment.delete({ where: { id: commentId } });
    });

    if (io) {
      io.to(`family_${comment.task.familyId}`).emit('comment_deleted', { commentId, taskId });
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========== REACTIONS ==========

exports.getTaskReactions = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { familyId: true },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: task.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const reactions = await prisma.reaction.findMany({
      where: { taskId, commentId: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ reactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addTaskReaction = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);
  const { type, commentId } = req.body;

  if (!type) {
    return res.status(400).json({ message: 'Reaction type is required' });
  }

  const validTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid reaction type' });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        family: { include: { members: { select: { userId: true } } } },
        assignees: { select: { userId: true } },
      },
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: task.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    // Kiểm tra nếu commentId được cung cấp
    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId, 10) },
      });
      if (!comment || comment.taskId !== taskId) {
        return res.status(404).json({ message: 'Comment not found' });
      }
    }

    // Kiểm tra xem user đã reaction chưa (cùng type)
    const existing = await prisma.reaction.findFirst({
      where: {
        userId,
        taskId: commentId ? null : taskId,
        commentId: commentId ? parseInt(commentId, 10) : null,
        type,
      },
    });

    if (existing) {
      // Nếu đã có, xóa reaction (toggle)
      await prisma.reaction.delete({ where: { id: existing.id } });

      if (io) {
        io.to(`family_${task.familyId}`).emit('reaction_removed', {
          reactionId: existing.id,
          taskId,
          commentId: commentId || null,
        });
      }

      return res.json({ message: 'Reaction removed', reaction: null });
    }

    // Tạo reaction mới
    const reaction = await prisma.reaction.create({
      data: {
        userId,
        taskId: commentId ? null : taskId,
        commentId: commentId ? parseInt(commentId, 10) : null,
        type,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Tạo notification cho task owner và assignees (trừ người reaction)
    if (!commentId) {
      const notifyUserIds = [
        task.createdById,
        ...task.assignees.map((a) => a.userId),
      ]
        .filter((id) => id !== userId)
        .filter((id, index, self) => self.indexOf(id) === index);

      if (notifyUserIds.length > 0) {
        const notificationData = notifyUserIds.map((id) => ({
          userId: id,
          type: 'reaction',
          taskId,
        }));

        await prisma.notification.createMany({ data: notificationData });
      }

      if (io) {
        notifyUserIds.forEach((id) => {
          io.to(`user_${id}`).emit('notification_new', { type: 'reaction', taskId });
        });
      }
    }

    if (io) {
      io.to(`family_${task.familyId}`).emit('reaction_added', { reaction, taskId, commentId: commentId || null });
    }

    res.status(201).json({ reaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeTaskReaction = async (req, res) => {
  const prisma = req.prisma;
  const io = req.io;
  const userId = req.user.id;
  const taskId = parseInt(req.params.taskId, 10);
  const reactionId = parseInt(req.params.reactionId, 10);

  try {
    const reaction = await prisma.reaction.findUnique({
      where: { id: reactionId },
      include: {
        task: { select: { familyId: true } },
      },
    });

    if (!reaction) return res.status(404).json({ message: 'Reaction not found' });
    if (reaction.taskId !== taskId && !reaction.commentId) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const membership = await prisma.familyMember.findFirst({
      where: { userId, familyId: reaction.task?.familyId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    // Chỉ cho phép xóa reaction của chính mình
    if (reaction.userId !== userId) {
      return res.status(403).json({ message: 'You can only remove your own reactions' });
    }

    await prisma.reaction.delete({ where: { id: reactionId } });

    if (io && reaction.task) {
      io.to(`family_${reaction.task.familyId}`).emit('reaction_removed', {
        reactionId,
        taskId,
        commentId: reaction.commentId || null,
      });
    }

    res.status(200).json({ message: 'Reaction removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
