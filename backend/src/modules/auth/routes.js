const express = require('express');
const router = express.Router();
const { register, login, me, updateMe, changePassword, facebookLogin, googleLogin } = require('./service');
const { authMiddleware } = require('./middleware');

router.post('/register', async (req, res, next) => {
  try {
    await register(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
});
router.post('/facebook', facebookLogin);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, me);
router.patch('/me', authMiddleware, updateMe);
router.patch('/change-password', authMiddleware, changePassword);

module.exports = router;
