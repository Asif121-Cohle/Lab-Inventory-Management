const Schedule = require('../models/Schedule');
const Lab = require('../models/Lab');

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private (Professor only)
exports.createSchedule = async (req, res) => {
  try {
    const { labId, date, startTime, endTime, timeSlot, courseName, className, expectedStudents, purpose } = req.body;

    // Find lab
    const lab = await Lab.findOne({ $or: [{ _id: labId }, { id: labId }] });
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Check for conflicts
    const conflicts = await Schedule.find({
      lab: lab._id,
      date: new Date(date),
      status: { $ne: 'cancelled' },
      $or: [
        { timeSlot },
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } }
      ]
    }).populate('professor', 'username');

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Lab is already booked for this time slot',
        conflicts 
      });
    }

    const schedule = new Schedule({
      lab: lab._id,
      professor: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      timeSlot: timeSlot || `${startTime}-${endTime}`,
      courseName,
      className,
      expectedStudents,
      purpose
    });

    await schedule.save();

    await schedule.populate([
      { path: 'lab', select: 'name' },
      { path: 'professor', select: 'username email' }
    ]);

    res.status(201).json({ schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private (Lab Assistant)
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ status: { $ne: 'cancelled' } })
      .populate('lab', 'name')
      .populate('professor', 'username email')
      .sort({ date: 1, startTime: 1 });

    console.log('Schedules fetched, first professor field:', schedules[0]?.professor);
    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get professor's own schedules
// @route   GET /api/schedules/my-schedules
// @access  Private (Professor only)
exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ 
      professor: req.user._id,
      status: { $ne: 'cancelled' }
    })
      .populate('lab', 'name')
      .sort({ date: 1, startTime: 1 });

    res.json({ schedules });
  } catch (error) {
    console.error('Get my schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private (Professor only - own schedules)
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if professor owns this schedule
    if (schedule.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this schedule' });
    }

    if (schedule.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update cancelled schedule' });
    }

    // Update fields
    Object.assign(schedule, req.body);
    schedule.updatedAt = Date.now();
    await schedule.save();

    await schedule.populate([
      { path: 'lab', select: 'name' },
      { path: 'professor', select: 'username' }
    ]);

    res.json({ schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Cancel schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Professor only - own schedules)
exports.cancelSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if professor owns this schedule
    if (schedule.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this schedule' });
    }

    schedule.status = 'cancelled';
    schedule.updatedAt = Date.now();
    await schedule.save();

    res.json({ message: 'Schedule cancelled successfully' });
  } catch (error) {
    console.error('Cancel schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check availability
// @route   GET /api/schedules/check-availability
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { labId, date, time } = req.query;

    if (!labId || !date || !time) {
      return res.status(400).json({ message: 'Lab ID, date, and time are required' });
    }

    // Find lab
    const lab = await Lab.findOne({ $or: [{ _id: labId }, { id: labId }] });
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Parse time slot
    const [startTime, endTime] = time.split('-');

    // Find conflicts
    const conflicts = await Schedule.find({
      lab: lab._id,
      date: new Date(date),
      status: { $ne: 'cancelled' },
      $or: [
        { timeSlot: time },
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } }
      ]
    })
      .populate('professor', 'username')
      .populate('lab', 'name');

    if (conflicts.length > 0) {
      return res.json({ 
        available: false,
        conflicts 
      });
    }

    res.json({ available: true, conflicts: [] });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
