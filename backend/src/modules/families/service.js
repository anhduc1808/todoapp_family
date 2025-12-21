function randomCode(length = 8) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

exports.listFamilies = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;

  try {
    const memberships = await prisma.familyMember.findMany({
      where: { userId },
      include: { 
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
    });
    const families = memberships.map((m) => m.family);
    res.json({ families });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createFamily = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: 'Missing name' });

  try {
    const family = await prisma.family.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
    });
    res.status(201).json({ family });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFamilyDetail = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const familyId = parseInt(req.params.id, 10);

  try {
    const membership = await prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!membership) return res.status(403).json({ message: 'Forbidden' });

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    res.json({ family });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createInviteCode = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const familyId = parseInt(req.params.id, 10);

  try {
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family) return res.status(404).json({ message: 'Not found' });
    if (family.ownerId !== userId) return res.status(403).json({ message: 'Forbidden' });

    const inviteCode = randomCode(8);
    const updated = await prisma.family.update({
      where: { id: familyId },
      data: { inviteCode },
    });

    res.json({ inviteCode: updated.inviteCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinFamilyByCode = async (req, res) => {
  console.log('joinFamilyByCode called', { body: req.body, userId: req.user?.id });
  const prisma = req.prisma;
  const userId = req.user.id;
  let { code } = req.body;

  if (!code) {
    console.log('Missing code');
    return res.status(400).json({ message: 'Missing code' });
  }

  // Normalize code: trim và uppercase
  code = code.trim().toUpperCase();
  console.log('Normalized code:', code);

  try {
    // Tìm family với inviteCode (exact match sau khi normalize)
    const family = await prisma.family.findFirst({ 
      where: { 
        inviteCode: code
      } 
    });
    if (!family) {
      console.log('Family not found for code:', code);
      return res.status(404).json({ message: 'Invalid code' });
    }

    const existing = await prisma.familyMember.findFirst({
      where: { userId, familyId: family.id },
    });
    if (existing) {
      console.log('User already member of family');
      return res.status(200).json({ family });
    }

    await prisma.familyMember.create({
      data: {
        userId,
        familyId: family.id,
        role: 'member',
      },
    });

    console.log('User joined family successfully');
    res.status(201).json({ family });
  } catch (err) {
    console.error('Error in joinFamilyByCode:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMemberRole = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const familyId = parseInt(req.params.familyId, 10);
  const memberId = parseInt(req.params.memberId, 10);
  const { role } = req.body;

  if (!role) return res.status(400).json({ message: 'Missing role' });
  if (!['owner', 'member', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Kiểm tra user hiện tại có phải owner không
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family) return res.status(404).json({ message: 'Family not found' });
    if (family.ownerId !== userId) {
      return res.status(403).json({ message: 'Chỉ chủ nhóm mới có quyền cấp quyền' });
    }

    // Không cho phép thay đổi role của chính owner
    const targetMember = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId },
    });
    if (!targetMember) return res.status(404).json({ message: 'Member not found' });
    if (targetMember.role === 'owner' && role !== 'owner') {
      return res.status(400).json({ message: 'Không thể thay đổi quyền của chủ nhóm' });
    }

    // Cập nhật role
    const updated = await prisma.familyMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ member: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
