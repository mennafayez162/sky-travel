import { Router } from 'express';
import { body } from 'express-validator';
import { supabase } from '../lib/supabase.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
], validate, async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    const token = generateToken(authData.user.id);

    res.status(201).json({
      message: 'Account created. Please verify your email.',
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const token = generateToken(data.user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
      },
      profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password`,
    });

    if (error) throw error;

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(400).json({ error: err.message || 'Failed to send reset email' });
  }
});

router.post('/reset-password', [
  body('accessToken').notEmpty().withMessage('Access token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, async (req, res) => {
  try {
    const { accessToken, password } = req.body;

    const { data, error } = await supabase.auth.updateUser(accessToken, {
      password,
    });

    if (error) throw error;

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ error: err.message || 'Failed to reset password' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error) throw error;

    res.json({ profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(400).json({ error: err.message || 'Failed to get profile' });
  }
});

router.put('/profile', authenticateToken, [
  body('fullName').optional().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('country').optional().isString(),
  body('city').optional().isString(),
  body('bio').optional().isString(),
], validate, async (req, res) => {
  try {
    const { fullName, phone, country, city, bio } = req.body;

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (fullName) updates.full_name = fullName;
    if (phone) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (city !== undefined) updates.city = city;
    if (bio !== undefined) updates.bio = bio;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    if (fullName) {
      await supabase.auth.admin.updateUserById(req.userId, {
        user_metadata: { full_name: fullName },
      });
    }

    res.json({ profile, message: 'Profile updated' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

router.put('/change-password', authenticateToken, [
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, async (req, res) => {
  try {
    const { newPassword } = req.body;

    const { error } = await supabase.auth.admin.updateUserById(req.userId, {
      password: newPassword,
    });

    if (error) throw error;

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(400).json({ error: err.message || 'Failed to change password' });
  }
});

router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await supabase.from('profiles').delete().eq('id', req.userId);

    const { error } = await supabase.auth.admin.deleteUser(req.userId);
    if (error) throw error;

    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(400).json({ error: err.message || 'Failed to delete account' });
  }
});

export default router;
