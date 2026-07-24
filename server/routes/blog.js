import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blogs')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_published', true);

    if (category) query = query.eq('categories.slug', category);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

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

router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*, categories(name, slug), profiles(full_name, avatar_url)')
      .eq('slug', req.params.slug)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Article not found' });

    const { data: related } = await supabase
      .from('blogs')
      .select('id, title, slug, image, excerpt, created_at')
      .eq('category_id', data.category_id)
      .neq('id', data.id)
      .limit(3);

    res.json({ data: { ...data, related: related || [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/category/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*, categories(name, slug)')
      .eq('categories.slug', req.params.slug)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
