
const express = require('express');
const mongoose = require('mongoose');

const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all ticket routes
router.use(authMiddleware);

// CREATE TICKET
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, status, assignee, projectId } = req.body;

    if (!title || !description || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and project are required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const isOwner = String(project.createdBy) === String(req.user.id);
    const isMember = project.teamMembers.some(
      member => String(member) === String(req.user.id)
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project.'
      });
    }

    if (assignee) {
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignee ID.'
        });
      }

      const memberExists = project.teamMembers.some(
        member => String(member) === String(assignee)
      );

      if (!memberExists && String(project.createdBy) !== String(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must belong to this project.'
        });
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status,
      assignee: assignee || null,
      projectId
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully!',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// LIST TICKETS BY PROJECT
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID.'
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const isOwner = String(project.createdBy) === String(req.user.id);
    const isMember = project.teamMembers.some(
      member => String(member) === String(req.user.id)
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project.'
      });
    }

    const tickets = await Ticket.find({ projectId })
      .populate('assignee', 'name email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE TICKET
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    const project = await Project.findById(ticket.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const isOwner = String(project.createdBy) === String(req.user.id);
    const isMember = project.teamMembers.some(
      member => String(member) === String(req.user.id)
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project.'
      });
    }

    const { title, description, priority, status } = req.body;

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) ticket.priority = priority;
    if (status !== undefined) ticket.status = status;

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket updated successfully!',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE TICKET
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    const project = await Project.findById(ticket.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    if (String(project.createdBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete tickets.'
      });
    }

    await ticket.deleteOne();

    res.json({
      success: true,
      message: 'Ticket deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ASSIGN TICKET
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID.'
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    const project = await Project.findById(ticket.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    if (String(project.createdBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can assign tickets.'
      });
    }

    if (assignee === null || assignee === '') {
      ticket.assignee = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignee ID.'
        });
      }

      const isMember = project.teamMembers.some(
        member => String(member) === String(assignee)
      );

      if (!isMember && String(project.createdBy) !== String(assignee)) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must belong to this project.'
        });
      }

      const user = await User.findById(assignee);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Assignee not found.'
        });
      }

      ticket.assignee = assignee;
    }

    await ticket.save();
    await ticket.populate('assignee', 'name email');

    res.json({
      success: true,
      message: 'Ticket assigned successfully!',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
