import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, async (req, res) => {
  try {
    const { email } = req.body;

    const { data: existing } = await supabase
      .from('newsletter')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    const { data, error } = await supabase
      .from('newsletter')
      .insert({
        email,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Subscribed successfully', data });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Subscription failed' });
  }
});

router.delete('/:email', async (req, res) => {
  try {
    const { error } = await supabase
      .from('newsletter')
      .update({ is_active: false })
      .eq('email', req.params.email);

    if (error) throw error;
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
