import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiClock, FiUsers, FiStar, FiHeart,
  FiShare2, FiCheck, FiX as FiXIcon,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../services/supabase';
import SkeletonLoader from '../components/common/SkeletonLoader';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const TripDetails = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({ travelDate: '', guests: 1, specialRequests: '' });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*, destinations(name, name_ar)')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) {
        setTrip({
          ...data,
          destination: data.destinations || null,
        });
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a trip.');
      navigate('/login', { state: { from: { pathname: `/trips/${id}` } } });
      return;
    }

    setIsBooking(true);
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        role: 'user',
      }, { onConflict: 'id' });
      if (profileError) throw profileError;

      const ref = 'BK-' + Date.now().toString(36).toUpperCase();
      const total = (trip.discount ? trip.price * (1 - trip.discount / 100) : trip.price) * bookingData.guests;

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        trip_id: trip.id,
        destination_id: trip.destination_id,
        booking_reference: ref,
        travel_date: bookingData.travelDate,
        guests: bookingData.guests,
        total_price: total,
        special_requests: bookingData.specialRequests,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Booking created successfully!');
      setShowBooking(false);
      navigate('/booking-history');
    } catch (err) {
      toast.error(err.message || 'Booking failed.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="section-padding pt-24"><SkeletonLoader type="card" count={3} /></div>;
  if (!trip) return <div className="section-padding pt-24 text-center py-20"><p className="text-gray-400">{t('tripDetails.tripNotFound')}</p></div>;

  const discountedPrice = trip.discount ? trip.price * (1 - trip.discount / 100) : trip.price;

  return (
    <div className="pt-24">
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 container-custom mx-auto px-4 md:px-8 lg:px-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 fade-up visible">
            {t('dir') === 'rtl' ? trip.title_ar || trip.title : trip.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-300 fade-up visible" style={{ transitionDelay: '100ms' }}>
            {trip.destination && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4 text-primary" />
                {t('dir') === 'rtl' ? trip.destination.name_ar || trip.destination.name : trip.destination.name}
              </span>
            )}
            {trip.duration && <span className="flex items-center gap-1"><FiClock className="w-4 h-4 text-primary" />{trip.duration}</span>}
            {trip.max_guests && <span className="flex items-center gap-1"><FiUsers className="w-4 h-4 text-primary" />{trip.max_guests} {t('tripDetails.guestsPlural')}</span>}
            {trip.rating && <span className="flex items-center gap-1"><FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />{trip.rating}</span>}
          </div>
        </div>
      </div>

      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">{t('tripDetails.about')}</h2>
                <p className="text-gray-400 leading-relaxed">{t('dir') === 'rtl' ? trip.description_ar || trip.description : trip.description}</p>
              </div>

              {trip.highlights?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t('tripDetails.highlights')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(t('dir') === 'rtl' ? trip.highlights_ar || trip.highlights : trip.highlights)?.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trip.includes?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-green-400">{t('tripDetails.included')}</h3>
                    {(t('dir') === 'rtl' ? trip.includes_ar || trip.includes : trip.includes)?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2 text-gray-300 text-sm">
                        <FiCheck className="w-4 h-4 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {trip.excludes?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-red-400">{t('tripDetails.notIncluded')}</h3>
                    {(t('dir') === 'rtl' ? trip.excludes_ar || trip.excludes : trip.excludes)?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2 text-gray-300 text-sm">
                        <FiXIcon className="w-4 h-4 text-red-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <div className="mb-6">
                  {trip.discount > 0 ? (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-gradient">{formatPrice(discountedPrice)}</span>
                      <span className="text-lg text-gray-500 line-through">{formatPrice(trip.price)}</span>
                      <span className="px-2 py-0.5 bg-red-500 rounded text-xs font-bold">-{trip.discount}%</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gradient">{formatPrice(trip.price)}</span>
                  )}
                  <p className="text-sm text-gray-500">{t('tripDetails.perPerson')}</p>
                </div>

                <button onClick={() => setShowBooking(true)} className="w-full gradient-btn py-3 mb-3">
                  {t('tripDetails.bookNow')}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleWishlist(trip.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all ${
                      isInWishlist(trip.id) ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass-card hover:border-primary/50'
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${isInWishlist(trip.id) ? 'fill-current' : ''}`} />
                    <span>{isInWishlist(trip.id) ? t('tripDetails.saved') : t('tripDetails.save')}</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 glass-card text-sm hover:border-primary/50 transition-all">
                    <FiShare2 className="w-4 h-4" />
                    <span>{t('tripDetails.share')}</span>
                  </button>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  {trip.duration && (
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tripDetails.duration')}</span>
                      <span className="text-white">{trip.duration}</span>
                    </div>
                  )}
                  {trip.max_guests && (
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tripDetails.maxGuests')}</span>
                      <span className="text-white">{trip.max_guests}</span>
                    </div>
                  )}
                  {trip.rating && (
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tripDetails.rating')}</span>
                      <span className="text-white flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {trip.rating}
                      </span>
                    </div>
                  )}
                  {trip.booking_count > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>{t('tripDetails.totalBookings')}</span>
                      <span className="text-white">{trip.booking_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowBooking(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-8 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-6">{t('tripDetails.bookTitle')}: {trip.title}</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('tripDetails.travelDate')}</label>
                <input
                  type="date"
                  value={bookingData.travelDate}
                  onChange={(e) => setBookingData((p) => ({ ...p, travelDate: e.target.value }))}
                  required
                  className="input-dark"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('tripDetails.guests')}</label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData((p) => ({ ...p, guests: Number(e.target.value) }))}
                  className="input-dark"
                >
                  {[...Array(Math.min(trip.max_guests || 20, 20))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? t('tripDetails.guest') : t('tripDetails.guestsPlural')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">{t('tripDetails.specialRequests')}</label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData((p) => ({ ...p, specialRequests: e.target.value }))}
                  className="input-dark resize-none"
                  rows={3}
                  placeholder={t('tripDetails.specialRequestsPlaceholder')}
                />
              </div>

              <div className="p-4 glass-card">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{t('tripDetails.pricePerPerson')}</span>
                  <span>{formatPrice(discountedPrice)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{t('tripDetails.guests')}</span>
                  <span>×{bookingData.guests}</span>
                </div>
                <div className="border-t border-dark-border pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>{t('tripDetails.total')}</span>
                  <span className="text-gradient">{formatPrice(discountedPrice * bookingData.guests)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBooking(false)} className="flex-1 glass-card py-3">
                  {t('tripDetails.cancel')}
                </button>
                <button type="submit" disabled={isBooking} className="flex-1 gradient-btn py-3">
                  <span>{isBooking ? t('tripDetails.booking') : t('tripDetails.confirmBooking')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
