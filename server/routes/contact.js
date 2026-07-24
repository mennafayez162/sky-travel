import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
], validate, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        name,
        email,
        subject,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Message sent successfully', data });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to send message' });
  }
});

export default router;
