import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiUsers, FiCheck, FiX, FiMapPin, FiClock,
  FiCreditCard, FiPhone, FiMail, FiUser, FiChevronRight,
} from 'react-icons/fi';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const TABS_KEY = ['overview', 'itinerary', 'includes', 'payment'];

const ServiceDetails = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', date: '', guests: 1, specialRequests: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchService();
  }, [slug]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      setService(data);

      const { data: related } = await supabase
        .from('services')
        .select('*')
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(3);

      setRelatedServices(related || []);
    } catch {
      setService(null);
      setRelatedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('serviceDetails.bookingForm.loginRequired') || 'Please login to book.');
      navigate('/login');
      return;
    }
    if (!form.name || !form.email || !form.phone || !form.date) {
      toast.error(t('serviceDetails.bookingForm.fillRequired') || 'Please fill all required fields.');
      return;
    }

    setSending(true);
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || form.name || '',
        email: user.email || form.email || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        role: 'user',
      }, { onConflict: 'id' });

      const { error } = await supabase.from('service_bookings').insert({
        service_id: service.id,
        user_id: user.id,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        travel_date: form.date,
        guests: Number(form.guests),
        special_requests: form.specialRequests,
        total_price: service.price * Number(form.guests),
      });
      if (error) throw error;
      toast.success(t('serviceDetails.bookingForm.success') || 'Booking submitted successfully!');
      setForm({ name: '', email: '', phone: '', date: '', guests: 1, specialRequests: '' });
    } catch (err) {
      toast.error(err.message || t('serviceDetails.bookingForm.error') || 'Booking failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const openGallery = (index) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">{t('serviceDetails.notFound') || 'Service Not Found'}</h2>
        <p className="text-gray-400 mb-6">{t('serviceDetails.notFoundDesc') || 'The service you are looking for does not exist.'}</p>
        <Link to="/services" className="gradient-btn px-6 py-3">
          <span>{t('servicesPage.title') || 'Our Services'}</span>
        </Link>
      </div>
    );
  }

  const totalGuests = Number(form.guests) || 1;
  const totalPrice = service.price * totalGuests;

  return (
    <div className="pt-24">
      <PageHeader
        title={service.title}
        titleAr={service.titleAr || service.title}
        breadcrumbs={[
          { name: t('servicesPage.title') || 'Services', path: '/services', nameAr: t('servicesPage.title') || 'Services' },
          { name: service.title, nameAr: service.titleAr || service.title },
        ]}
      />

      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 container-custom mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {service.titleAr || service.title}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm md:text-base">
            {service.category && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4 text-primary" />
                {service.category}
              </span>
            )}
            {service.duration && (
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4 text-primary" />
                {t('serviceDetails.duration')}: {service.duration}
              </span>
            )}
            <span className="text-2xl font-bold text-gradient">
              {formatCurrency(service.price)}
              <span className="text-sm font-normal text-gray-400 ms-1">{t('serviceDetails.perPerson')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Tabs + Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {TABS_KEY.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
                        : 'glass-card text-gray-400 hover:text-white hover:border-primary/50'
                    }`}
                  >
                    {t(`serviceDetails.${tab}`)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {/* Description */}
                    <div className="glass-card p-6 md:p-8">
                      <h2 className="text-2xl font-bold mb-4">{t('serviceDetails.description') || 'Description'}</h2>
                      <p className="text-gray-400 leading-relaxed">{service.description}</p>
                    </div>

                    {/* Highlights */}
                    {service.highlights?.length > 0 && (
                      <div className="glass-card p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-4">{t('serviceDetails.highlights')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {service.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 text-gray-300">
                              <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery */}
                    {service.gallery?.length > 0 && (
                      <div className="glass-card p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-4">{t('serviceDetails.gallery') || 'Gallery'}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {service.gallery.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => openGallery(i)}
                              className="relative aspect-video rounded-xl overflow-hidden group"
                            >
                              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Itinerary Tab */}
                {activeTab === 'itinerary' && (
                  <motion.div
                    key="itinerary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-6 md:p-8"
                  >
                    <h2 className="text-2xl font-bold mb-6">{t('serviceDetails.itinerary')}</h2>
                    {service.itinerary?.length > 0 ? (
                      <div className="space-y-6">
                        {service.itinerary.map((day, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {day.day || i + 1}
                              </div>
                              {i < service.itinerary.length - 1 && (
                                <div className="w-px flex-1 bg-gradient-to-b from-primary/50 to-transparent mt-2" />
                              )}
                            </div>
                            <div className="pb-6 flex-1">
                              <h3 className="font-bold text-lg mb-1">{day.title}</h3>
                              <p className="text-gray-400 text-sm leading-relaxed">{day.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">{t('serviceDetails.noItinerary') || 'Itinerary details will be provided upon booking.'}</p>
                    )}
                  </motion.div>
                )}

                {/* Includes Tab */}
                {activeTab === 'includes' && (
                  <motion.div
                    key="includes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="glass-card p-6 md:p-8">
                      <h3 className="text-xl font-bold mb-4 text-green-400">{t('serviceDetails.includes')}</h3>
                      <div className="space-y-3">
                        {service.includes?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-gray-300">
                            <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass-card p-6 md:p-8">
                      <h3 className="text-xl font-bold mb-4 text-red-400">{t('serviceDetails.notIncluded')}</h3>
                      <div className="space-y-3">
                        {service.excludes?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-gray-300">
                            <FiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-6 md:p-8"
                  >
                    <h2 className="text-2xl font-bold mb-6">{t('serviceDetails.paymentMethods')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {service.payment_methods?.map((method, i) => (
                        <div key={i} className="flex items-center gap-3 glass-card p-4 rounded-xl">
                          <FiCreditCard className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="font-medium">{method}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 glass-card rounded-xl">
                      <h3 className="font-bold mb-2">{t('serviceDetails.paymentPolicy') || 'Payment Policy'}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {t('serviceDetails.paymentPolicyDesc') || 'A 30% deposit is required to confirm your booking. The remaining balance is due 14 days before the service date. Full refund available for cancellations made 30+ days in advance.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Sticky Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gradient">{formatCurrency(service.price)}</span>
                  <p className="text-sm text-gray-500">{t('serviceDetails.perPerson')}</p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('serviceDetails.bookingForm.name')}</label>
                    <div className="relative">
                      <FiUser className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        required
                        className="input-dark w-full ps-10"
                        placeholder={t('serviceDetails.bookingForm.namePlaceholder') || 'Full Name'}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('serviceDetails.bookingForm.email')}</label>
                    <div className="relative">
                      <FiMail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleFormChange}
                        required
                        className="input-dark w-full ps-10"
                        placeholder={t('serviceDetails.bookingForm.emailPlaceholder') || 'Email Address'}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('serviceDetails.bookingForm.phone')}</label>
                    <div className="relative">
                      <FiPhone className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleFormChange}
                        required
                        className="input-dark w-full ps-10"
                        placeholder={t('serviceDetails.bookingForm.phonePlaceholder') || '+1 234 567 890'}
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('serviceDetails.bookingForm.date')}</label>
                    <div className="relative">
                      <FiCalendar className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleFormChange}
                        required
                        className="input-dark w-full ps-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('serviceDetails.bookingForm.guests')}</label>
                    <div className="relative">
                      <FiUsers className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-gray-500" />
                      <select
                        name="guests"
                        value={form.guests}
                        onChange={handleFormChange}
                        className="input-dark w-full ps-10"
                      >
                        {[...Array(20)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('serviceDetails.bookingForm.specialRequests')}</label>
                    <textarea
                      name="specialRequests"
                      value={form.specialRequests}
                      onChange={handleFormChange}
                      rows={3}
                      className="input-dark resize-none w-full"
                      placeholder={t('serviceDetails.bookingForm.specialRequestsPlaceholder') || 'Any special requests...'}
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="p-4 glass-card rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>{t('serviceDetails.perPerson')}</span>
                      <span>{formatCurrency(service.price)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>{t('serviceDetails.bookingForm.guests')}</span>
                      <span>× {totalGuests}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>{t('serviceDetails.total') || 'Total'}</span>
                      <span className="text-gradient">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full gradient-btn py-3 text-center"
                  >
                    <span>{sending ? t('serviceDetails.bookingForm.sending') : t('serviceDetails.bookNow')}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t('serviceDetails.relatedServices')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((rs, i) => (
                <motion.div
                  key={rs.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/services/${rs.slug}`}
                    className="glass-card overflow-hidden group block"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={rs.image}
                        alt={rs.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                      <div className="absolute bottom-3 end-3">
                        <span className="text-xl font-bold text-gradient">{formatCurrency(rs.price)}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {rs.titleAr || rs.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{rs.description}</p>
                      <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium">
                        <span>{t('serviceDetails.viewDetails') || 'View Details'}</span>
                        <FiChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Lightbox */}
      <AnimatePresence>
        {galleryOpen && service.gallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
            onClick={() => setGalleryOpen(false)}
          >
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-6 end-6 text-white text-3xl hover:text-primary transition-colors"
            >
              <FiX className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryIndex((prev) => (prev - 1 + service.gallery.length) % service.gallery.length);
              }}
              className="absolute start-4 md:start-8 text-white text-3xl hover:text-primary transition-colors"
            >
              ‹
            </button>

            <motion.img
              key={galleryIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={service.gallery[galleryIndex]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setGalleryIndex((prev) => (prev + 1) % service.gallery.length);
              }}
              className="absolute end-4 md:end-8 text-white text-3xl hover:text-primary transition-colors"
            >
              ›
            </button>

            <div className="absolute bottom-6 flex gap-2">
              {service.gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryIndex(i);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === galleryIndex ? 'bg-primary w-6' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetails;
