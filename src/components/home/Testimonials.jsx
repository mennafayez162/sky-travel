import { useState, useEffect } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight, FiMessageSquare } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return null;

  if (reviews.length === 0) {
    return (
      <section ref={ref} className="section-padding bg-dark-card/50">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.testimonials')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {isRTL ? 'ماذا يقول' : 'What Our'} <span className="text-gradient">{isRTL ? 'عملاؤنا' : 'Travelers Say'}</span>
            </h2>
          </div>
          <div className="text-center py-16 glass-card rounded-2xl">
            <FiMessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد آراء بعد' : 'No testimonials yet'}</h3>
            <p className="text-gray-500">{isRTL ? 'أضف آراء العملاء من لوحة التحكم' : 'Add reviews from Admin Dashboard'}</p>
          </div>
        </div>
      </section>
    );
  }

  const next = () => setCurrent((prev) => (prev + 1) % reviews.length);
  const prev = () => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  const review = reviews[current];

  return (
    <section ref={ref} className="section-padding bg-dark-card/50">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.testimonials')}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {isRTL ? 'ماذا يقول' : 'What Our'} <span className="text-gradient">{isRTL ? 'عملاؤنا' : 'Travelers Say'}</span>
          </h2>
        </div>

        <div className={`max-w-4xl mx-auto fade-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
          <div className="glass-card p-8 md:p-12 relative">
            <FiMessageSquare className="absolute top-6 left-6 w-12 h-12 text-primary/10" />

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${i < (review.rating || 5) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed italic mb-8">
                &ldquo;{isRTL ? review.comment_ar || review.comment : review.comment}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 text-lg font-bold text-primary">
                  {(review.visitor_name || review.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h4 className="font-bold">{review.visitor_name || review.name}</h4>
                  {review.visitor_country && (
                    <p className="text-sm text-gray-400">{review.visitor_country}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary/50 transition-all hover:scale-110 active:scale-95"
              >
                <FiChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === current ? 'bg-primary w-8' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary/50 transition-all hover:scale-110 active:scale-95"
              >
                <FiChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
