// backend/routes/events.js
const express = require('express');
const crypto = require('crypto');
const Event = require('../models/Event');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const { uploadPoster, uploadCertTemplate } = require('../middleware/upload');
const { sendRegistrationConfirmationEmail } = require('../utils/emailService');

const router = express.Router();

// Create a new event (Club role)
router.post('/create', verifyToken, uploadPoster.single('poster'), async (req, res) => {
    if (req.user.role !== 'club') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { title, description, date, time, type, venue, eventMode, meetingLink, registrationLimit, registrationFee, attendanceQuestion } = req.body;
    
    try {
        let parsedQuestion = null;
        if (attendanceQuestion) {
            try {
                parsedQuestion = JSON.parse(attendanceQuestion);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid format for attendance question data.' });
            }
        }

        const event = await Event.create({
            title, description, date, time, type, venue, eventMode,
            meetingLink: eventMode === 'Online' ? meetingLink : undefined,
            registrationLimit: Number(registrationLimit) || 0,
            registrationFee: Number(registrationFee) || 0,
            createdBy: req.user.id,
            posterUrl: req.file ? `/uploads/posters/${req.file.filename}` : '',
            attendanceQuestion: parsedQuestion
        });
        res.status(201).json(event);
    } catch (err) {
        console.error('Event creation failed:', err);
        res.status(500).json({ error: 'Event creation failed', details: err.message });
    }
});

// Get all events (publicly accessible)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'name')
            .populate('attendees.userId', 'name email')
            .sort({ date: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Student registers for an event
router.post('/:id/register', verifyToken, async (req, res) => {
    const eventId = req.params.id;
    const studentId = req.user.id;
    const { collegeName } = req.body;
    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.status !== 'approved') return res.status(400).json({ error: 'Cannot register for this event.' });
         // --- START OF FIX: Prevent registration for past events ---
        const now = new Date();
        const eventDateTime = new Date(event.date);
        if (event.time) {
            const [hours, minutes] = event.time.split(':');
            eventDateTime.setHours(hours, minutes, 0, 0);
        }
        if (eventDateTime < now) {
            return res.status(400).json({ error: 'This event has already passed and registration is closed.' });
        }
        // --- END OF FIX ---
        if (event.attendees.some(a => a.userId.equals(studentId))) return res.status(400).json({ error: 'You are already registered.' });
        if (event.registrationLimit > 0 && event.attendees.length >= event.registrationLimit) return res.status(400).json({ error: 'Sorry, this event is full.' });

        let paymentId = null;
        if (event.registrationFee > 0) {
            console.log(`Simulating payment of ${event.registrationFee} for event ${event.title}`);
            paymentId = `mock_payment_${crypto.randomBytes(8).toString('hex')}`;
        }
        
        event.attendees.push({ userId: studentId, registeredCollege: collegeName, paymentId });
        await event.save();
        const student = await User.findById(studentId);
        await sendRegistrationConfirmationEmail(student.email, event);
        res.json({ message: 'Registered successfully!', event });
    } catch (err) {
        console.error('Registration failed:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// QR Attendance Submission
router.post('/:qrCodeId/qr-attendance', async (req, res) => {
    const { qrCodeId } = req.params;
    const { email, name, answer } = req.body;
    try {
        const event = await Event.findOne({ qrCodeId }).populate('attendees.userId');
        if (!event || event.status !== 'approved') return res.status(404).json({ error: 'Event not found or not active.' });
        
        const attendeeRecord = event.attendees.find(a => a.userId && a.userId.email.toLowerCase() === email.toLowerCase());
        if (!attendeeRecord) return res.status(400).json({ error: 'You are not registered for this event.' });
        if (attendeeRecord.isAttended) return res.status(400).json({ error: 'Attendance already marked.' });

        if (event.attendanceQuestion && event.attendanceQuestion.question) {
            if (!answer || event.attendanceQuestion.correctAnswer.toLowerCase() !== answer.toLowerCase()) {
                return res.status(401).json({ error: 'Incorrect answer to the verification question.' });
            }
        }

        attendeeRecord.isAttended = true;
        await event.save();
        res.json({ message: 'Attendance marked successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error marking attendance.' });
    }
});

// Manual Attendance Marking (Club/Admin)
router.post('/:eventId/manual-attendance', verifyToken, async (req, res) => {
    if (!['club', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Access denied.' });
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ error: 'Event not found.' });
        if (req.user.role === 'club' && !event.createdBy.equals(req.user.id)) {
            return res.status(403).json({ error: 'You can only manage your own events.' });
        }
        const attendee = event.attendees.find(a => a.userId.equals(req.body.studentId));
        if (!attendee) return res.status(400).json({ error: 'Student not registered.' });
        attendee.isAttended = true;
        await event.save();
        res.json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Update Event Status (Admin)
router.patch('/:id/status', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only admin can approve/reject events' });
    }
    try {
      const event = await Event.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
      if (!event) return res.status(404).json({ error: 'Event not found' });
      res.json(event);
    } catch (err) {
      res.status(400).json({ error: 'Event status update failed' });
    }
});

// Certificate Template Upload (Club)
router.post('/:id/upload-certificate-template', verifyToken, uploadCertTemplate.single('certificate'), async (req, res) => {
    if (req.user.role !== 'club') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    try {
        const event = await Event.findById(req.params.id);
        if (!event || !event.createdBy.equals(req.user.id)) {
            return res.status(404).json({ error: 'Event not found or you are not the owner.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file was uploaded.' });
        }
        event.certificateTemplateUrl = `/uploads/cert_templates/${req.file.filename}`;
        await event.save();
        res.json({ message: 'Certificate template uploaded successfully!', event });
    } catch (err) {
        console.error("Certificate template upload error:", err);
        res.status(500).json({ error: 'Server error while uploading template.' });
    }
});

// Event Recommendation System (Student)

// --- START OF FIX: Event Recommendation System Now Filters by Date ---
router.get('/recommended', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied' });
  try {
    const attendedEvents = await Event.find({ "attendees.userId": req.user.id, "attendees.isAttended": true, status: 'approved' });
    const attendedEventTypes = [...new Set(attendedEvents.map(event => event.type))];
    
    // Create a date object for the beginning of today (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let recommendedEvents;
    const queryConditions = {
        status: 'approved',
        "attendees.userId": { $ne: req.user.id },
        date: { $gte: today } // Only find events on or after today
    };

    if (attendedEventTypes.length > 0) {
      // If user has attended events, find similar upcoming events
      recommendedEvents = await Event.find({
        ...queryConditions,
        type: { $in: attendedEventTypes },
      }).limit(5).populate('createdBy', 'name');
    } else {
      // Fallback for new users: find any upcoming events
      recommendedEvents = await Event.find(queryConditions)
      .limit(5).populate('createdBy', 'name');
    }
    res.json(recommendedEvents);
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});
// --- END OF FIX ---

module.exports = router;