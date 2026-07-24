import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar, FiMapPin, FiUsers,
  FiFilter, FiSearch, FiEye, FiX, FiCheck, FiClock,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../services/supabase';
import PageHeader from '../components/common/PageHeader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const BookingHistory = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, trips(title, title_ar, image), destinations(name, name_ar)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      if (error) throw error;
      toast.success('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking.');
    }
  };

  const dir = t('dir');

  const filteredBookings = bookings
    .filter((b) => filter === 'all' || b.status === filter)
    .filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const tripName = dir === 'rtl' ? (b.trips?.title_ar || b.trips?.title) : b.trips?.title;
      const destName = dir === 'rtl' ? (b.destinations?.name_ar || b.destinations?.name) : b.destinations?.name;
      return (
        tripName?.toLowerCase().includes(q) ||
        destName?.toLowerCase().includes(q) ||
        b.booking_reference?.toLowerCase().includes(q)
      );
    });

  const statusConfig = {
    confirmed: { icon: FiCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: t('bookingHistory.confirmed') },
    pending: { icon: FiClock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: t('bookingHistory.pending') },
    cancelled: { icon: FiX, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: t('bookingHistory.cancelled') },
    completed: { icon: FiCheck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: t('bookingHistory.completed') },
  };

  const filterOptions = [
    { value: 'all', label: t('bookingHistory.all') },
    { value: 'confirmed', label: t('bookingHistory.confirmed') },
    { value: 'pending', label: t('bookingHistory.pending') },
    { value: 'completed', label: t('bookingHistory.completed') },
    { value: 'cancelled', label: t('bookingHistory.cancelled') },
  ];

  return (
    <>
      <PageHeader
        title={t('bookingHistory.title')}
        breadcrumbs={[{ name: t('bookingHistory.breadcrumb') }]}
      />

      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row gap-4 mb-8 fade-up visible">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('bookingHistory.searchPlaceholder')}
                className="input-dark pl-12"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <FiFilter className="text-gray-500 w-5 h-5 flex-shrink-0" />
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                    filter === opt.value
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'glass-card text-gray-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <SkeletonLoader type="table" />
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 fade-up visible">
              <FiCalendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{t('bookingHistory.noBookings')}</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filter !== 'all'
                  ? t('bookingHistory.tryAdjusting')
                  : t('bookingHistory.noBookingsYet')}
              </p>
              <Link to="/trips" className="gradient-btn inline-block px-6 py-3">
                {t('bookingHistory.browseTrips')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => {
                const status = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const tripName = dir === 'rtl' ? (booking.trips?.title_ar || booking.trips?.title) : booking.trips?.title;
                const destName = dir === 'rtl' ? (booking.destinations?.name_ar || booking.destinations?.name) : booking.destinations?.name;

                return (
                  <div
                    key={booking.id}
                    className="glass-card p-6 hover:border-primary/30 transition-all fade-up visible"
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-40 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={booking.trips?.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'}
                          alt={tripName || 'Trip'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold mb-1">
                              {tripName || 'Trip Booking'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <FiMapPin className="w-4 h-4" />
                                {destName || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                {formatDate(booking.travel_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiUsers className="w-4 h-4" />
                                {booking.guests} {t('bookingHistory.guests')}
                              </span>
                            </div>
                            {booking.booking_reference && (
                              <p className="text-xs text-gray-500 mt-2">
                                {t('bookingHistory.ref')}: {booking.booking_reference}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            <span className="text-xl font-bold text-gradient">
                              {formatPrice(booking.total_price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-dark-border">
                          <Link
                            to={`/trips/${booking.trip_id}`}
                            className="flex items-center gap-2 px-4 py-2 glass-card text-sm hover:border-primary/50 transition-all"
                          >
                            <FiEye className="w-4 h-4" />
                            {t('bookingHistory.viewTrip')}
                          </Link>
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-all"
                            >
                              <FiX className="w-4 h-4" />
                              {t('bookingHistory.cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BookingHistory;
