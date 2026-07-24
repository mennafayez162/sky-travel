import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const Pagination = ({
  currentPage,
  totalPages,
  paginationRange,
  onPageChange,
  onNext,
  onPrev,
  onFirst,
  onLast,
}) => {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFirst}
        disabled={currentPage === 1}
        className="p-2 rounded-lg glass-card disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-all"
      >
        <FiChevronsLeft className="w-4 h-4" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 rounded-lg glass-card disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-all"
      >
        <FiChevronLeft className="w-4 h-4" />
      </motion.button>

      {paginationRange.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-gray-500"
            >
              ...
            </span>
          );
        }

        return (
          <motion.button
            key={page}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === page
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                : 'glass-card hover:border-primary/50'
            }`}
          >
            {page}
          </motion.button>
        );
      })}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg glass-card disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-all"
      >
        <FiChevronRight className="w-4 h-4" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLast}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg glass-card disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-all"
      >
        <FiChevronsRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default Pagination;
