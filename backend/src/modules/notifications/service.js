exports.listMyNotifications = async (req, res) => {
  const prisma = req.prisma
  const userId = req.user.id

  try {
    // 1) Tạo notification quá hạn nếu chưa có
    const now = new Date()
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'done' },
        assignees: { some: { userId } },
      },
      select: { id: true },
    })

    if (overdueTasks.length > 0) {
      const existing = await prisma.notification.findMany({
        where: {
          userId,
          type: 'overdue',
          taskId: { in: overdueTasks.map((t) => t.id) },
        },
        select: { taskId: true },
      })
      const existingTaskIds = new Set(existing.map((n) => n.taskId))

      const toCreate = overdueTasks
        .filter((t) => !existingTaskIds.has(t.id))
        .map((t) => ({ userId, type: 'overdue', taskId: t.id }))

      if (toCreate.length > 0) {
        await prisma.notification.createMany({ data: toCreate })
      }
    }

    // 2) Trả về list notification
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { task: { select: { id: true, title: true, dueDate: true } } },
    })

    res.json({ notifications: items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.markAsRead = async (req, res) => {
  const prisma = req.prisma
  const userId = req.user.id
  const id = parseInt(req.params.id, 10)

  try {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
