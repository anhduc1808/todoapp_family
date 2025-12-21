const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../auth/middleware');
const service = require('./service');

router.use(authMiddleware);

// Routes phải được đặt theo thứ tự: routes cụ thể trước, routes có parameter sau
router.get('/', service.listFamilies);
router.post('/', service.createFamily);
router.post('/join', service.joinFamilyByCode); // QUAN TRỌNG: Phải đặt trước route /:id
router.get('/:id', service.getFamilyDetail);
router.post('/:id/invite', service.createInviteCode);
router.patch('/:familyId/members/:memberId/role', service.updateMemberRole);

module.exports = router;
