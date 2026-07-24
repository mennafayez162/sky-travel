import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiMapPin, FiClock, FiStar, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Wishlist = () => {
  const { t } = useLanguage();
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (tripId) => {
    setRemovingId(tripId);
    try {
      await removeFromWishlist(tripId);
      toast.success('Removed from wishlist.');
    } catch (err) {
      toast.error('Failed to remove.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title={t('wishlist.title')}
        breadcrumbs={[{ name: t('wishlist.breadcrumb') }]}
      />

      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          {wishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FiHeart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{t('wishlist.emptyTitle')}</h3>
              <p className="text-gray-500 mb-6">{t('wishlist.emptySubtitle')}</p>
              <Link to="/trips" className="gradient-btn inline-block px-6 py-3">
                {t('wishlist.exploreTrips')}
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {wishlist.map((item, index) => {
                  const trip = item.trip || item;
                  return (
                    <motion.div
                      key={item.id || item.trip_id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card overflow-hidden group card-hover"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={trip.image || trip.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'}
                          alt={trip.title || 'Trip'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(item.trip_id || trip.id)}
                          disabled={removingId === (item.trip_id || trip.id)}
                          className="absolute top-3 right-3 w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>

                        {trip.discount && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 rounded-lg text-xs font-bold">
                            -{trip.discount}%
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                          <FiMapPin className="w-4 h-4 text-primary" />
                          <span>{trip.destination?.name || trip.location || 'Unknown'}</span>
                        </div>

                        <h3 className="font-bold text-lg mb-3 line-clamp-1">
                          {trip.title || 'Trip'}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {trip.duration || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-yellow-500" />
                            {trip.rating || '4.8'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {trip.discount ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-gradient">
                                  {formatCurrency(trip.price * (1 - trip.discount / 100))}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatCurrency(trip.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gradient">
                                {formatCurrency(trip.price)}
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/trips/${trip.id}`}
                            className="flex items-center gap-1 gradient-btn px-4 py-2 text-sm"
                          >
                            <span>{t('wishlist.view')}</span>
                            <FiArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Wishlist;
