import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-dark to-secondary/5" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mb-8"
        >
          <span className="text-[10rem] md:text-[14rem] font-black text-gradient leading-none opacity-20">
            404
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-4 -mt-16"
        >
          {t('notFound.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8 max-w-md mx-auto"
        >
          {t('notFound.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 glass-card hover:border-primary/50 transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>{t('notFound.goBack')}</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 gradient-btn px-6 py-3"
          >
            <FiHome className="w-4 h-4" />
            <span>{t('notFound.home')}</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
