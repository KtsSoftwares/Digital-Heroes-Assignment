const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true, collection: 'Notes' });

module.exports = mongoose.model('Note', noteSchema);