// FIX: Switched to using express.Request and express.Response to ensure correct Express types are used in handlers.
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { config } from './config';
import { getContent, updateContent, getUserByUsername, getAllUsers, createUser, updateUser, deleteUser } from './services/db';
import { listFiles, uploadFile, deleteFile, createDirectory, deleteDirectory } from './services/ftp';
import { sendContactEmail } from './services/email';
import { User } from './types';
import * as ftp from 'basic-ftp';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// FIX: Initialize multer to handle file uploads in memory.
// The 'upload' variable was used without being defined.
const upload = multer({ storage: multer.memoryStorage() });


// Initialize Gemini
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.warn("API_KEY environment variable not set on the server. AI features will be disabled.");
}

// --- API ROUTES ---

// Content Management
app.get('/api/content', async (req: express.Request, res: express.Response) => {
    try {
        const content = await getContent();
        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch content.' });
    }
});

app.put('/api/content', async (req: express.Request, res: express.Response) => {
    try {
        await updateContent(req.body);
        res.status(200).json({ message: 'Content updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update content.' });
    }
});

// User Authentication & Management
app.post('/api/login', async (req: express.Request, res: express.Response) => {
    try {
        const { username, password } = req.body;
        const user = await getUserByUsername(username);
        // IMPORTANT: In a real app, passwords should be hashed and compared securely.
        if (user && user.password === password) {
            const { password: _, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.get('/api/users', async (req: express.Request, res: express.Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

app.post('/api/users', async (req: express.Request, res: express.Response) => {
    try {
        const newUser: Omit<User, 'id'> = req.body;
        const createdUser = await createUser(newUser);
        res.status(201).json(createdUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

app.put('/api/users/:id', async (req: express.Request, res: express.Response) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const userUpdates: Partial<User> = req.body;
        await updateUser(userId, userUpdates);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req: express.Request, res: express.Response) => {
    try {
        const userId = parseInt(req.params.id, 10);
        // A real app would get current user from a token, but for now we trust the client-side check.
        // A backend check `if (userId === currentUserIdFromToken)` would be essential.
        await deleteUser(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});


// Media Library (FTP)
app.get('/api/media', async (req: express.Request, res: express.Response) => {
    try {
        const directoryPath = (req.query.path as string) || '/';
        if (directoryPath.includes('..')) {
            return res.status(400).json({ message: 'Invalid path.' });
        }
        const content = await listFiles(directoryPath);
        res.json(content);
    } catch (error) {
        console.error(error);
        if (error instanceof ftp.FTPError && error.code === 550) {
            res.status(404).json({ message: 'Directory not found.' });
        } else {
            res.status(500).json({ message: 'Failed to list media files.' });
        }
    }
});

app.post('/api/media/folder', async (req: express.Request, res: express.Response) => {
    const { path } = req.body;
    if (!path || typeof path !== 'string') {
        return res.status(400).json({ message: 'Path is required.' });
    }
    if (path.includes('..')) {
        return res.status(400).json({ message: 'Invalid path.' });
    }
    try {
        await createDirectory(path);
        res.status(201).json({ message: 'Directory created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create directory.' });
    }
});

app.delete('/api/media/folder', async (req: express.Request, res: express.Response) => {
    try {
        const directoryPath = (req.query.path as string);
        if (!directoryPath || directoryPath === '/') {
            return res.status(400).json({ message: 'A valid folder path is required. Root folder cannot be deleted.' });
        }
        if (directoryPath.includes('..')) {
            return res.status(400).json({ message: 'Invalid path.' });
        }
        await deleteDirectory(directoryPath);
        res.status(200).json({ message: 'Folder deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete folder.' });
    }
});

app.post('/api/media/upload', upload.single('file'), async (req: express.Request, res: express.Response) => {
    const file = req.file;
    const path = (req.body.path as string) || '/';
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (path.includes('..')) {
        return res.status(400).json({ message: 'Invalid path.' });
    }
    try {
        await uploadFile(path, file.originalname, file.buffer);
        res.status(200).json({ message: 'File uploaded successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload file.' });
    }
});

app.delete('/api/media/:filename', async (req: express.Request, res: express.Response) => {
    try {
        const path = (req.query.path as string) || '/';
        if (path.includes('..')) {
            return res.status(400).json({ message: 'Invalid path.' });
        }
        await deleteFile(path, req.params.filename);
        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete file.' });
    }
});


// Contact Form (SMTP)
app.post('/api/contact', async (req: express.Request, res: express.Response) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        await sendContactEmail(name, email, message);
        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message.' });
    }
});

// Gemini AI Text Generation
app.post('/api/generate-text', async (req: express.Request, res: express.Response) => {
    if (!ai) {
        return res.status(503).json({ message: "AI service is not configured on the server." });
    }

    const { prompt, language } = req.body;
    if (!prompt || !language) {
        return res.status(400).json({ message: "Prompt and language are required." });
    }
    
    const languageName = language === 'es' ? 'Spanish' : 'English';
    
    try {
// FIX: Updated model from deprecated 'gemini-1.5-flash' to 'gemini-2.5-flash'.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: `You are a professional copywriter for an environmental non-profit foundation named Biophilia. Write content that is inspiring, hopeful, clear, and action-oriented. Keep paragraphs concise. Your response MUST be in ${languageName}.`,
            }
        });
        res.json({ text: response.text });
    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).json({ message: "Failed to generate text from AI service." });
    }
});


// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on http://localhost:${config.server.port}`);
});
