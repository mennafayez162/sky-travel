import { useState, useEffect } from 'react';
import { FiClock, FiPercent, FiTag } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useCountdown } from '../../hooks/useCountdown';

const CountdownTimer = ({ endDate }) => {
  const { days, hours, minutes, seconds } = useCountdown(endDate);
  const blocks = [
    { value: days, label: 'D' },
    { value: hours, label: 'H' },
    { value: minutes, label: 'M' },
    { value: seconds, label: 'S' },
  ];
  return (
    <div className="flex gap-2">
      {blocks.map((b, i) => (
        <div key={i} className="text-center">
          <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center font-bold text-sm">
            {String(b.value).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-gray-500 mt-1">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

const OffersSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await supabase
          .from('offers')
          .select('*')
          .or('is_active.eq.true,is_active.is.null')
          .order('created_at', { ascending: false })
          .limit(3);
        if (data) setOffers(data);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return null;

  if (offers.length === 0) {
    return (
      <section ref={ref} className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.offers')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {isRTL ? 'عروض' : 'Limited Time'} <span className="text-gradient">{isRTL ? 'خاصة' : 'Deals'}</span>
            </h2>
          </div>
          <div className="text-center py-16 glass-card rounded-2xl">
            <FiTag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد عروض بعد' : 'No offers yet'}</h3>
            <p className="text-gray-500">{isRTL ? 'أضف العروض من لوحة التحكم' : 'Add offers from Admin Dashboard'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="section-padding">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.offers')}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {isRTL ? 'عروض' : 'Limited Time'} <span className="text-gradient">{isRTL ? 'خاصة' : 'Deals'}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {isRTL ? 'استغل العروض الحصرية قبل انتهائها' : 'Grab these exclusive deals before they expire!'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, i) => (
            <div
              key={offer.id}
              className={`glass-card overflow-hidden group card-hover fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {(offer.image || offer.trip_id) && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={offer.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'}
                    alt={isRTL ? offer.title_ar || offer.title : offer.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FiPercent className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-red-500">-{offer.discount_percentage}%</span>
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {isRTL ? offer.title_ar || offer.title : offer.title}
                </h3>
                {offer.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {isRTL ? offer.description_ar || offer.description : offer.description}
                  </p>
                )}

                {offer.end_date && (
                  <div className="flex items-center gap-3">
                    <FiClock className="w-4 h-4 text-gray-500" />
                    <CountdownTimer endDate={offer.end_date} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
