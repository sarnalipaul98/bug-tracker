
const express = require('express');
const mongoose = require('mongoose');

const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all comment routes
router.use(authMiddleware);

// CHECK TICKET ACCESS
const checkTicketAccess = async (ticketId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return { error: 'Invalid ticket ID.', status: 400 };
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return { error: 'Ticket not found.', status: 404 };
  }

  const project = await Project.findById(ticket.projectId);

  if (!project) {
    return { error: 'Project not found.', status: 404 };
  }

  const isOwner = String(project.createdBy) === String(userId);
  const isMember = project.teamMembers.some(
    member => String(member) === String(userId)
  );

  if (!isOwner && !isMember) {
    return {
      error: 'You do not have access to this ticket.',
      status: 403
    };
  }

  return { ticket };
};

// ADD COMMENT
router.post('/:ticketId', async (req, res) => {
  try {
    const access = await checkTicketAccess(
      req.params.ticketId,
      req.user.id
    );

    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty.'
      });
    }

    const comment = await Comment.create({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      text: text.trim()
    });

    await comment.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully!',
      comment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET COMMENT HISTORY
router.get('/:ticketId', async (req, res) => {
  try {
    const access = await checkTicketAccess(
      req.params.ticketId,
      req.user.id
    );

    if (access.error) {
      return res.status(access.status).json({
        success: false,
        message: access.error
      });
    }

    const comments = await Comment.find({
      ticketId: req.params.ticketId
    })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: comments.length,
      comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
