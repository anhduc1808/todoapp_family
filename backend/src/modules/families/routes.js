const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../auth/middleware');
const service = require('./service');

router.use(authMiddleware);

router.get('/', service.listFamilies);
router.post('/', service.createFamily);
router.post('/join', service.joinFamilyByCode);
router.get('/:id', service.getFamilyDetail);
router.post('/:id/invite', service.createInviteCode);
router.patch('/:familyId/members/:memberId/role', service.updateMemberRole);

module.exports = router;
