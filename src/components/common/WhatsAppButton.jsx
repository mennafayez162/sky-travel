import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../services/supabase';

const WhatsAppButton = () => {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const { data } = await supabase.from('settings').select('whatsapp').limit(1).single();
        if (data?.whatsapp) {
          const cleaned = data.whatsapp.replace(/[^0-9]/g, '');
          if (cleaned.length >= 8) {
            setPhone(cleaned);
          }
        }
      } catch (err) {
        console.error('WhatsApp fetch error:', err);
      }
    };
    fetchPhone();
  }, []);

  if (!phone) return null;

  return (
    <motion.a
      href={`https://wa.me/${phone}?text=Hello%2C%20I%27m%20interested%20in%20your%20travel%20services`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
    >
      <FaWhatsapp className="w-7 h-7" />
      <motion.span
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.a>
  );
};

export default WhatsAppButton;
