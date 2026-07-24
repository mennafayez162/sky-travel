import { useState, useEffect } from 'react';
import { FiMapPin, FiCalendar, FiSearch } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { supabase } from '../../services/supabase';

const Hero = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [settings, setSettings] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: s } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (s) setSettings(s);

        const { data: d } = await supabase.from('destinations').select('name, slug').or('is_active.eq.true,is_active.is.null').order('name');
        if (d) setDestinations(d);
      } catch (err) {
        console.error('Error fetching hero data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setSearchData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    window.location.href = `/trips?${params.toString()}`;
  };

  const heroImage = settings?.hero_image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80';
  const heroTitle1 = settings?.hero_title || t('hero.title1');
  const heroTitle2 = settings?.hero_title_ar || t('hero.title2');
  const heroSubtitle = settings?.hero_subtitle || t('hero.subtitle');
  const heroBadge = settings?.hero_badge || t('hero.badge');

  const stats = [
    { value: settings?.stats_clients || 0, label: t('hero.stats.clients') || 'Happy Clients', suffix: '+' },
    { value: settings?.stats_destinations || 0, label: t('hero.stats.destinations') || 'Destinations', suffix: '+' },
    { value: settings?.stats_trips || 0, label: t('hero.stats.trips') || 'Trips Completed', suffix: '+' },
    { value: settings?.stats_years || 0, label: t('hero.stats.years') || 'Years Experience', suffix: '+' },
  ];

  const hasStats = stats.some(s => s.value > 0);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/70 to-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
      </div>

      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 container-custom mx-auto px-4 md:px-8 lg:px-16 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6 fade-up visible">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">{heroBadge}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight mb-6 fade-up visible" style={{ transitionDelay: '100ms' }}>
            {heroTitle1}
            <br />
            <span className="text-gradient">{heroTitle2}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-2xl fade-up visible" style={{ transitionDelay: '200ms' }}>
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-4 mb-14 fade-up visible" style={{ transitionDelay: '300ms' }}>
            <a href="#search" className="gradient-btn px-8 py-3 text-lg">
              <span>{t('hero.cta1')}</span>
            </a>
            <a href="/trips" className="px-8 py-3 glass-card text-lg hover:border-primary/50 transition-all flex items-center gap-2">
              {t('hero.cta2')}
            </a>
          </div>
        </div>

        <div id="search" className="glass-card p-6 md:p-8 max-w-5xl fade-up visible" style={{ transitionDelay: '400ms' }}>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <select
                name="destination"
                value={searchData.destination}
                onChange={handleChange}
                className="input-dark pl-10 appearance-none cursor-pointer"
              >
                <option value="">{t('hero.destinations')}</option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="date" name="checkIn" value={searchData.checkIn} onChange={handleChange} className="input-dark pl-10" />
            </div>

            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="date" name="checkOut" value={searchData.checkOut} onChange={handleChange} className="input-dark pl-10" />
            </div>

            <button
              type="submit"
              className="gradient-btn flex items-center justify-center gap-2 py-3 hover:scale-105 active:scale-95 transition-transform"
            >
              <FiSearch className="w-5 h-5" />
              <span>{t('hero.search')}</span>
            </button>
          </form>
        </div>

        {hasStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl fade-up visible" style={{ transitionDelay: '500ms' }}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-gradient mb-1">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
