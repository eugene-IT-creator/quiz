const TestController = require('../controllers/test.controller');
const MiddlewareUtils = require('../utils/middleware.utils');
const express = require('express');
const router = express.Router();

router.get('/', MiddlewareUtils.validateUser, TestController.getTests);
router.get('/results', MiddlewareUtils.validateUser, TestController.getTestResults);
router.get('/:id', MiddlewareUtils.validateUser, TestController.getTest);
router.post('/:id/pass', MiddlewareUtils.validateUser, TestController.passTest);
router.get('/:id/result', MiddlewareUtils.validateUser, TestController.getTestResult);
router.get('/:id/result/details', MiddlewareUtils.validateUser, TestController.getTestWithResults);

module.exports = router;