# Refactoring Demonstration: Legacy vs. Refactored Code

Below is a side-by-side comparison showing how an unmaintainable legacy route handler is refactored into clean, production-grade code.

---

## ❌ Legacy Code (Before)
```javascript
// Everything in a single route handler, direct query, no validation
app.post('/api/leads/update-status', async (req, res) => {
const { id, status } = req.body;

// Direct DB mutation without input validation or auth check
const lead = await db.collection('leads').updateOne(
    { _id: id },
    { $set: { status: status } }
);

res.send({ success: true, lead });
});
```

## ✅ Refactored Architecture (After)
### 1. Controller Layer (controllers/leadController.js)
```javascript
const leadService = require('../services/leadService');

exports.updateLeadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedLead = await leadService.changeStatus(id, status, req.user);
        res.status(200).json({ message: 'Status updated', lead: updatedLead });
    } catch (error) {
        next(error); // Pass to centralized error handler
    }
};
```

### 2. Service Layer (services/leadService.js)
```javascript
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');

exports.changeStatus = async (leadId, newStatus, user) => {
    const allowedStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'];
    if (!allowedStatuses.includes(newStatus)) {
        const err = new Error('Invalid status value');
        err.statusCode = 400;
        throw err;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
        const err = new Error('Lead not found');
        err.statusCode = 404;
        throw err;
    }

    // Authorization rule check
    if (user.role === 'MEMBER' && lead.assignedTo?.toString() !== user.id) {
        const err = new Error('Forbidden: Unassigned access');
        err.statusCode = 403;
        throw err;
    }

    const prevStatus = lead.status;
    lead.status = newStatus;
    await lead.save();

    await ActivityLog.create({
        leadId: lead._id,
        action: `Status changed from ${prevStatus} to ${newStatus}`,
        performedBy: user.id
    });

    return lead;
};
```