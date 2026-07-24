import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useAuthHook } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { sendPasswordReset, error, clearError } = useAuthHook();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setIsSubmitted(true);
      toast.success(t('auth.forgot.emailSent'));
    } catch (err) {
      toast.error(err.message || t('auth.forgot.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-dark to-primary/5" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 md:p-10">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <FiMail className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">{t('auth.forgot.title')}</h2>
                  <p className="text-gray-400">
                    {t('auth.forgot.subtitle')}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('auth.forgot.emailLabel')}
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input-dark pl-12"
                        placeholder={t('auth.forgot.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full gradient-btn py-3 text-lg font-semibold disabled:opacity-50"
                  >
                    <span>{isLoading ? t('auth.forgot.sending') : t('auth.forgot.sendResetLink')}</span>
                  </motion.button>
                </form>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 mt-6 text-gray-400 hover:text-white transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>{t('auth.forgot.backToLogin')}</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheck className="w-10 h-10 text-green-500" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-3">{t('auth.forgot.checkEmail')}</h2>
                <p className="text-gray-400 mb-6">
                  {t('auth.forgot.emailSentTo')}{' '}
                  <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-gray-500 text-sm mb-8">
                  {t('auth.forgot.notReceived')}{' '}
                  <button
                    onClick={() => { setIsSubmitted(false); setEmail(''); }}
                    className="text-primary hover:text-primary-light"
                  >
                    {t('auth.forgot.tryAgain')}
                  </button>
                </p>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 gradient-btn px-6 py-3"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>{t('auth.forgot.backToLogin')}</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
