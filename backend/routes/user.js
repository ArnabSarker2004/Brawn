const express = require('express');

const {
    getBodyInfo,
    createBody
} = require('../controllers/userController');

const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', getBodyInfo);
router.post('/', createBody);

module.exports = router;
