// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['Tech', 'Cultural', 'Sports', 'Intra College', 'Inter College', 'Workshop', 'Seminar', 'Other'],
    default: 'Other'
  },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Stored as "HH:MM"
  venue: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registeredCollege: { type: String, trim: true },
    isAttended: { type: Boolean, default: false },
    paymentId: { type: String } // For mock payment simulation
  }],
  posterUrl: { type: String, default: '' },
  qrCodeId: { type: String, unique: true, sparse: true },

  // New Fields
  eventMode: { type: String, enum: ['Online', 'Offline'], required: true, default: 'Offline' },
  meetingLink: { type: String },
  registrationLimit: { type: Number, default: 0 }, // 0 means no limit
  registrationFee: { type: Number, default: 0 },
  attendanceQuestion: {
    question: { type: String },
    options: [{ type: String }],
    correctAnswer: { type: String }
  },
  certificateTemplateUrl: { type: String, default: '' } // Path to the uploaded PDF template
}, { timestamps: true });

// Pre-save hook to generate a unique qrCodeId for every new event
eventSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCodeId) {
    this.qrCodeId = new mongoose.Types.ObjectId().toHexString();
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);