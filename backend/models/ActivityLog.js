const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    action: { type: String, required: true }, // e.g., "Lead Submitted", "Status Updated", "Note Added"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // null if done by public user
}, { timestamps: true, collection: 'ActivityLogs' });

module.exports = mongoose.model('ActivityLog', activityLogSchema);