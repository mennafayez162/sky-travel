import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const Loader = ({ size = 'md', text = '' }) => {
  const { t } = useLanguage();
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-dark-border`}
          style={{
            borderTopColor: '#4F46E5',
            borderRightColor: '#6D28D9',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute inset-1 rounded-full border-2 border-transparent`}
          style={{
            borderBottomColor: '#2563EB',
            borderLeftColor: '#6D28D9',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && (
        <motion.p
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export const FullPageLoader = () => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative w-20 h-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: ['#4F46E5', '#6D28D9', '#2563EB'][i],
                borderRightColor: ['#6D28D9', '#2563EB', '#4F46E5'][i],
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: [1, 1.5, 2][i],
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </motion.div>
        <div className="text-center">
          <motion.h2
            className="text-xl font-bold text-gradient"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Travcano
          </motion.h2>
          <motion.p
            className="text-gray-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            {t('loader.text')}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
