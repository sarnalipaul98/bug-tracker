
const express = require('express');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE PROJECT
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description'
      });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET ALL PROJECTS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { teamMembers: req.user.id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE PROJECT
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE PROJECT
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


const User = require('../models/User');

// ADD TEAM MEMBER
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You are already the project creator'
      });
    }

    if (project.teamMembers.some(
      member => member.toString() === user._id.toString()
    )) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    project.teamMembers.push(user._id);
    await project.save();

    res.json({
      success: true,
      message: 'Team member added successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// REMOVE TEAM MEMBER
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    project.teamMembers = project.teamMembers.filter(
      member => member.toString() !== req.params.userId
    );

    await project.save();

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;
