import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data } = await supabase
          .from('destinations')
          .select('*')
          .eq('is_featured', true)
          .or('is_active.eq.true,is_active.is.null')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data) setDestinations(data);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  if (loading) return null;

  if (destinations.length === 0) {
    return (
      <section ref={ref} className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.popularDestinations')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {isRTL ? 'استكشف أماكن' : 'Explore'} <span className="text-gradient">{isRTL ? 'مذهلة' : 'Amazing Places'}</span>
            </h2>
          </div>
          <div className="text-center py-16 glass-card rounded-2xl">
            <FiMapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد وجهات بعد' : 'No destinations yet'}</h3>
            <p className="text-gray-500">{isRTL ? 'أضف الوجهات من لوحة التحكم' : 'Add destinations from Admin Dashboard'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="section-padding">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.popularDestinations')}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {isRTL ? 'استكشف أماكن' : 'Explore'} <span className="text-gradient">{isRTL ? 'مذهلة' : 'Amazing Places'}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {isRTL ? 'اكتشف أجمل الوجهات حول العالم' : 'Discover the most breathtaking destinations around the world.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <Link
              key={dest.id}
              to={`/destinations/${dest.slug}`}
              className={`group block glass-card overflow-hidden card-hover fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={isRTL ? dest.name_ar || dest.name : dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {isRTL ? dest.name_ar || dest.name : dest.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-gray-400">{dest.rating || '4.5'}</span>
                    </div>
                  </div>
                  {dest.price_from > 0 && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{isRTL ? 'يبدأ من' : 'From'}</span>
                      <p className="text-xl font-bold text-gradient">{formatPrice(dest.price_from)}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={`text-center mt-10 fade-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '400ms' }}>
          <Link to="/destinations" className="inline-flex items-center gap-2 gradient-btn px-8 py-3">
            <span>{isRTL ? 'عرض جميع الوجهات' : 'View All Destinations'}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
