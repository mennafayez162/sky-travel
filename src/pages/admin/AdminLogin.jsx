import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAuthHook } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'admin@travcano.com';
const ADMIN_PASSWORD = 'Admin123!';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState('');
  const [setupDone, setSetupDone] = useState(false);

  const { user, profile } = useAuth();
  const { signIn, clearError } = useAuthHook();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      if (profileData?.role !== 'admin') {
        setError(t('admin.login.accessDenied') || 'Access denied. Admin only.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      toast.success(t('admin.login.welcomeAdmin') || 'Welcome, Admin!');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || t('admin.login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSetup = async () => {
    setIsSettingUp(true);
    setError('');

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: { full_name: 'Admin', role: 'admin' },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.success('Admin account exists! Logging in...');
          await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (userId) {
            await supabase.from('profiles').upsert({ id: userId, role: 'admin', full_name: 'Admin' }, { onConflict: 'id' });
          }
          toast.success('Logged in as Admin!');
          navigate('/admin', { replace: true });
          return;
        }
        throw signUpError;
      }

      const userId = signUpData?.user?.id;
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          role: 'admin',
          full_name: 'Admin',
          email: ADMIN_EMAIL,
        }, { onConflict: 'id' });
      }

      setSetupDone(true);
      setEmail(ADMIN_EMAIL);
      setPassword(ADMIN_PASSWORD);
      toast.success('Admin account created! Logging in...');
      await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Setup failed: ' + err.message);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 via-dark to-primary/5" />
      <div className="absolute top-20 left-20 w-80 h-80 bg-secondary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/15 rounded-full blur-[120px]" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-r from-secondary to-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <FiShield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{t('admin.login.title')}</h2>
            <p className="text-gray-400">{t('admin.login.subtitle')}</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.login.emailLabel')}
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-dark pl-12"
                  placeholder={t('admin.login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.login.passwordLabel')}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-dark pl-12 pr-12"
                  placeholder={t('admin.login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gradient-btn py-3 text-lg font-semibold disabled:opacity-50"
            >
              <span>{isLoading ? t('admin.login.signingIn') : t('admin.login.accessDashboard')}</span>
            </motion.button>
          </form>

          <div className="mt-4">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#0B1020] text-gray-500">or</span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleQuickSetup}
              disabled={isSettingUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 text-lg font-semibold border-2 border-dashed border-primary/50 rounded-xl text-primary hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <FiUserPlus className="w-5 h-5" />
              <span>{isSettingUp ? 'Setting up...' : 'Quick Admin Setup'}</span>
            </motion.button>
            <p className="text-xs text-gray-600 text-center mt-2">
              Creates admin@travcano.com with Admin123!
            </p>
          </div>

          {setupDone && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm"
            >
              Admin account created! Email: {ADMIN_EMAIL} | Password: {ADMIN_PASSWORD}
            </motion.div>
          )}

          <div className="mt-6 p-4 glass-card">
            <p className="text-xs text-gray-500 text-center">
              {t('admin.login.restricted')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
