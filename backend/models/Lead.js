const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: '' },
    status: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'],
        default: 'NEW'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true, collection: 'Leads' });

module.exports = mongoose.model('Lead', leadSchema);