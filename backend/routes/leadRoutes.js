const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');
const Note = require('../models/Note');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Public route to capture leads (No Auth Required)
router.post('/public', async (req, res) => {
    let session;

    try {
        const { name, email, company } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const [newLead] = await Lead.create(
            [{ name, email, company }],
            { session }
        );

        await ActivityLog.create(
            [{
                leadId: newLead._id,
                action: 'Lead Submitted via Public Form',
                performedBy: null
            }],
            { session }
        );

        await session.commitTransaction();
        res.status(201).json({ message: 'Lead submitted successfully', lead: newLead });
    } catch (error) {
        if (session && session.inTransaction()) await session.abortTransaction();
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        if (session) session.endSession();
    }
});

// GET /api/leads - Paginated list & filtered leads
router.get('/', authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        // MEMBER role only sees assigned leads
        if (req.user.role === 'MEMBER') {
            query.assignedTo = req.user.id;
        }

        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Lead.countDocuments(query);

        res.json({
            leads,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PATCH /api/leads/:id/status - Update lead status (ADMIN & MEMBER)
router.patch('/:id/status', authenticate, async (req, res) => {
    let session = null;

    try {
        const { status } = req.body;
        const allowedStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Check if the lead exists
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Permission check: MEMBER can only update leads assigned to them
        if (req.user.role === 'MEMBER' && lead.assignedTo?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your assigned leads' });
        }

        session = await mongoose.startSession();
        session.startTransaction();

        const previousStatus = lead.status;
        lead.status = status;
        await lead.save({ session });

        // Log the status change activity
        await ActivityLog.create(
            [{
                leadId: lead._id,
                action: `Status changed from ${previousStatus} to ${status}`,
                performedBy: req.user.id
            }],
            { session }
        );

        await session.commitTransaction();

        res.json({ message: 'Lead status updated successfully' });
    } catch (error) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        if (session) {
            session.endSession();
        }
    }
});

// PATCH /api/leads/:id/assign - ADMIN only
router.patch('/:id/assign', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true }
        );

        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        await ActivityLog.create({
            leadId: lead._id,
            action: `Lead assigned to ${assignedTo}`,
            performedBy: req.user.id
        });

        res.json({ message: 'Lead assignment updated', lead });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/leads/:id/notes - Add a note to a lead (ADMIN & MEMBER)
router.post('/:id/notes', authenticate, async (req, res) => {
    let session = null;
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Note text is required' });

        session = await mongoose.startSession();
        session.startTransaction();

        const note = await Note.create([{
            leadId: req.params.id,
            authorId: req.user.id,
            text
        }], { session });

        // Add activity log entry
        await ActivityLog.create([{
            leadId: req.params.id,
            action: 'Added a note',
            performedBy: req.user.id
        }], { session });

        await session.commitTransaction();

        res.status(201).json({ message: 'Note added successfully', note });
    } catch (error) {
        if (session && session.inTransaction()) await session.abortTransaction();
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        if (session) session.endSession();
    }
});

// GET /api/leads/:id/activity - Fetch notes & activity trail for a lead
router.get('/:id/activity', authenticate, async (req, res) => {
    try {
        const notes = await Note.find({ leadId: req.params.id })
            .populate('authorId', 'name email')
            .sort({ createdAt: -1 });

        if (!notes) return res.status(404).json({ message: 'notes not found' });

        const activities = await ActivityLog.find({ leadId: req.params.id })
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 });

        if (!activities) return res.status(404).json({ message: 'activities not found' });

        res.json({ notes, activities });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;