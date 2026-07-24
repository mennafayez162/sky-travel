import { motion } from 'framer-motion';
import { FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
      title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      <FiGlobe className="w-4 h-4" />
      <span className="hidden sm:inline font-medium">
        {language === 'en' ? 'عربي' : 'EN'}
      </span>
    </motion.button>
  );
};

export default LanguageSwitcher;
