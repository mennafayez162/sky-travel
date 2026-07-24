import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiStar, FiHeart, FiArrowRight } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const FeaturedTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await supabase
          .from('trips')
          .select('*')
          .eq('is_featured', true)
          .or('is_active.eq.true,is_active.is.null')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data) setTrips(data);
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return null;

  if (trips.length === 0) {
    return (
      <section ref={ref} className="section-padding bg-dark-card/50">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.featuredTrips')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {isRTL ? 'رحلات' : 'Handpicked'} <span className="text-gradient">{isRTL ? 'مميزة' : 'Experiences'}</span>
            </h2>
          </div>
          <div className="text-center py-16 glass-card rounded-2xl">
            <FiMapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد رحلات بعد' : 'No trips yet'}</h3>
            <p className="text-gray-500">{isRTL ? 'أضف الرحلات من لوحة التحكم' : 'Add trips from Admin Dashboard'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="section-padding bg-dark-card/50">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.featuredTrips')}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {isRTL ? 'رحلات' : 'Handpicked'} <span className="text-gradient">{isRTL ? 'مميزة' : 'Experiences'}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => (
            <div
              key={trip.id}
              className={`glass-card overflow-hidden group card-hover fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={trip.image}
                  alt={isRTL ? trip.title_ar || trip.title : trip.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {trip.discount > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 rounded-lg text-xs font-bold">
                    -{trip.discount}%
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(trip.id); }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isInWishlist(trip.id)
                        ? 'bg-red-500 text-white'
                        : 'glass-card hover:bg-red-500/20 hover:text-red-400'
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${isInWishlist(trip.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {trip.duration}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-1">
                  {isRTL ? trip.title_ar || trip.title : trip.title}
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    {trip.discount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gradient">
                          {formatPrice(trip.price * (1 - trip.discount / 100))}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(trip.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gradient">
                        {formatPrice(trip.price)}
                      </span>
                    )}
                    <p className="text-xs text-gray-500">{isRTL ? 'للشخص' : 'per person'}</p>
                  </div>

                  <Link
                    to={`/trips/${trip.id}`}
                    className="flex items-center gap-1 gradient-btn px-4 py-2 text-sm"
                  >
                    <span>{isRTL ? 'احجز' : 'Book'}</span>
                    <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`text-center mt-10 fade-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: '400ms' }}>
          <Link to="/trips" className="inline-flex items-center gap-2 gradient-btn px-8 py-3">
            <span>{isRTL ? 'عرض جميع الرحلات' : 'View All Trips'}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrips;
