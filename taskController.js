const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Helper to check if user has access to a project
 */
const hasProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) return { access: false, project: null };
  if (role === 'admin') return { access: true, project };

  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some((m) => m.toString() === userId.toString());
  return { access: isOwner || isMember, project };
};

/**
 * @desc    Get all tasks (optionally filtered by project or assignee)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const { project, assignedTo, status, priority } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Members can only see tasks assigned to them or in their projects
    if (req.user.role === 'member') {
      // Get projects the member belongs to
      const memberProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');

      const projectIds = memberProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get dashboard stats
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    let taskFilter = {};
    let projectFilter = {};

    if (req.user.role === 'member') {
      const memberProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);
      taskFilter.project = { $in: projectIds };
      projectFilter._id = { $in: projectIds };
    }

    const now = new Date();

    const [totalTasks, completedTasks, inProgressTasks, overdueTasks, totalProjects] =
      await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: 'completed' }),
        Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
        Task.countDocuments({
          ...taskFilter,
          dueDate: { $lt: now },
          status: { $ne: 'completed' },
        }),
        Project.countDocuments(projectFilter),
      ]);

    // Tasks per user (top 5)
    const tasksPerUser = await Task.aggregate([
      { $match: { ...taskFilter, assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          total: 1,
          completed: 1,
        },
      },
    ]);

    // Recent activity (last 5 completed tasks)
    const recentCompleted = await Task.find({ ...taskFilter, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name')
      .populate('project', 'name color');

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        todoTasks: totalTasks - completedTasks - inProgressTasks,
        totalProjects,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksPerUser,
      recentCompleted,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create a task
 * @route   POST /api/tasks
 * @access  Private/Admin
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, project, assignedTo, dueDate, tags } = req.body;

    // Verify project exists and user has access
    const { access } = await hasProjectAccess(project, req.user._id, req.user.role);
    if (!access) {
      return res.status(403).json({ success: false, message: 'No access to this project' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      tags: tags || [],
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');

    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role === 'member') {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }
      // Members can only update status
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Members can only update task status' });
      }
      task.status = status;
      await task.save();
      await task.populate('assignedTo', 'name email');
      await task.populate('project', 'name color');
      return res.json({ success: true, message: 'Task status updated', task });
    }

    // Admin can update everything
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name color');

    res.json({ success: true, message: 'Task updated', task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getTasks, getTask, getStats, createTask, updateTask, deleteTask };
