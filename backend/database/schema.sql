-- Dental clinic database schema (MySQL 8.0+ / MariaDB 10.4+)
-- Run once:  mysql -u root -p < backend/database/schema.sql
-- Then create a least-privilege app user (see README). Do not run the app as root.

CREATE DATABASE IF NOT EXISTS dental_clinic
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dental_clinic;

CREATE TABLE IF NOT EXISTS doctors (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(120) NOT NULL,
  specialization VARCHAR(120) NOT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt hash only, never plain text
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference         VARCHAR(24)  NOT NULL UNIQUE,
  client_request_id CHAR(36)     NOT NULL UNIQUE,   -- idempotency key from the browser
  patient_name      VARCHAR(100) NOT NULL,
  phone             VARCHAR(20)  NOT NULL,
  email             VARCHAR(190) NOT NULL,
  doctor_id         INT UNSIGNED NOT NULL,
  treatment         VARCHAR(100) NOT NULL,
  appointment_date  DATE         NOT NULL,
  time_slot         VARCHAR(5)   NOT NULL,           -- 'HH:MM'
  message           VARCHAR(500) NULL,
  status            ENUM('Pending','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Pending',

  -- Double-booking guard: only non-cancelled bookings carry a key, so a cancelled slot
  -- can be rebooked. NULLs are not considered duplicates by the unique index.
  active_slot_key   VARCHAR(64) GENERATED ALWAYS AS (
    IF(status = 'Cancelled', NULL,
       CONCAT(doctor_id, '|', DATE_FORMAT(appointment_date, '%Y-%m-%d'), '|', time_slot))
  ) STORED,
  UNIQUE KEY uq_active_slot (active_slot_key),

  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_appointments_date (appointment_date),
  KEY idx_appointments_status (status),
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id)
) ENGINE=InnoDB;

-- Demo doctors. IDs must match frontend/src/data/doctors.js. Replace with real clinic staff.
INSERT IGNORE INTO doctors (id, full_name, specialization) VALUES
  (1, 'Dr. Demo Name One',   'General & Preventive Dentistry'),
  (2, 'Dr. Demo Name Two',   'Restorative & Cosmetic Dentistry'),
  (3, 'Dr. Demo Name Three', 'Orthodontics & Pediatric Dentistry');
