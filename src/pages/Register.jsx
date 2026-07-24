import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useAuthHook } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { user } = useAuth();
  const { signUp, loading, error, clearError } = useAuthHook();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const calculatePasswordStrength = (password) => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'password') setPasswordStrength(calculatePasswordStrength(value));
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return t('auth.register.strengthWeak');
    if (passwordStrength <= 2) return t('auth.register.strengthFair');
    if (passwordStrength <= 3) return t('auth.register.strengthGood');
    if (passwordStrength <= 4) return t('auth.register.strengthStrong');
    return t('auth.register.strengthVeryStrong');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.register.passwordsDoNotMatch'));
      return;
    }
    if (formData.password.length < 8) {
      toast.error(t('auth.register.passwordLength'));
      return;
    }
    if (!formData.agreeTerms) {
      toast.error(t('auth.register.agreeTerms'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await signUp(formData.email, formData.password, formData.fullName);
      if (data?.session) {
        toast.success(t('auth.register.accountCreated'));
        navigate('/', { replace: true });
      } else if (data?.user) {
        toast.success(t('auth.register.accountCreated'));
        navigate('/verify-email', { state: { email: formData.email } });
      }
    } catch (err) {
      toast.error(err.message || t('auth.register.registrationFailed'));
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
      toast.error(err.message || t('auth.register.socialFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-dark to-primary/5" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />

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
              className="w-16 h-16 bg-gradient-to-r from-secondary to-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <FiUserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{t('auth.register.createAccount')}</h2>
            <p className="text-gray-400">{t('auth.register.subtitle')}</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.register.nameLabel')}</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                  className="input-dark pl-12" placeholder={t('auth.register.namePlaceholder')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.register.emailLabel')}</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="input-dark pl-12" placeholder={t('auth.register.emailPlaceholder')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.register.passwordLabel')}</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  className="input-dark pl-12 pr-12" placeholder={t('auth.register.passwordPlaceholder')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? getStrengthColor() : 'bg-dark-border'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('auth.register.passwordStrength')} <span className={getStrengthColor().replace('bg-', 'text-')}>{getStrengthText()}</span>
                  </p>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.register.confirmPasswordLabel')}</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                  className="input-dark pl-12 pr-12" placeholder={t('auth.register.confirmPasswordPlaceholder')}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{t('auth.register.passwordsDoNotMatch')}</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded border-dark-border bg-dark-surface text-primary focus:ring-primary/50" />
              <span className="text-sm text-gray-400">
                {t('auth.register.agreePrefix')}{' '}
                <Link to="/terms" className="text-primary hover:text-primary-light">{t('auth.register.terms')}</Link>
                {' '}{t('auth.register.and')}{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-light">{t('auth.register.privacy')}</Link>
              </span>
            </label>

            <button type="submit" disabled={isLoading}
              className="w-full gradient-btn py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              <span>{isLoading ? t('auth.register.creating') : t('auth.register.createAccount')}</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-card text-gray-500">{t('auth.register.orContinueWith')}</span>
            </div>
          </div>

          <button onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 glass-card hover:border-dark-border transition-all">
            <FcGoogle className="w-5 h-5" />
            <span className="text-sm font-medium">Google</span>
          </button>

          <p className="text-center text-gray-400 text-sm mt-8">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium transition-colors">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
