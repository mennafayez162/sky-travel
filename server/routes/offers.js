import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('offers')
      .select('*, trips(title, image, price)', { count: 'exact' })
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

router.get('/active', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*, trips(title, image, price, discount)')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('discount_percentage', { ascending: false })
      .limit(6);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
