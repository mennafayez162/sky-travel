import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../services/supabase';

const DestinationDetails = () => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { slug } = useParams();
  const [dest, setDest] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestination();
  }, [slug]);

  const fetchDestination = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*, countries(name, name_ar)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      if (data) {
        setDest({ ...data, country: data.countries || null });
        fetchTrips(data.id);
      }
    } catch (err) {
      console.error('Error fetching destination:', err);
      setDest(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async (destId) => {
    try {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('destination_id', destId)
        .or('is_active.eq.true,is_active.is.null')
        .order('created_at', { ascending: false });
      setTrips(data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const dir = t('dir');

  if (loading) {
    return (
      <div className="pt-24">
        <div className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
            <div className="h-96 glass-card rounded-2xl animate-pulse mb-12" />
            <div className="h-8 glass-card rounded w-1/3 mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 glass-card rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="pt-24">
        <div className="section-padding text-center py-20">
          <p className="text-gray-400 text-lg">Destination not found.</p>
          <Link to="/destinations" className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary-light transition-colors">
            Back to destinations
          </Link>
        </div>
      </div>
    );
  }

  const name = dir === 'rtl' ? dest.name_ar || dest.name : dest.name;
  const desc = dir === 'rtl' ? dest.description_ar || dest.description : dest.description;
  const countryName = dest.country
    ? (dir === 'rtl' ? dest.country.name_ar || dest.country.name : dest.country.name)
    : null;

  return (
    <>
      <PageHeader title={name} breadcrumbs={[{ name: t('destinations.breadcrumb'), path: '/destinations' }, { name: name }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="relative h-96 rounded-2xl overflow-hidden mb-12 fade-up visible">
            <img src={dest.image} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
            <div className="absolute bottom-6 left-6 flex flex-wrap items-center gap-3">
              {countryName && (
                <span className="flex items-center gap-1 glass-card px-3 py-1.5 text-sm"><FiMapPin className="w-4 h-4 text-primary" />{countryName}</span>
              )}
              {dest.rating && (
                <span className="flex items-center gap-1 glass-card px-3 py-1.5 text-sm"><FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />{dest.rating}</span>
              )}
              {dest.price_from > 0 && (
                <span className="glass-card px-3 py-1.5 text-sm font-bold text-gradient">{t('destinations.from')} {formatPrice(dest.price_from)}</span>
              )}
            </div>
          </div>

          <div className="max-w-3xl mb-12 fade-up visible">
            <h2 className="text-2xl font-bold mb-4">{t('destinations.about')} {name}</h2>
            <p className="text-gray-400 leading-relaxed">{desc || 'No description available.'}</p>
          </div>

          <h2 className="text-2xl font-bold mb-6 fade-up visible">{t('destinations.tripsTo')} {name}</h2>
          {trips.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl fade-up visible">
              <p className="text-gray-400">No trips available for this destination yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, i) => {
                const tripName = dir === 'rtl' ? trip.title_ar || trip.title : trip.title;
                return (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="glass-card overflow-hidden card-hover fade-up visible"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={trip.image} alt={tripName} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {trip.discount > 0 && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">-{trip.discount}%</span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold mb-1">{tripName}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{trip.duration}</span>
                        <span className="text-gradient font-bold">{formatPrice(trip.discount ? trip.price * (1 - trip.discount / 100) : trip.price)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DestinationDetails;
