const { PrismaClient } = require('../generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // Xóa dữ liệu cũ (cẩn thận khi dùng trên môi trường thật)
  await prisma.notification.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.taskAssignee.deleteMany()
  await prisma.task.deleteMany()
  await prisma.familyMember.deleteMany()
  await prisma.family.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('123456', 10)

  // Tạo vài user mẫu
  const mom = await prisma.user.create({
    data: {
      name: 'Mẹ',
      email: 'mom@example.com',
      passwordHash,
    },
  })

  const dad = await prisma.user.create({
    data: {
      name: 'Bố',
      email: 'dad@example.com',
      passwordHash,
    },
  })

  const kid = await prisma.user.create({
    data: {
      name: 'Con',
      email: 'kid@example.com',
      passwordHash,
    },
  })

  // Tạo 1 family mẫu
  const family = await prisma.family.create({
    data: {
      name: 'Gia đình nhỏ của chúng ta',
      ownerId: mom.id,
      members: {
        create: [
          { userId: mom.id, role: 'owner' },
          { userId: dad.id, role: 'parent' },
          { userId: kid.id, role: 'child' },
        ],
      },
    },
  })

  // Tạo vài task mẫu
  const task1 = await prisma.task.create({
    data: {
      familyId: family.id,
      title: 'Dọn phòng khách',
      description: 'Quét nhà, lau bàn, sắp xếp lại đồ chơi.',
      priority: 'normal',
      status: 'todo',
      createdById: mom.id,
      assignees: {
        create: [{ userId: kid.id }],
      },
    },
  })

  const task2 = await prisma.task.create({
    data: {
      familyId: family.id,
      title: 'Đi chợ cuối tuần',
      description: 'Mua rau, thịt, trái cây cho 3 ngày.',
      priority: 'high',
      status: 'in-progress',
      createdById: dad.id,
      assignees: {
        create: [{ userId: mom.id }],
      },
    },
  })

  const task3 = await prisma.task.create({
    data: {
      familyId: family.id,
      title: 'Học bài 30 phút',
      description: 'Ôn toán và tiếng Anh.',
      priority: 'normal',
      status: 'done',
      createdById: mom.id,
      assignees: {
        create: [{ userId: kid.id }],
      },
    },
  })

  console.log('Seed completed:')
  console.log({ family, task1, task2, task3 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
