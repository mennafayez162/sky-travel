import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 12, destination, minPrice, maxPrice,
      duration, rating, search, sort = 'created_at',
    } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('trips')
      .select('*, destinations(name, slug, image)', { count: 'exact' });

    if (destination) query = query.eq('destinations.slug', destination);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (duration) query = query.eq('duration', duration);
    if (rating) query = query.gte('rating', Number(rating));
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
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

router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, destinations(name, slug, image)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, destinations(name, slug, image)')
      .order('booking_count', { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*, destinations(name, slug, image, description)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const { data: images } = await supabase
      .from('trip_images')
      .select('*')
      .eq('trip_id', trip.id);

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      data: {
        ...trip,
        images: images || [],
        reviews: reviews || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
