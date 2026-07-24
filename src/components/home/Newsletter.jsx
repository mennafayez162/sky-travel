import { useState } from 'react';
import { FiMail, FiCheck } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const { error } = await supabase.from('newsletter').insert({ email });
      if (error && error.code !== '23505') throw error;
      setIsSubmitted(true);
      toast.success(isRTL ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.message || (isRTL ? 'فشل الاشتراك' : 'Subscription failed.'));
    }
  };

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-dark to-secondary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />

      <div className="relative z-10 container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`max-w-2xl mx-auto text-center fade-up ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'ابقَ' : 'Stay'} <span className="text-gradient">{isRTL ? 'على اطلاع' : 'Updated'}</span>
          </h2>
          <p className="text-gray-400 mb-8">
            {isRTL ? 'اشترك في نشرتنا الإخبارية للحصول على عروض حصرية وإلهام السفر' : 'Subscribe to our newsletter for exclusive deals and travel inspiration.'}
          </p>

          {isSubmitted ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-lg font-semibold">{isRTL ? 'شكراً لاشتراكك!' : 'Thanks for subscribing!'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-dark pl-12"
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>
              <button
                type="submit"
                className="gradient-btn px-8 py-3 whitespace-nowrap hover:scale-105 active:scale-95 transition-transform"
              >
                <span>{isRTL ? 'اشترك' : 'Subscribe'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
