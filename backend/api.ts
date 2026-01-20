// FIX: Changed Express import to use ES module syntax.
import express from 'express';
import { db } from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (typeof payload === 'string') {
            return res.status(403).json({ message: 'Invalid token format' });
        }
        req.user = payload;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
import { Gender, NewPersonalFile, NewFamilyFile, NewReferralFile, NewEmergencyFile } from '../types.js';

const router = express.Router();

// --- AUTH ---
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Hardcoded admin credentials as requested
    if (email === 'admin@sjmc.com' && password === 'password123') {
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { email }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Verify token endpoint
router.get('/verify-token', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// --- STATS ---
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Error fetching stats', error });
    }
});

// --- PERSONAL FILES (CRUD) ---
router.get('/personal', async (req, res) => {
    try {
        const files = await db.personal.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching personal files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

router.post('/personal', async (req, res) => {
    try {
        const { name, age, gender } = req.body;
        if (name === undefined || age === undefined || gender === undefined) {
            return res.status(400).json({ message: 'Missing required fields: name, age, gender' });
        }

        const registrationDate = new Date().toISOString().split('T')[0];
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newFile = await db.personal.create({
            name,
            age,
            gender: gender as Gender,
            registrationDate,
            expiryDate
        });
        res.status(201).json(newFile);
    } catch (error) {
        console.error("Error creating personal file:", error);
        res.status(500).json({ message: 'Error creating file' });
    }
});

router.put('/personal/:id', async (req, res) => {
    try {
        console.log('Updating personal file:', req.params.id, 'with data:', req.body);
        const { name, age, gender, registrationDate, expiryDate } = req.body;
        
        // Validate required fields
        if (!name || age === undefined || !gender) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updatedFile = await db.personal.update(req.params.id, {
            name,
            age,
            gender,
            registrationDate,
            expiryDate
        });

        if (!updatedFile) return res.status(404).json({ message: 'File not found' });
        console.log('File updated successfully:', updatedFile);
        res.json(updatedFile);
    } catch (error) {
        console.error(`Error updating personal file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error updating file' });
    }
});

router.delete('/personal/:id', async (req, res) => {
    try {
        await db.personal.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting personal file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});


// --- FAMILY FILES (CRUD) ---
router.get('/family', async (req, res) => {
    try {
        const files = await db.family.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching family files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

router.post('/family', async (req, res) => {
    try {
        const { headName, memberCount } = req.body;
        if (!headName || memberCount === undefined) {
            return res.status(400).json({ message: 'Missing required fields: headName, memberCount' });
        }

        const registrationDate = new Date().toISOString().split('T')[0];
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newFile = await db.family.create({
            headName,
            memberCount,
            registrationDate,
            expiryDate
        });
        res.status(201).json(newFile);
    } catch (error) {
        console.error("Error creating family file:", error);
        res.status(500).json({ message: 'Error creating file' });
    }
});

router.put('/family/:id', async (req, res) => {
    try {
        const updatedFile = await db.family.update(req.params.id, req.body);
        if (!updatedFile) return res.status(404).json({ message: 'File not found' });
        res.json(updatedFile);
    } catch (error) {
        console.error(`Error updating family file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error updating file' });
    }
});

router.delete('/family/:id', async (req, res) => {
    try {
        await db.family.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting family file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

// --- REFERRAL FILES (CRUD) ---
router.get('/referral', async (req, res) => {
    try {
        const files = await db.referral.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching referral files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

router.post('/referral', async (req, res) => {
    try {
        const { referralName, patientCount } = req.body;
        if (!referralName || patientCount === undefined) {
            return res.status(400).json({ message: 'Missing required fields: referralName, patientCount' });
        }

        const registrationDate = new Date().toISOString().split('T')[0];
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newFile = await db.referral.create({
            referralName,
            patientCount,
            registrationDate,
            expiryDate
        });
        res.status(201).json(newFile);
    } catch (error) {
        console.error("Error creating referral file:", error);
        res.status(500).json({ message: 'Error creating file' });
    }
});

router.put('/referral/:id', async (req, res) => {
    try {
        const updatedFile = await db.referral.update(req.params.id, req.body);
        if (!updatedFile) return res.status(404).json({ message: 'File not found' });
        res.json(updatedFile);
    } catch (error) {
        console.error(`Error updating referral file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error updating file' });
    }
});

router.delete('/referral/:id', async (req, res) => {
    try {
        await db.referral.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting referral file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

// --- EMERGENCY FILES (CRUD) ---
router.get('/emergency', async (req, res) => {
    try {
        const files = await db.emergency.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching emergency files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

router.post('/emergency', async (req, res) => {
    try {
        const { name, age, gender } = req.body;
        if (!name || age === undefined || !gender) {
            return res.status(400).json({ message: 'Missing required fields: name, age, gender' });
        }

        const registrationDate = new Date().toISOString().split('T')[0];
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newFile = await db.emergency.create({
            name,
            age,
            gender: gender as Gender,
            registrationDate,
            expiryDate
        });
        res.status(201).json(newFile);
    } catch (error) {
        console.error("Error creating emergency file:", error);
        res.status(500).json({ message: 'Error creating file' });
    }
});

router.put('/emergency/:id', async (req, res) => {
    try {
        const updatedFile = await db.emergency.update(req.params.id, req.body);
        if (!updatedFile) return res.status(404).json({ message: 'File not found' });
        res.json(updatedFile);
    } catch (error) {
        console.error(`Error updating emergency file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error updating file' });
    }
});

router.delete('/emergency/:id', async (req, res) => {
    try {
        await db.emergency.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting emergency file ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

// FIX: Switched to a named export to avoid ES module interoperability issues.
export { router };