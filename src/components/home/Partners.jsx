import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { supabase } from '../../services/supabase';

const FALLBACK_PARTNERS = [
  'Emirates', 'Qatar Airways', 'Hilton', 'Marriott', 'Airbnb',
  'Booking.com', 'Expedia', 'TripAdvisor',
];

const Partners = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [partners, setPartners] = useState(FALLBACK_PARTNERS);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data } = await supabase.from('settings').select('partners').eq('id', 1).single();
        if (data?.partners && Array.isArray(data.partners) && data.partners.length > 0) {
          setPartners(data.partners);
        }
      } catch {}
    };
    fetchPartners();
  }, []);

  if (!partners.length) return null;

  return (
    <section ref={ref} className="py-16 border-t border-dark-border border-b">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          className="text-center mb-10"
        >
          <p className="text-gray-500 text-sm uppercase tracking-wider">Trusted by Leading Brands</p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-gray-600 hover:text-white transition-colors text-lg md:text-xl font-bold cursor-default"
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
