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
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login to the system
 *     description: Authenticate with email and password to get a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 */
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
/**
 * @swagger
 * /api/verify-token:
 *   get:
 *     summary: Verify JWT token
 *     description: Verify if the provided JWT token is valid
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       401:
 *         description: Authentication token required
 *       403:
 *         description: Invalid or expired token
 */
router.get('/verify-token', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// --- STATS ---
/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get statistics
 *     description: Get statistics for all file types
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 *       401:
 *         description: Authentication token required
 *       500:
 *         description: Error fetching stats
 */
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
/**
 * @swagger
 * /api/personal:
 *   get:
 *     summary: Get all personal files
 *     description: Retrieve all personal files from the database
 *     tags: [Personal Files]
 *     responses:
 *       200:
 *         description: List of personal files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PersonalFile'
 *       500:
 *         description: Error fetching files
 */
router.get('/personal', async (req, res) => {
    try {
        const files = await db.personal.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching personal files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

/**
 * @swagger
 * /api/personal:
 *   post:
 *     summary: Create a new personal file
 *     description: Create a new personal file record
 *     tags: [Personal Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, gender]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               age:
 *                 type: number
 *                 example: 30
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: Male
 *     responses:
 *       201:
 *         description: Personal file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalFile'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating file
 */
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

/**
 * @swagger
 * /api/personal/{id}:
 *   put:
 *     summary: Update a personal file
 *     description: Update an existing personal file record
 *     tags: [Personal Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Personal file ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, gender]
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               registrationDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Personal file updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalFile'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: File not found
 *       500:
 *         description: Error updating file
 */
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

/**
 * @swagger
 * /api/personal/{id}:
 *   delete:
 *     summary: Delete a personal file
 *     description: Delete a personal file record
 *     tags: [Personal Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Personal file ID
 *     responses:
 *       204:
 *         description: Personal file deleted successfully
 *       500:
 *         description: Error deleting file
 */
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
/**
 * @swagger
 * /api/family:
 *   get:
 *     summary: Get all family files
 *     description: Retrieve all family files from the database
 *     tags: [Family Files]
 *     responses:
 *       200:
 *         description: List of family files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FamilyFile'
 *       500:
 *         description: Error fetching files
 */
router.get('/family', async (req, res) => {
    try {
        const files = await db.family.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching family files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

/**
 * @swagger
 * /api/family:
 *   post:
 *     summary: Create a new family file
 *     description: Create a new family file record
 *     tags: [Family Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [headName, memberCount]
 *             properties:
 *               headName:
 *                 type: string
 *                 example: Jane Smith
 *               memberCount:
 *                 type: number
 *                 example: 4
 *     responses:
 *       201:
 *         description: Family file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyFile'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating file
 */
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

/**
 * @swagger
 * /api/family/{id}:
 *   put:
 *     summary: Update a family file
 *     description: Update an existing family file record
 *     tags: [Family Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family file ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FamilyFile'
 *     responses:
 *       200:
 *         description: Family file updated successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Error updating file
 */
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

/**
 * @swagger
 * /api/family/{id}:
 *   delete:
 *     summary: Delete a family file
 *     description: Delete a family file record
 *     tags: [Family Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family file ID
 *     responses:
 *       204:
 *         description: Family file deleted successfully
 *       500:
 *         description: Error deleting file
 */
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
/**
 * @swagger
 * /api/referral:
 *   get:
 *     summary: Get all referral files
 *     description: Retrieve all referral files from the database
 *     tags: [Referral Files]
 *     responses:
 *       200:
 *         description: List of referral files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReferralFile'
 *       500:
 *         description: Error fetching files
 */
router.get('/referral', async (req, res) => {
    try {
        const files = await db.referral.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching referral files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

/**
 * @swagger
 * /api/referral:
 *   post:
 *     summary: Create a new referral file
 *     description: Create a new referral file record
 *     tags: [Referral Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [referralName, patientCount]
 *             properties:
 *               referralName:
 *                 type: string
 *                 example: Dr. Johnson
 *               patientCount:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Referral file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralFile'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating file
 */
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

/**
 * @swagger
 * /api/referral/{id}:
 *   put:
 *     summary: Update a referral file
 *     description: Update an existing referral file record
 *     tags: [Referral Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral file ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReferralFile'
 *     responses:
 *       200:
 *         description: Referral file updated successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Error updating file
 */
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

/**
 * @swagger
 * /api/referral/{id}:
 *   delete:
 *     summary: Delete a referral file
 *     description: Delete a referral file record
 *     tags: [Referral Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Referral file ID
 *     responses:
 *       204:
 *         description: Referral file deleted successfully
 *       500:
 *         description: Error deleting file
 */
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
/**
 * @swagger
 * /api/emergency:
 *   get:
 *     summary: Get all emergency files
 *     description: Retrieve all emergency files from the database
 *     tags: [Emergency Files]
 *     responses:
 *       200:
 *         description: List of emergency files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmergencyFile'
 *       500:
 *         description: Error fetching files
 */
router.get('/emergency', async (req, res) => {
    try {
        const files = await db.emergency.find();
        res.json(files);
    } catch (error) {
        console.error("Error fetching emergency files:", error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

/**
 * @swagger
 * /api/emergency:
 *   post:
 *     summary: Create a new emergency file
 *     description: Create a new emergency file record
 *     tags: [Emergency Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, gender]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Emergency Patient
 *               age:
 *                 type: number
 *                 example: 45
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: Female
 *     responses:
 *       201:
 *         description: Emergency file created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyFile'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error creating file
 */
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

/**
 * @swagger
 * /api/emergency/{id}:
 *   put:
 *     summary: Update an emergency file
 *     description: Update an existing emergency file record
 *     tags: [Emergency Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency file ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyFile'
 *     responses:
 *       200:
 *         description: Emergency file updated successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Error updating file
 */
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

/**
 * @swagger
 * /api/emergency/{id}:
 *   delete:
 *     summary: Delete an emergency file
 *     description: Delete an emergency file record
 *     tags: [Emergency Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency file ID
 *     responses:
 *       204:
 *         description: Emergency file deleted successfully
 *       500:
 *         description: Error deleting file
 */
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