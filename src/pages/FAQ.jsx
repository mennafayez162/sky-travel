import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

const FAQItem = ({ faq, isOpen, onClick, isRTL }) => (
  <div className="glass-card overflow-hidden">
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 text-left">
      <span className="font-semibold pr-4">{isRTL ? faq.question_ar || faq.question : faq.question}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <FiChevronDown className={`w-5 h-5 text-primary flex-shrink-0 ${isRTL ? 'rotate-0' : ''}`} />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }} className="overflow-hidden">
          <div className="px-5 pb-5 text-gray-400 leading-relaxed">{isRTL ? faq.answer_ar || faq.answer : faq.answer}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQ = () => {
  const { t, isRTL } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const { data } = await supabase
          .from('faq')
          .select('*')
          .or('is_active.eq.true,is_active.is.null')
          .order('sort_order', { ascending: true });
        if (data) setFaqs(data);
      } catch (err) {
        console.error('Error fetching FAQ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, []);

  const filtered = faqs.filter((f) => {
    const q = isRTL ? f.question_ar || f.question : f.question;
    const a = isRTL ? f.answer_ar || f.answer : f.answer;
    return q?.toLowerCase().includes(search.toLowerCase()) || a?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <PageHeader title={t('faq.title')} breadcrumbs={[{ name: t('faq.breadcrumb') }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16 max-w-3xl">
          <div className="text-center mb-12">
            <FiHelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">{t('faq.title')}</h2>
            <p className="text-gray-400">{t('faq.subtitle')}</p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('faq.searchPlaceholder')}
            className="input-dark mb-8"
          />

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <FiHelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد أسئلة بعد' : 'No FAQ yet'}</h3>
              <p className="text-gray-500">{isRTL ? 'أضف الأسئلة من لوحة التحكم' : 'Add FAQ from Admin Dashboard'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq) => (
                <FAQItem key={faq.id} faq={faq} isOpen={openId === faq.id} isRTL={isRTL} onClick={() => setOpenId(openId === faq.id ? null : faq.id)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FAQ;
