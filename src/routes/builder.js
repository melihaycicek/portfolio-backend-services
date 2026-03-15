const express = require('express');

/**
 * POST /api/builder-lead
 * Receives builder form submissions and stores them in MySQL.
 */
module.exports = function builderRoutes(pool) {
  const router = express.Router();

  router.post('/builder-lead', async (req, res) => {
    try {
      const {
        industry, scale, users, platforms, capabilities, modules,
        roleComplexity, dataSensitivity, realtimeLevel, integrations,
        reporting, notifications, mobileUsage, aiUsage,
        showAdvanced, infrastructure, backend, database, streaming, ai, frontend,
        tier, tierLabel, name, email, company, note, submittedAt,
      } = req.body;

      // Basic validation
      if (!name || !email || !industry) {
        return res.status(400).json({ error: 'Missing required fields: name, email, industry' });
      }

      // Simple email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      await pool.execute(
        `INSERT INTO builder_leads (
          name, email, company, note, industry, scale_level, user_type,
          platforms, capabilities, modules,
          role_complexity, data_sensitivity, realtime_level, integrations,
          reporting, notifications, mobile_usage, ai_usage,
          show_advanced, infra_choice, backend_choice, db_choice,
          streaming_choice, ai_choice, frontend_choice,
          tier, tier_label, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, email, company || null, note || null,
          industry, scale || null, users || null,
          platforms ? JSON.stringify(platforms) : null,
          capabilities ? JSON.stringify(capabilities) : null,
          modules ? JSON.stringify(modules) : null,
          roleComplexity || null, dataSensitivity || null, realtimeLevel || null,
          integrations || null, reporting || null, notifications || null,
          mobileUsage || null, aiUsage || null,
          showAdvanced ? 1 : 0,
          infrastructure || null, backend || null, database || null,
          streaming || null, ai || null, frontend || null,
          tier || null, tierLabel || null,
          submittedAt ? new Date(submittedAt) : new Date(),
        ]
      );

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('Builder lead error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
