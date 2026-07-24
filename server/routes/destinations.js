import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, country, search, sort = 'created_at' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('destinations')
      .select('*, countries(name, slug)', { count: 'exact' });

    if (country) {
      query = query.eq('countries.slug', country);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order(sort, { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, countries(name, slug)')
      .order('rating', { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, countries(name, slug)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, countries(name, slug)')
      .eq('slug', req.params.slug)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Destination not found' });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
