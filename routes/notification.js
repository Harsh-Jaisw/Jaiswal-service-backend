const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validator = require('../middleware/joiValidator');
const reqValidator = require('../middleware/reqValidator');

module.exports = (router) => {
  // Mark notification as read
  app.put('/notifications/:notificationId/read', async (req, res) => {
    const notificationId = req.params.notificationId;
    try {
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  // Get in-app notifications for a user
  app.get('/notifications/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Send notification
  app.post('/send-notification', async (req, res) => {
    const { userId, title, message, notificationTypes } = req.body;
    try {
      await sendNotification(userId, title, message, notificationTypes);
      res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
      console.error('Error sending notifications:', error);
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  });
};
