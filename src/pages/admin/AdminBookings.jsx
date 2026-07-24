import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 10;

const AdminBookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const pagination = usePagination(total, PAGE_SIZE);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('*, profiles(full_name), trips(title)', { count: 'exact' });

      if (statusFilter) query = query.eq('status', statusFilter);

      const from = (pagination.currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setBookings(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [pagination.currentPage, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const statusColors = {
    confirmed: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('admin.bookings.title')}</h1>
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); pagination.goToPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'gradient-btn' : 'glass-card text-gray-400'}`}>
              {s || t('admin.bookings.all')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-gray-400">{t('common.loading')}</div>
      ) : bookings.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">{t('admin.bookings.noBookings')}</div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block lg:hidden space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-mono text-primary">{b.booking_reference}</p>
                    <p className="text-sm font-medium mt-1">{b.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-500/20 text-gray-400'}`}>{b.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500 text-xs">Trip</span><p className="text-gray-300 truncate">{b.trips?.title || 'N/A'}</p></div>
                  <div><span className="text-gray-500 text-xs">Date</span><p className="text-gray-300">{formatDate(b.travel_date)}</p></div>
                  <div><span className="text-gray-500 text-xs">Amount</span><p className="font-bold text-gradient">{formatCurrency(b.total_price)}</p></div>
                </div>
                {b.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="flex-1 py-2 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">Confirm</button>
                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="flex-1 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">Cancel</button>
                  </div>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => updateStatus(b.id, 'completed')} className="w-full py-2 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Complete</button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left p-4 text-sm font-semibold text-gray-400">Reference</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-400">Customer</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-400">Trip</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-400">Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-400">Amount</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                      <td className="p-4 text-sm font-mono text-primary">{b.booking_reference}</td>
                      <td className="p-4 text-sm">{b.profiles?.full_name || 'N/A'}</td>
                      <td className="p-4 text-sm text-gray-400">{b.trips?.title || 'N/A'}</td>
                      <td className="p-4 text-sm text-gray-400">{formatDate(b.travel_date)}</td>
                      <td className="p-4 text-sm font-bold text-gradient">{formatCurrency(b.total_price)}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-500/20 text-gray-400'}`}>{b.status}</span></td>
                      <td className="p-4 text-right flex items-center justify-end gap-1">
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(b.id, 'confirmed')} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg" title="Confirm"><FiCheck className="w-4 h-4" /></button>
                            <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="Cancel"><FiX className="w-4 h-4" /></button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => updateStatus(b.id, 'completed')} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg" title="Complete"><FiCheck className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} paginationRange={pagination.paginationRange} onPageChange={pagination.goToPage} onNext={pagination.goToNextPage} onPrev={pagination.goToPrevPage} onFirst={pagination.goToFirstPage} onLast={pagination.goToLastPage} />
    </div>
  );
};

export default AdminBookings;
