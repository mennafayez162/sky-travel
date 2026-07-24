import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const { t } = useLanguage();

  const handleResend = async () => {
    if (!email) {
      toast.error(t('auth.verify.noEmail'));
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setResent(true);
      toast.success(t('auth.verify.emailResent'));
    } catch (err) {
      toast.error(err.message || t('auth.verify.failed'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-dark to-accent/5" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 md:p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <FiMail className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-3">{t('auth.verify.title')}</h2>
          <p className="text-gray-400 mb-2">
            {t('auth.verify.sentMessage')}
          </p>
          {email && (
            <p className="text-white font-semibold text-lg mb-6">{email}</p>
          )}

          <div className="glass-card p-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('auth.verify.whatToDo')}</h3>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>{t('auth.verify.step1')}</li>
                  <li>{t('auth.verify.step2')}</li>
                  <li>{t('auth.verify.step3')}</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={handleResend}
              disabled={isResending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full gradient-btn py-3 font-semibold flex items-center justify-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? t('auth.verify.sending') : resent ? t('auth.verify.emailResent') : t('auth.verify.resendEmail')}</span>
            </motion.button>

            <Link
              to="/login"
              className="block w-full text-center py-3 glass-card hover:border-primary/50 transition-all font-semibold"
            >
              {t('auth.verify.backToLogin')}
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            {t('auth.verify.stillNotWorking')}{' '}
            <Link to="/contact" className="text-primary hover:text-primary-light">
              {t('auth.verify.contactSupport')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
