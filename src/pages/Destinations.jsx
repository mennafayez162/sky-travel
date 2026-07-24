import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiSearch, FiHeart } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { supabase } from '../services/supabase';
import { usePagination } from '../hooks/usePagination';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

const Destinations = () => {
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const pagination = usePagination(totalItems, 9);

  useEffect(() => {
    fetchDestinations();
  }, [pagination.currentPage]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('destinations')
        .select('*', { count: 'exact' })
        .or('is_active.eq.true,is_active.is.null');

      if (search) {
        query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`);
      }

      const from = (pagination.currentPage - 1) * 9;
      const to = from + 8;

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setDestinations(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={t('destinations.title')} breadcrumbs={[{ name: t('destinations.breadcrumb') }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="relative max-w-md mx-auto mb-12">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); pagination.goToPage(1); }}
              placeholder={t('destinations.searchPlaceholder')}
              className="input-dark pl-12"
            />
          </div>

          {loading ? <SkeletonLoader type="card" count={6} /> : destinations.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <FiMapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد وجهات' : 'No destinations found'}</h3>
              <p className="text-gray-500">{isRTL ? 'أضف الوجهات من لوحة التحكم' : 'Add destinations from Admin Dashboard'}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest, i) => (
                  <motion.div key={dest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link to={`/destinations/${dest.slug}`} className="group block glass-card overflow-hidden card-hover">
                      <div className="relative h-64 overflow-hidden">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <button className="absolute top-4 right-4 w-9 h-9 glass-card rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all">
                          <FiHeart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{isRTL ? dest.name_ar || dest.name : dest.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-gray-400">{dest.rating || '4.5'}</span>
                            </div>
                          </div>
                          {dest.price_from > 0 && (
                            <div className="text-right">
                              <span className="text-xs text-gray-500">{t('destinations.from')}</span>
                              <p className="text-xl font-bold text-gradient">{formatPrice(dest.price_from)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                paginationRange={pagination.paginationRange}
                onPageChange={pagination.goToPage}
                onNext={pagination.goToNextPage}
                onPrev={pagination.goToPrevPage}
                onFirst={pagination.goToFirstPage}
                onLast={pagination.goToLastPage}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Destinations;
