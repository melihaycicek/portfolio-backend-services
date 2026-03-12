const express = require('express');

/**
 * POST /api/analytics
 * Receives analytics events from the frontend and stores them in MySQL.
 */
module.exports = function analyticsRoutes(pool) {
  const router = express.Router();

  router.post('/analytics', async (req, res) => {
    try {
      const { event, properties, timestamp, sessionId, page } = req.body;

      if (!event || !sessionId) {
        return res.status(400).json({ error: 'Missing required fields: event, sessionId' });
      }

      // Truncate event name to prevent abuse
      const safeEvent = String(event).slice(0, 100);
      const safeSessionId = String(sessionId).slice(0, 64);
      const safePage = String(page || '/').slice(0, 255);

      await pool.execute(
        `INSERT INTO analytics_events (event_name, properties, session_id, page, event_timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [
          safeEvent,
          properties ? JSON.stringify(properties) : null,
          safeSessionId,
          safePage,
          timestamp ? new Date(timestamp) : new Date(),
        ]
      );

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('Analytics error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
