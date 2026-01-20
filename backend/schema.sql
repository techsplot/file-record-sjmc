-- PostgreSQL Schema for SJMC File System
-- Run this script in your PostgreSQL database to set up tables

-- Note: PostgreSQL does not support CREATE DATABASE IF NOT EXISTS in standard SQL
-- You may need to create the database manually or use psql command:
-- createdb sjmc

-- Connect to the database (use \c sjmc in psql)
-- \c sjmc;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS emergency_files;
DROP TABLE IF EXISTS referral_files;
DROP TABLE IF EXISTS family_files;
DROP TABLE IF EXISTS personal_files;

-- Table for Personal Files
CREATE TABLE personal_files (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

-- Table for Family Files
CREATE TABLE family_files (
    id VARCHAR(255) PRIMARY KEY,
    headName VARCHAR(255) NOT NULL,
    memberCount INTEGER NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

-- Table for Referral Files
CREATE TABLE referral_files (
    id VARCHAR(255) PRIMARY KEY,
    referralName VARCHAR(255) NOT NULL,
    patientCount INTEGER NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

-- Table for Emergency Files
CREATE TABLE emergency_files (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

-- Seed data for testing
INSERT INTO personal_files (id, name, age, gender, registrationDate, expiryDate) VALUES
('SJMC-1', 'John Doe', 34, 'Male', NOW() - INTERVAL '5 days', NOW() + INTERVAL '1 year'),
('SJMC-2', 'Jane Smith', 28, 'Female', NOW() - INTERVAL '12 days', NOW() + INTERVAL '1 year'),
('SJMC-3', 'Peter Jones', 52, 'Male', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days'),
('SJMC-4', 'Mary Williams', 41, 'Female', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 year');

INSERT INTO family_files (id, headName, memberCount, registrationDate, expiryDate) VALUES
('FAM-1', 'Michael Miller', 4, NOW() - INTERVAL '20 days', NOW() + INTERVAL '2 years'),
('FAM-2', 'Jessica Wilson', 3, NOW() - INTERVAL '60 days', NOW() + INTERVAL '2 years');

INSERT INTO referral_files (id, referralName, patientCount, registrationDate, expiryDate) VALUES
('REF-1', 'Dr. Anderson', 12, NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 years'),
('REF-2', 'General Hospital', 45, NOW() - INTERVAL '180 days', NOW() - INTERVAL '5 days');

INSERT INTO emergency_files (id, name, age, gender, registrationDate, expiryDate) VALUES
('EMG-1', 'Anonymous Patient 1', 45, 'Male', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 year');
