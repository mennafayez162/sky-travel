import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiX, FiMapPin } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import TripCard from '../components/trips/TripCard';
import Pagination from '../components/common/Pagination';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { supabase } from '../services/supabase';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';

const Trips = () => {
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 500);

  const [filters, setFilters] = useState({
    destination: searchParams.get('destination') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    duration: searchParams.get('duration') || '',
    sort: 'created_at',
  });

  const pagination = usePagination(totalItems, 9);

  useEffect(() => {
    fetchTrips();
  }, [pagination.currentPage, debouncedSearch, filters]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .or('is_active.eq.true,is_active.is.null');

      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,title_ar.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

      const from = (pagination.currentPage - 1) * 9;
      const to = from + 8;

      let orderCol = 'created_at';
      let ascending = false;
      if (filters.sort === 'price') { orderCol = 'price'; ascending = true; }
      else if (filters.sort === 'rating') { orderCol = 'rating'; ascending = false; }
      else if (filters.sort === 'booking_count') { orderCol = 'booking_count'; ascending = false; }

      query = query.order(orderCol, { ascending }).range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setTrips(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    pagination.goToPage(1);
  };

  const clearFilters = () => {
    setFilters({ destination: '', minPrice: '', maxPrice: '', duration: '', sort: 'created_at' });
    setSearch('');
    pagination.goToPage(1);
  };

  return (
    <>
      <PageHeader
        title={t('trips.title')}
        breadcrumbs={[{ name: t('trips.breadcrumb') }]}
      />

      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('trips.searchPlaceholder')}
                className="input-dark pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                showFilters ? 'gradient-btn' : 'glass-card hover:border-primary/50'
              }`}
            >
              <FiFilter className="w-4 h-4" />
              <span>{t('trips.filters')}</span>
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder={isRTL ? 'السعر من' : 'Min Price'}
                  className="input-dark"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder={isRTL ? 'السعر إلى' : 'Max Price'}
                  className="input-dark"
                />
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="input-dark"
                >
                  <option value="created_at">{t('trips.newest')}</option>
                  <option value="price">{t('trips.priceLowHigh')}</option>
                  <option value="rating">{t('trips.topRated')}</option>
                  <option value="booking_count">{t('trips.mostPopular')}</option>
                </select>
              </div>
              <button onClick={clearFilters} className="flex items-center gap-2 text-gray-400 hover:text-white mt-4 transition-colors">
                <FiX className="w-4 h-4" />
                {t('trips.clearFilters')}
              </button>
            </motion.div>
          )}

          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : trips.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <FiMapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد رحلات' : 'No trips found'}</h3>
              <p className="text-gray-500 mb-6">{isRTL ? 'أضف الرحلات من لوحة التحكم' : 'Add trips from Admin Dashboard'}</p>
              <button onClick={clearFilters} className="gradient-btn px-6 py-3">
                {t('trips.clearFilters')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <TripCard trip={trip} />
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

export default Trips;
