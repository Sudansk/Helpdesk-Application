const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getTeamPerformance,
  getTeamReportByPriority,
  getTeamReportByStatus,
  getAgentWorkload,
  getTeamSummary
} = require('../controllers/managerController');
const { authenticate, authorize } = require('../middleware/auth');

// All manager routes require authentication and ONLY manager role (strict separation)
router.use(authenticate);
router.use(authorize('manager'));

router.get('/team-members', getTeamMembers);
router.get('/performance', getTeamPerformance);
router.get('/report/priority', getTeamReportByPriority);
router.get('/report/status', getTeamReportByStatus);
router.get('/workload', getAgentWorkload);
router.get('/summary', getTeamSummary);

module.exports = router;
