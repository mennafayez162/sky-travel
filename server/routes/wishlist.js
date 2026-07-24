import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, trips(*, destinations(name, slug, image))')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, requireAuth, [
  body('trip_id').notEmpty().withMessage('Trip ID is required'),
], validate, async (req, res) => {
  try {
    const { trip_id } = req.body;

    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', req.userId)
      .eq('trip_id', trip_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: req.userId,
        trip_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Added to wishlist', data });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to add to wishlist' });
  }
});

router.delete('/:tripId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', req.userId)
      .eq('trip_id', req.params.tripId);

    if (error) throw error;
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
