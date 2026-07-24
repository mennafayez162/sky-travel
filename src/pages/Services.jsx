import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaKaaba, FaPlane, FaHotel, FaPassport, FaMapMarkedAlt,
} from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../services/supabase';

const defaultIcons = {
  FaKaaba, FaPlane, FaHotel, FaPassport, FaMapMarkedAlt,
};

const Services = () => {
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await supabase
        .from('services')
        .select('*')
          .or('is_active.eq.true,is_active.is.null')
        .order('sort_order', { ascending: true });

      if (data) setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (service) => {
    if (service.icon && defaultIcons[service.icon]) {
      const Icon = defaultIcons[service.icon];
      return <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />;
    }
    return <FaPlane className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />;
  };

  return (
    <>
      <PageHeader title={t('servicesPage.title')} breadcrumbs={[{ name: t('servicesPage.title') }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <FaPlane className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد خدمات بعد' : 'No services yet'}</h3>
              <p className="text-gray-500">{isRTL ? 'أضف الخدمات من لوحة التحكم' : 'Add services from Admin Dashboard'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/services/${service.slug}`}
                    className="glass-card p-8 card-hover group block h-full"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:from-primary group-hover:to-secondary transition-all duration-500">
                      {renderIcon(service)}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{isRTL ? service.title_ar || service.title : service.title}</h3>
                    <p className="text-gray-400 text-sm mb-5 leading-relaxed line-clamp-3">
                      {isRTL ? service.description_ar || service.description : service.description}
                    </p>
                    {service.price > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <span className="text-primary font-bold text-lg">{formatPrice(service.price)}</span>
                        <span className="text-gray-500 text-sm ml-2">{isRTL ? 'للشخص' : 'per person'}</span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 glass-card p-12 text-center"
          >
            <h3 className="text-2xl font-bold mb-4">{t('servicesPage.needCustom')}</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">{t('servicesPage.needCustomDesc')}</p>
            <Link to="/contact" className="gradient-btn px-8 py-3 inline-block">
              <span>{t('servicesPage.contactUs')}</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Services;
