-- Portfolio Backend Services - Database Schema
-- Run this against your MySQL database to create the required tables.

CREATE TABLE IF NOT EXISTS builder_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  industry VARCHAR(100) NOT NULL,
  scale_level VARCHAR(50) DEFAULT NULL,
  user_type VARCHAR(50) DEFAULT NULL,
  platforms JSON DEFAULT NULL,
  capabilities JSON DEFAULT NULL,
  modules JSON DEFAULT NULL,
  role_complexity VARCHAR(50) DEFAULT NULL,
  data_sensitivity VARCHAR(50) DEFAULT NULL,
  realtime_level VARCHAR(50) DEFAULT NULL,
  integrations VARCHAR(50) DEFAULT NULL,
  reporting VARCHAR(50) DEFAULT NULL,
  notifications VARCHAR(50) DEFAULT NULL,
  mobile_usage VARCHAR(50) DEFAULT NULL,
  ai_usage VARCHAR(50) DEFAULT NULL,
  show_advanced TINYINT(1) DEFAULT 0,
  infra_choice VARCHAR(50) DEFAULT NULL,
  backend_choice VARCHAR(50) DEFAULT NULL,
  db_choice VARCHAR(50) DEFAULT NULL,
  streaming_choice VARCHAR(50) DEFAULT NULL,
  ai_choice VARCHAR(50) DEFAULT NULL,
  frontend_choice VARCHAR(50) DEFAULT NULL,
  tier VARCHAR(50) DEFAULT NULL,
  tier_label VARCHAR(100) DEFAULT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_industry (industry),
  INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  properties JSON DEFAULT NULL,
  session_id VARCHAR(64) NOT NULL,
  page VARCHAR(255) DEFAULT '/',
  event_timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event (event_name),
  INDEX idx_session (session_id),
  INDEX idx_timestamp (event_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
