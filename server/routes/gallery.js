import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('gallery')
      .select('*, categories(name, slug)', { count: 'exact' });

    if (category) query = query.eq('categories.slug', category);

    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: { page: Number(page), limit: Number(limit), total: count, pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/category/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*, categories(name, slug)')
      .eq('categories.slug', req.params.slug)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
