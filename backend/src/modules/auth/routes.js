const express = require('express');
const router = express.Router();
const { register, login, me, updateMe, changePassword, facebookLogin, facebookAuth, facebookCallback, googleLogin } = require('./service');
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
router.get('/facebook', async (req, res, next) => {
  try {
    await facebookAuth(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/facebook/callback', async (req, res, next) => {
  try {
    await facebookCallback(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/facebook', async (req, res, next) => {
  try {
    await facebookLogin(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    await googleLogin(req, res);
  } catch (error) {
    next(error);
  }
});
router.get('/me', authMiddleware, me);
router.patch('/me', authMiddleware, updateMe);
router.patch('/change-password', authMiddleware, changePassword);

module.exports = router;
