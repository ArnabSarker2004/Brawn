const express = require('express');

const {
    getBodyInfo,
    updateBody
} = require('../controllers/userController');

const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/getbodyinfo', getBodyInfo);
router.patch('/updatebody', updateBody);

module.exports = router;
