import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { authenticateToken, requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url), trips(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    res.json({
      data,
      pagination: { page: Number(page), limit: Number(limit), total: count, pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trip/:tripId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('trip_id', req.params.tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, requireAuth, [
  body('tripId').notEmpty().withMessage('Trip ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
], validate, async (req, res) => {
  try {
    const { tripId, rating, comment } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.userId,
        trip_id: tripId,
        rating,
        comment,
        created_at: new Date().toISOString(),
      })
      .select('*, profiles(full_name, avatar_url)')
      .single();

    if (error) throw error;

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('trip_id', tripId);

    if (reviews?.length) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await supabase
        .from('trips')
        .update({ rating: Math.round(avgRating * 10) / 10 })
        .eq('id', tripId);
    }

    res.status(201).json({ message: 'Review added', data });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to add review' });
  }
});

router.delete('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { data: review } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (req.profile?.role !== 'admin' && review.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
