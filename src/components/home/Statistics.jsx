import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!isVisible || !value) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Statistics = () => {
  const [settings, setSettings] = useState(null);
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('settings').select('stats_clients, stats_destinations, stats_trips, stats_years').eq('id', 1).single();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchSettings();
  }, []);

  const stats = [
    { value: settings?.stats_clients || 0, label: isRTL ? 'عميل سعيد' : 'Happy Clients', suffix: '+' },
    { value: settings?.stats_destinations || 0, label: isRTL ? 'وجهة' : 'Destinations', suffix: '+' },
    { value: settings?.stats_trips || 0, label: isRTL ? 'رحلة مكتملة' : 'Trips Completed', suffix: '+' },
    { value: settings?.stats_years || 0, label: isRTL ? 'سنوات خبرة' : 'Years Experience', suffix: '+' },
  ];

  const hasStats = stats.some(s => s.value > 0);
  if (!hasStats) return null;

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-dark to-secondary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />

      <div className="relative z-10 container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`text-center glass-card p-8 rounded-2xl fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-black text-gradient mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
