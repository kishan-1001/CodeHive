import { Router } from 'express';
import { emailService } from '../services/emailService';

const router = Router();

router.post('/apply', async (req, res) => {
    try {
        const { name, email, phone, linkedin, resume, coverLetter, jobTitle } = req.body;

        if (!name || !email || !phone || !resume || !jobTitle) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await emailService.sendApplicationEmail({
            name,
            email,
            phone,
            linkedin,
            resume,
            coverLetter,
            jobTitle
        });

        res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Failed to submit application' });
    }
});

export default router;
