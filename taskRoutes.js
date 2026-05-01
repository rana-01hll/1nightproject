const express = require('express');
const { getTasks, getTask, getStats, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getTasks).post(authorize('admin'), createTask);
router.route('/:id').get(getTask).put(updateTask).delete(authorize('admin'), deleteTask);

module.exports = router;