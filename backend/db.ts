import pg from 'pg';
import { PersonalFile, FamilyFile, ReferralFile, EmergencyFile, NewPersonalFile, NewFamilyFile, NewReferralFile, NewEmergencyFile, Gender } from '../types.js';
// FIX: Changed date-fns import to use a named import for `addYears` to resolve "not callable" error.
import { addYears } from 'date-fns';

const { Pool } = pg;

// --- POSTGRESQL DATABASE CONNECTION & SETUP ---
// 1. Create a .env file in the `backend` directory.
// 2. Add your PostgreSQL connection details to the .env file:
//    DB_HOST=your_host
//    DB_USER=your_user
//    DB_PASSWORD=your_password
//    DB_NAME=sjmc
//    DB_PORT=5432
// 3. Create the `sjmc` database in your PostgreSQL server.
// 4. Run the SQL commands from backend/schema.sql to create the necessary tables and seed data.
// 5. Run `npm install` in the `backend` directory to install `pg`.
/*
-- SQL SCHEMA FOR POSTGRESQL
-- You can run this script in your PostgreSQL client to set up the database.
-- See backend/schema.sql for the complete schema.

CREATE TABLE personal_files (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

CREATE TABLE family_files (
    id VARCHAR(255) PRIMARY KEY,
    headName VARCHAR(255) NOT NULL,
    memberCount INTEGER NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

CREATE TABLE referral_files (
    id VARCHAR(255) PRIMARY KEY,
    referralName VARCHAR(255) NOT NULL,
    patientCount INTEGER NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

CREATE TABLE emergency_files (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    registrationDate TIMESTAMP NOT NULL,
    expiryDate TIMESTAMP NOT NULL
);

-- Seed data examples (use PostgreSQL INTERVAL syntax)
INSERT INTO personal_files (id, name, age, gender, registrationDate, expiryDate) VALUES
('SJMC-1', 'John Doe', 34, 'Male', NOW() - INTERVAL '5 days', NOW() + INTERVAL '1 year');

*/

let pool: pg.Pool | null = null;

const getPool = () => {
    if (pool) {
        return pool;
    }
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        console.error("Database environment variables are not set. Please check your .env file.");
        throw new Error("Missing database configuration.");
    }

    pool = new Pool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: parseInt(DB_PORT || '5432'),
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    return pool;
};

const toPostgreSQLTimestamp = (date: Date) => date.toISOString();

const createId = (prefix = 'SJMC') => `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// PostgreSQL row interfaces (lowercase column names)
interface PersonalFileRow {
    id: string;
    name: string;
    age: number;
    gender: string;
    registrationdate: string;
    expirydate: string;
}

interface FamilyFileRow {
    id: string;
    headname: string;
    membercount: number;
    registrationdate: string;
    expirydate: string;
}

interface ReferralFileRow {
    id: string;
    referralname: string;
    patientcount: number;
    registrationdate: string;
    expirydate: string;
}

interface EmergencyFileRow {
    id: string;
    name: string;
    age: number;
    gender: string;
    registrationdate: string;
    expirydate: string;
}

// Helper function to convert PostgreSQL row to camelCase
const mapPersonalFile = (row: PersonalFileRow): PersonalFile => ({
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender as Gender,
    registrationDate: row.registrationdate,
    expiryDate: row.expirydate
});

const mapFamilyFile = (row: FamilyFileRow): FamilyFile => ({
    id: row.id,
    headName: row.headname,
    memberCount: row.membercount,
    registrationDate: row.registrationdate,
    expiryDate: row.expirydate
});

const mapReferralFile = (row: ReferralFileRow): ReferralFile => ({
    id: row.id,
    referralName: row.referralname,
    patientCount: row.patientcount,
    registrationDate: row.registrationdate,
    expiryDate: row.expirydate
});

const mapEmergencyFile = (row: EmergencyFileRow): EmergencyFile => ({
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender as Gender,
    registrationDate: row.registrationdate,
    expiryDate: row.expirydate
});

// Real DB Operations using PostgreSQL
export const db = {
    personal: {
        find: async (): Promise<PersonalFile[]> => {
            const result = await getPool().query('SELECT * FROM personal_files ORDER BY registrationDate DESC');
            return result.rows.map(mapPersonalFile);
        },
        create: async (data: NewPersonalFile): Promise<PersonalFile> => {
            const newFile: PersonalFile = {
                ...data,
                id: createId('SJMC'),
                registrationDate: toPostgreSQLTimestamp(new Date()),
                expiryDate: toPostgreSQLTimestamp(addYears(new Date(), 1)),
            };
            const sql = 'INSERT INTO personal_files (id, name, age, gender, registrationDate, expiryDate) VALUES ($1, $2, $3, $4, $5, $6)';
            await getPool().query(sql, [newFile.id, newFile.name, newFile.age, newFile.gender, newFile.registrationDate, newFile.expiryDate]);
            return newFile;
        },
        update: async (id: string, data: Partial<NewPersonalFile>): Promise<PersonalFile | null> => {
            console.log('Updating database with data:', data);
            
            // Build dynamic SQL query based on provided fields
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;
            
            if (data.name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(data.name); }
            if (data.age !== undefined) { updates.push(`age = $${paramIndex++}`); values.push(data.age); }
            if (data.gender !== undefined) { updates.push(`gender = $${paramIndex++}`); values.push(data.gender); }
            if (data.registrationDate !== undefined) { updates.push(`registrationDate = $${paramIndex++}`); values.push(data.registrationDate); }
            if (data.expiryDate !== undefined) { updates.push(`expiryDate = $${paramIndex++}`); values.push(data.expiryDate); }
            
            // Add id to values array
            values.push(id);
            
            const sql = `UPDATE personal_files SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            console.log('Executing SQL:', sql, 'with values:', values);
            
            const result = await getPool().query(sql, values);
            
            if (result.rowCount === 0) return null;
            
            const updatedResult = await getPool().query('SELECT * FROM personal_files WHERE id = $1', [id]);
            const updatedFile = updatedResult.rows[0] ? mapPersonalFile(updatedResult.rows[0]) : null;
            console.log('Updated file:', updatedFile);
            return updatedFile;
        },
        delete: async (id: string): Promise<{ success: boolean }> => {
            const sql = 'DELETE FROM personal_files WHERE id = $1';
            const result = await getPool().query(sql, [id]);
            return { success: (result.rowCount || 0) > 0 };
        },
    },
    family: {
        find: async (): Promise<FamilyFile[]> => {
            const result = await getPool().query('SELECT * FROM family_files ORDER BY registrationDate DESC');
            return result.rows.map(mapFamilyFile);
        },
        create: async (data: NewFamilyFile): Promise<FamilyFile> => {
            const newFile: FamilyFile = {
                ...data,
                id: createId('FAM'),
                registrationDate: toPostgreSQLTimestamp(new Date()),
                expiryDate: toPostgreSQLTimestamp(addYears(new Date(), 2)),
            };
            const sql = 'INSERT INTO family_files (id, headName, memberCount, registrationDate, expiryDate) VALUES ($1, $2, $3, $4, $5)';
            await getPool().query(sql, [newFile.id, newFile.headName, newFile.memberCount, newFile.registrationDate, newFile.expiryDate]);
            return newFile;
        },
        update: async (id: string, data: Partial<NewFamilyFile>): Promise<FamilyFile | null> => {
            // Build dynamic SQL query based on provided fields
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;
            
            if (data.headName !== undefined) { updates.push(`headName = $${paramIndex++}`); values.push(data.headName); }
            if (data.memberCount !== undefined) { updates.push(`memberCount = $${paramIndex++}`); values.push(data.memberCount); }
            if (data.registrationDate !== undefined) { updates.push(`registrationDate = $${paramIndex++}`); values.push(data.registrationDate); }
            if (data.expiryDate !== undefined) { updates.push(`expiryDate = $${paramIndex++}`); values.push(data.expiryDate); }
            
            // Add id to values array
            values.push(id);
            
            const sql = `UPDATE family_files SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            console.log('Executing SQL:', sql, 'with values:', values);
            
            const result = await getPool().query(sql, values);
            if (result.rowCount === 0) return null;
            
            const updatedResult = await getPool().query('SELECT * FROM family_files WHERE id = $1', [id]);
            return updatedResult.rows[0] ? mapFamilyFile(updatedResult.rows[0]) : null;
        },
        delete: async (id: string): Promise<{ success: boolean }> => {
            const result = await getPool().query('DELETE FROM family_files WHERE id = $1', [id]);
            return { success: (result.rowCount || 0) > 0 };
        },
    },
    referral: {
        find: async (): Promise<ReferralFile[]> => {
            const result = await getPool().query('SELECT * FROM referral_files ORDER BY registrationDate DESC');
            return result.rows.map(mapReferralFile);
        },
         create: async (data: NewReferralFile): Promise<ReferralFile> => {
            const newFile: ReferralFile = {
                ...data,
                id: createId('REF'),
                registrationDate: toPostgreSQLTimestamp(new Date()),
                expiryDate: toPostgreSQLTimestamp(addYears(new Date(), 5)),
            };
            const sql = 'INSERT INTO referral_files (id, referralName, patientCount, registrationDate, expiryDate) VALUES ($1, $2, $3, $4, $5)';
            await getPool().query(sql, [newFile.id, newFile.referralName, newFile.patientCount, newFile.registrationDate, newFile.expiryDate]);
            return newFile;
        },
        update: async (id: string, data: Partial<NewReferralFile>): Promise<ReferralFile | null> => {
            // Build dynamic SQL query based on provided fields
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;
            
            if (data.referralName !== undefined) { updates.push(`referralName = $${paramIndex++}`); values.push(data.referralName); }
            if (data.patientCount !== undefined) { updates.push(`patientCount = $${paramIndex++}`); values.push(data.patientCount); }
            if (data.registrationDate !== undefined) { updates.push(`registrationDate = $${paramIndex++}`); values.push(data.registrationDate); }
            if (data.expiryDate !== undefined) { updates.push(`expiryDate = $${paramIndex++}`); values.push(data.expiryDate); }
            
            // Add id to values array
            values.push(id);
            
            const sql = `UPDATE referral_files SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            console.log('Executing SQL:', sql, 'with values:', values);
            
            const result = await getPool().query(sql, values);
            if (result.rowCount === 0) return null;
            
            const updatedResult = await getPool().query('SELECT * FROM referral_files WHERE id = $1', [id]);
            return updatedResult.rows[0] ? mapReferralFile(updatedResult.rows[0]) : null;
        },
        delete: async (id: string): Promise<{ success: boolean }> => {
            const result = await getPool().query('DELETE FROM referral_files WHERE id = $1', [id]);
            return { success: (result.rowCount || 0) > 0 };
        },
    },
    emergency: {
        find: async (): Promise<EmergencyFile[]> => {
            const result = await getPool().query('SELECT * FROM emergency_files ORDER BY registrationDate DESC');
            return result.rows.map(mapEmergencyFile);
        },
        create: async (data: NewEmergencyFile): Promise<EmergencyFile> => {
            const newFile: EmergencyFile = {
                ...data,
                id: createId('EMG'),
                registrationDate: toPostgreSQLTimestamp(new Date()),
                expiryDate: toPostgreSQLTimestamp(addYears(new Date(), 1)),
            };
            const sql = 'INSERT INTO emergency_files (id, name, age, gender, registrationDate, expiryDate) VALUES ($1, $2, $3, $4, $5, $6)';
            await getPool().query(sql, [newFile.id, newFile.name, newFile.age, newFile.gender, newFile.registrationDate, newFile.expiryDate]);
            return newFile;
        },
        update: async (id: string, data: Partial<NewEmergencyFile>): Promise<EmergencyFile | null> => {
            const sql = 'UPDATE emergency_files SET name = $1, age = $2, gender = $3 WHERE id = $4';
            const result = await getPool().query(sql, [data.name, data.age, data.gender, id]);
            if (result.rowCount === 0) return null;
            const updatedResult = await getPool().query('SELECT * FROM emergency_files WHERE id = $1', [id]);
            return updatedResult.rows[0] ? mapEmergencyFile(updatedResult.rows[0]) : null;
        },
        delete: async (id: string): Promise<{ success: boolean }> => {
            const result = await getPool().query('DELETE FROM emergency_files WHERE id = $1', [id]);
            return { success: (result.rowCount || 0) > 0 };
        },
    },
    getStats: async () => {
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = toPostgreSQLTimestamp(oneWeekAgo);
        const nowStr = toPostgreSQLTimestamp(now);

        // Personal Files Stats
        const personalTotal = await getPool().query('SELECT COUNT(*) as total FROM personal_files');
        const personalWeekly = await getPool().query('SELECT COUNT(*) as weekly FROM personal_files WHERE registrationDate >= $1', [oneWeekAgoStr]);
        const personalExpired = await getPool().query('SELECT COUNT(*) as expired FROM personal_files WHERE expiryDate < $1', [nowStr]);
        const personalActive = await getPool().query('SELECT COUNT(*) as active FROM personal_files WHERE expiryDate >= $1', [nowStr]);

        // Family Files Stats
        const familyTotal = await getPool().query('SELECT COUNT(*) as total FROM family_files');
        const familyWeekly = await getPool().query('SELECT COUNT(*) as weekly FROM family_files WHERE registrationDate >= $1', [oneWeekAgoStr]);
        const familyExpired = await getPool().query('SELECT COUNT(*) as expired FROM family_files WHERE expiryDate < $1', [nowStr]);
        const familyActive = await getPool().query('SELECT COUNT(*) as active FROM family_files WHERE expiryDate >= $1', [nowStr]);
        
        // Referral Files Stats
        const referralTotal = await getPool().query('SELECT COUNT(*) as total FROM referral_files');
        const referralWeekly = await getPool().query('SELECT COUNT(*) as weekly FROM referral_files WHERE registrationDate >= $1', [oneWeekAgoStr]);
        const referralExpired = await getPool().query('SELECT COUNT(*) as expired FROM referral_files WHERE expiryDate < $1', [nowStr]);
        const referralActive = await getPool().query('SELECT COUNT(*) as active FROM referral_files WHERE expiryDate >= $1', [nowStr]);

        // Emergency Files Stats
        const emergencyTotal = await getPool().query('SELECT COUNT(*) as total FROM emergency_files');
        const emergencyWeekly = await getPool().query('SELECT COUNT(*) as weekly FROM emergency_files WHERE registrationDate >= $1', [oneWeekAgoStr]);
        const emergencyExpired = await getPool().query('SELECT COUNT(*) as expired FROM emergency_files WHERE expiryDate < $1', [nowStr]);
        const emergencyActive = await getPool().query('SELECT COUNT(*) as active FROM emergency_files WHERE expiryDate >= $1', [nowStr]);

        return {
            personal: { 
                total: parseInt(personalTotal.rows[0].total), 
                weekly: parseInt(personalWeekly.rows[0].weekly),
                expired: parseInt(personalExpired.rows[0].expired),
                active: parseInt(personalActive.rows[0].active)
            },
            family: { 
                total: parseInt(familyTotal.rows[0].total), 
                weekly: parseInt(familyWeekly.rows[0].weekly),
                expired: parseInt(familyExpired.rows[0].expired),
                active: parseInt(familyActive.rows[0].active)
            },
            referral: { 
                total: parseInt(referralTotal.rows[0].total), 
                weekly: parseInt(referralWeekly.rows[0].weekly),
                expired: parseInt(referralExpired.rows[0].expired),
                active: parseInt(referralActive.rows[0].active)
            },
            emergency: { 
                total: parseInt(emergencyTotal.rows[0].total), 
                weekly: parseInt(emergencyWeekly.rows[0].weekly),
                expired: parseInt(emergencyExpired.rows[0].expired),
                active: parseInt(emergencyActive.rows[0].active)
            }
        };
    }
};