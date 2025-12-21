const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

function generateToken(user) {
  if (!JWT_SECRET || JWT_SECRET === 'dev-secret') {
    console.warn('WARNING: Using default JWT_SECRET. This is not secure for production!');
  }
  try {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });
  } catch (error) {
    console.error('JWT token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
}

exports.register = async (req, res) => {
  const prisma = req.prisma;
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const prisma = req.prisma;
    if (!prisma) {
      console.error('Prisma client is not available in request');
      return res.status(500).json({ 
        message: 'Database connection error',
        error: 'Prisma client not initialized'
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    console.log('Login attempt for email:', email);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking password...');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      console.log('Password mismatch for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.id);
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    console.error('Error stack:', err.stack);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      meta: err.meta,
      name: err.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error',
      code: err.code || 'UNKNOWN_ERROR'
    });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateMe = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const { name, email, contactNumber, position } = req.body;

  try {
    // Kiểm tra email có bị trùng với user khác không (nếu thay đổi email)
    if (email && email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Cập nhật thông tin user
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    // Lưu ý: contactNumber và position có thể cần thêm vào schema nếu cần lưu trữ
    // Hiện tại chỉ cập nhật name và email

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({ user: updated, message: 'Update successful' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const prisma = req.prisma;
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Facebook login
exports.facebookLogin = async (req, res) => {
  const prisma = req.prisma;
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ message: 'Missing access token' });
  }

  try {
    // Verify Facebook token
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );

    const { id: facebookId, name, email } = fbResponse.data;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Facebook' });
    }

    // Tìm user theo email hoặc tạo mới
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Tạo user mới với passwordHash rỗng (social login)
      user = await prisma.user.create({
        data: {
          name: name || 'Facebook User',
          email,
          passwordHash: '', // Social login không cần password
        },
      });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Facebook login error:', err);
    if (err.response?.data) {
      return res.status(400).json({ message: 'Invalid Facebook token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  const prisma = req.prisma;
  const { idToken, email, name } = req.body;

  if (!idToken && !email) {
    return res.status(400).json({ message: 'Missing ID token or email' });
  }

  try {
    let googleUserInfo = { email, name };

    // Nếu có idToken, verify với Google
    if (idToken) {
      try {
        const googleResponse = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );
        googleUserInfo = {
          email: googleResponse.data.email,
          name: googleResponse.data.name,
        };
      } catch (tokenErr) {
        // Nếu idToken không hợp lệ, thử dùng như access token
        try {
          const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${idToken}` }
          });
          googleUserInfo = {
            email: userInfoRes.data.email,
            name: userInfoRes.data.name,
          };
        } catch (accessTokenErr) {
          console.error('Google token verification failed:', accessTokenErr);
          return res.status(400).json({ message: 'Invalid Google token' });
        }
      }
    }

    if (!googleUserInfo.email) {
      return res.status(400).json({ message: 'Email is required from Google' });
    }

    // Tìm user theo email hoặc tạo mới
    let user = await prisma.user.findUnique({ where: { email: googleUserInfo.email } });

    if (!user) {
      // Tạo user mới với passwordHash rỗng (social login)
      user = await prisma.user.create({
        data: {
          name: googleUserInfo.name || 'Google User',
          email: googleUserInfo.email,
          passwordHash: '', // Social login không cần password
        },
      });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Google login error:', err);
    if (err.response?.data) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
