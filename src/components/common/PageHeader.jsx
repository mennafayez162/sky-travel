import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const PageHeader = ({ title, titleAr, breadcrumbs = [] }) => {
  const { t } = useLanguage();
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark to-secondary/10" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 container-custom px-4 md:px-8 lg:px-16 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-gradient">{titleAr || title}</span>
          </motion.h1>

          <motion.nav
            className="flex flex-wrap items-center justify-center gap-2 text-gray-400 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <FiHome className="w-4 h-4" />
              <span>{t('nav.home')}</span>
            </Link>

            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <FiChevronRight className="w-4 h-4" />
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.nameAr || crumb.name}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.nameAr || crumb.name}</span>
                )}
              </div>
            ))}
          </motion.nav>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};

export default PageHeader;
