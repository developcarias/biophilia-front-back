import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config';
import { getContent, updateContent } from './services/db';
import { listFiles, uploadFile, deleteFile } from './services/ftp';
import { sendContactEmail } from './services/email';

const app = express();

app.use(cors());
// FIX: Add path to resolve middleware overload ambiguity.
app.use('/', express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- API ROUTES ---

// Content Management
app.get('/api/content', async (req, res) => {
    try {
        const content = await getContent();
        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch content.' });
    }
});

app.put('/api/content', async (req, res) => {
    try {
        await updateContent(req.body);
        res.status(200).json({ message: 'Content updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update content.' });
    }
});

// Media Library (FTP)
app.get('/api/media', async (req, res) => {
    try {
        const files = await listFiles();
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to list media files.' });
    }
});

// FIX: Add explicit types to the request handler to resolve overload issue.
app.post('/api/media/upload', upload.single('file'), async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    try {
        await uploadFile(file.originalname, file.buffer);
        res.status(200).json({ message: 'File uploaded successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload file.' });
    }
});

app.delete('/api/media/:filename', async (req, res) => {
    try {
        await deleteFile(req.params.filename);
        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete file.' });
    }
});


// Contact Form (SMTP)
app.post('/api/contact', async (req, res) => {
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


// Start server
app.listen(config.server.port, () => {
  console.log(`Server running on http://localhost:${config.server.port}`);
});