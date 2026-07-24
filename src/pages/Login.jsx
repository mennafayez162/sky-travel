import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useAuthHook } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { signIn, loading, error, clearError } = useAuthHook();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password, formData.rememberMe);
      toast.success(t('auth.login.welcomeBack'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || t('auth.login.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || t('auth.login.socialFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-dark to-secondary/5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/15 rounded-full blur-[120px]" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <FiLogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{t('auth.login.welcomeBack')}</h2>
            <p className="text-gray-400">{t('auth.login.subtitle')}</p>
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

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.login.emailLabel')}</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="input-dark pl-12" placeholder={t('auth.login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.login.passwordLabel')}</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  className="input-dark pl-12 pr-12" placeholder={t('auth.login.passwordPlaceholder')}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-border bg-dark-surface text-primary focus:ring-primary/50"
                />
                <span className="text-sm text-gray-400">{t('auth.login.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-light transition-colors">
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full gradient-btn py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-card text-gray-500">{t('auth.login.orContinueWith')}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 glass-card hover:border-dark-border transition-all"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-sm font-medium">Google</span>
          </button>

          <p className="text-center text-gray-400 text-sm mt-8">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
