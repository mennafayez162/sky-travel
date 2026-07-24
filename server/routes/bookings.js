import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import crypto from 'crypto';

const router = Router();

const generateRef = () => {
  return 'SKY-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

router.post('/', authenticateToken, requireAuth, [
  body('tripId').notEmpty().withMessage('Trip ID is required'),
  body('travelDate').isISO8601().withMessage('Valid travel date is required'),
  body('guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
], validate, async (req, res) => {
  try {
    const { tripId, travelDate, guests, specialRequests } = req.body;

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const discount = trip.discount || 0;
    const pricePerPerson = trip.price * (1 - discount / 100);
    const totalPrice = pricePerPerson * guests;

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: req.userId,
        trip_id: tripId,
        travel_date: travelDate,
        guests,
        total_price: totalPrice,
        booking_reference: generateRef(),
        status: 'pending',
        special_requests: specialRequests || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('trips')
      .update({ booking_count: (trip.booking_count || 0) + 1 })
      .eq('id', tripId);

    res.status(201).json({
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(400).json({ error: err.message || 'Failed to create booking' });
  }
});

router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const isAdmin = req.profile?.role === 'admin';

    let query = supabase
      .from('bookings')
      .select('*, trips(title, image, price), destinations(name, image)', { count: 'exact' });

    if (!isAdmin) {
      query = query.eq('user_id', req.userId);
    }

    query = query.order('created_at', { ascending: false });
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

router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, trips(*, destinations(name)), destinations(name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Booking not found' });

    if (req.profile?.role !== 'admin' && data.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/cancel', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.profile?.role !== 'admin' && booking.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Booking cancelled', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
