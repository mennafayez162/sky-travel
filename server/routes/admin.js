import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const [usersCount, bookingsCount, tripsCount, destinationsCount] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('trips').select('id', { count: 'exact', head: true }),
      supabase.from('destinations').select('id', { count: 'exact', head: true }),
    ]);

    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('*, trips(title), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: revenue } = await supabase
      .from('bookings')
      .select('total_price')
      .in('status', ['confirmed', 'completed']);

    const totalRevenue = revenue?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    res.json({
      stats: {
        users: usersCount.count || 0,
        bookings: bookingsCount.count || 0,
        trips: tripsCount.count || 0,
        destinations: destinationsCount.count || 0,
        totalRevenue,
      },
      recentBookings: recentBookings || [],
      recentUsers: recentUsers || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case '7d': startDate = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now - 90 * 24 * 60 * 60 * 1000); break;
      case '1y': startDate = new Date(now - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    const [bookings, revenue, users] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
      supabase.from('bookings').select('total_price').gte('created_at', startDate.toISOString()).in('status', ['confirmed', 'completed']),
      supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', startDate.toISOString()),
    ]);

    const totalRevenue = revenue.data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

    res.json({
      period,
      stats: {
        bookings: bookings.count || 0,
        revenue: totalRevenue,
        newUsers: users.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

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

router.put('/users/:id', [
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
], validate, async (req, res) => {
  try {
    const { role } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, message: 'User updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', req.params.id);
    if (error) throw error;
    await supabase.auth.admin.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select('*, trips(title), profiles(full_name, email)', { count: 'exact' });

    if (status) query = query.eq('status', status);

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

router.put('/bookings/:id', [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
], validate, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, message: 'Booking updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/trips', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('trips')
      .select('*, destinations(name)', { count: 'exact' })
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

router.post('/trips', [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('destination_id').notEmpty().withMessage('Destination is required'),
], validate, async (req, res) => {
  try {
    const { title, description, price, discount, duration, destination_id, image, is_featured } = req.body;

    const { data, error } = await supabase
      .from('trips')
      .insert({
        title, description, price, discount: discount || 0,
        duration, destination_id, image, is_featured: is_featured || false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, message: 'Trip created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/trips/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, message: 'Trip updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/trips/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('trips').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/destinations', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('destinations')
      .select('*, countries(name)', { count: 'exact' })
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

router.post('/destinations', [
  body('name').notEmpty().withMessage('Name is required'),
  body('country_id').notEmpty().withMessage('Country is required'),
], validate, async (req, res) => {
  try {
    const { name, slug, description, image, country_id, is_featured } = req.body;

    const { data, error } = await supabase
      .from('destinations')
      .insert({
        name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description, image, country_id, is_featured: is_featured || false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, message: 'Destination created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/destinations/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, message: 'Destination updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/destinations/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('destinations').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Destination deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
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

router.put('/messages/:id/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ data: data || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('id', 1)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('settings')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single();
    } else {
      result = await supabase
        .from('settings')
        .insert({ id: 1, ...req.body, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json({ data: result.data, message: 'Settings updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
