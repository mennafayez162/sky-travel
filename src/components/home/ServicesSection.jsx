import { useState, useEffect } from 'react';
import { FaKaaba, FaPlane, FaHotel, FaPassport, FaMapMarkedAlt } from 'react-icons/fa';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const iconMap = { FaKaaba, FaPlane, FaHotel, FaPassport, FaMapMarkedAlt };

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await supabase
          .from('services')
          .select('*')
          .or('is_active.eq.true,is_active.is.null')
          .order('sort_order', { ascending: true })
          .limit(6);
        if (data) setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return null;

  if (services.length === 0) {
    return (
      <section ref={ref} className="section-padding bg-dark-card/50">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.services')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {t('servicesHome.title1')} <span className="text-gradient">{t('servicesHome.title2')}</span>
            </h2>
          </div>
          <div className="text-center py-16 glass-card rounded-2xl">
            <FaPlane className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد خدمات بعد' : 'No services yet'}</h3>
            <p className="text-gray-500">{isRTL ? 'أضف الخدمات من لوحة التحكم' : 'Add services from Admin Dashboard'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="section-padding bg-dark-card/50">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.services')}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {t('servicesHome.title1')} <span className="text-gradient">{t('servicesHome.title2')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('servicesHome.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = (service.icon && iconMap[service.icon]) || FaPlane;
            return (
              <div
                key={service.id}
                className={`glass-card p-6 group card-hover cursor-pointer fade-up ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-secondary transition-all duration-500">
                  <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {isRTL ? service.title_ar || service.title : service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {isRTL ? service.description_ar || service.description : service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
