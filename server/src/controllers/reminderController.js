const Reminder = require('../models/Reminder');  

exports.createReminder = async (req, res) => {
  try {
    const { documentId, documentTitle, submissionDate } = req.body;
    
    if (!documentId || !documentTitle || !submissionDate) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { documentId, documentTitle, submissionDate }
      });
    }

    const reminder = new Reminder({ 
      documentId,
      documentTitle,
      submissionDate: new Date(submissionDate),
      isCompleted: false,
      isDeleted: false
    });
    
    const savedReminder = await reminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      error: error.toString()
    });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const currentDate = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(currentDate.getDate() + 10);

    const reminders = await Reminder.find({ 
      submissionDate: { 
        $gte: currentDate,
        $lte: tenDaysFromNow
      },
      isDeleted: false,
      isCompleted: false
    }).select('_id documentTitle submissionDate');

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markComplete = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(  
      req.params.id,
      { isCompleted: true },
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRemindersByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const updateData = {
      documentTitle: req.body.documentTitle,
      category: req.body.category,
      documentType: req.body.documentType,
      preparedBy: req.body.preparedBy,
      submissionDate: req.body.submissionDate,
      description: req.body.description
    };

    const result = await Reminder.updateMany(
      { documentId },
      { $set: updateData },
      { new: true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: 'No reminders found for this document',
        documentId
      });
    }

    return res.json({
      message: 'Reminders updated successfully',
      updatedCount: result.modifiedCount,
      documentId,
      updates: updateData
    });

  } catch (error) {
    res.status(500).json({
      message: 'Internal server error while updating reminders',
      error: error.message
    });
  }
};