const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const auth = require('../middlewares/authMiddleware'); 
const Reminder = require('../models/Reminder');

router.use(auth);

router.post('/', reminderController.createReminder);
router.get('/', reminderController.getReminders);
router.put('/:id/complete', reminderController.markComplete);


router.put('/by-document/:documentId', auth, async (req, res) => {
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
});

router.delete('/by-document/:documentId', auth, async (req, res) => {
  try {
    const { documentId } = req.params;

    const result = await Reminder.deleteMany({ documentId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'No reminders found for this document',
        documentId
      });
    }

    return res.json({
      message: 'Reminders deleted successfully',
      deletedCount: result.deletedCount,
      documentId
    });

  } catch (error) {

    res.status(500).json({
      message: 'Internal server error while deleting reminders',
      error: error.message
    });
  }
});

module.exports = router;