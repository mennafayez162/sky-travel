import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

const AdminOffers = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [count, setCount] = useState(0);
  const [form, setForm] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    discount_percentage: '', start_date: '', end_date: '',
    trip_id: '', image: '', is_active: true,
  });
  const pagination = usePagination(count, 10);

  const fetchOffers = async () => {
    setLoading(true);
    const { data, count: c } = await supabase
      .from('offers')
      .select('*, trips(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((pagination.currentPage - 1) * 10, pagination.currentPage * 10 - 1);
    setOffers(data || []);
    setCount(c || 0);
    setLoading(false);
  };

  const fetchTrips = async () => {
    const { data } = await supabase.from('trips').select('id, title').order('title');
    setTrips(data || []);
  };

  useEffect(() => { fetchOffers(); }, [pagination.currentPage]);
  useEffect(() => { fetchTrips(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      title_ar: form.title_ar,
      description: form.description,
      description_ar: form.description_ar,
      discount_percentage: form.discount_percentage !== '' ? Number(form.discount_percentage) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      trip_id: form.trip_id || null,
      image: form.image,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('offers').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const { error } = await supabase.from('offers').insert(payload);
        if (error) throw error;
        toast.success('Created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm());
      fetchOffers();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.offers.confirmDelete', 'Delete this offer?'))) return;
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted');
    fetchOffers();
  };

  const emptyForm = () => ({
    title: '', title_ar: '', description: '', description_ar: '',
    discount_percentage: '', start_date: '', end_date: '',
    trip_id: '', image: '', is_active: true,
  });

  const handleEdit = (o) => {
    setEditing(o);
    setForm({
      title: o.title || '',
      title_ar: o.title_ar || '',
      description: o.description || '',
      description_ar: o.description_ar || '',
      discount_percentage: o.discount_percentage ?? '',
      start_date: o.start_date ? o.start_date.substring(0, 10) : '',
      end_date: o.end_date ? o.end_date.substring(0, 10) : '',
      trip_id: o.trip_id || '',
      image: o.image || '',
      is_active: o.is_active !== false,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.offers.title', 'Offers')}</h1>
        <button onClick={() => { setShowModal(true); setEditing(null); setForm(emptyForm()); }}
          className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="w-4 h-4" /><span>{t('admin.offers.add', 'Add Offer')}</span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-400">Loading...</div>
        ) : offers.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">No offers found</div>
        ) : offers.map((o) => (
          <div key={o.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              {o.image ? (
                <img src={o.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-gray-500 text-xs flex-shrink-0">N/A</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{o.title}</p>
                <p className="text-xs text-gray-500 truncate">{o.title_ar || ''}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${o.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {o.is_active ? t('admin.trips.active') : t('admin.trips.inactive')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500 text-xs">Discount</span><p className="font-bold text-gradient">{o.discount_percentage ? `${o.discount_percentage}%` : '-'}</p></div>
              <div><span className="text-gray-500 text-xs">Trip</span><p className="text-gray-300 truncate">{o.trips?.title || 'All'}</p></div>
              <div className="col-span-2"><span className="text-gray-500 text-xs">Dates</span><p className="text-gray-400 text-xs">{o.start_date ? o.start_date.substring(0, 10) : '-'} → {o.end_date ? o.end_date.substring(0, 10) : '-'}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(o)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleDelete(o.id)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-1"><FiTrash2 className="w-3 h-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Offer</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Discount</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Dates</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Trip</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {o.image ? (
                        <img src={o.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-gray-500 text-xs">N/A</div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{o.title}</p>
                        <p className="text-xs text-gray-500">{o.title_ar || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-gradient">{o.discount_percentage ? `${o.discount_percentage}%` : '-'}</td>
                  <td className="p-4 text-xs text-gray-400">
                    {o.start_date ? o.start_date.substring(0, 10) : '-'} → {o.end_date ? o.end_date.substring(0, 10) : '-'}
                  </td>
                  <td className="p-4 text-sm text-gray-400">{o.trips?.title || 'All'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${o.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {o.is_active ? t('admin.trips.active') : t('admin.trips.inactive')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(o)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(o.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} paginationRange={pagination.paginationRange} onPageChange={pagination.goToPage} onNext={pagination.goToNextPage} onPrev={pagination.goToPrevPage} onFirst={pagination.goToFirstPage} onLast={pagination.goToLastPage} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing ? 'Edit Offer' : 'Add Offer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Title (English)</label>
                  <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Title (Arabic)</label>
                  <input type="text" value={form.title_ar} onChange={(e) => setForm(p => ({ ...p, title_ar: e.target.value }))} className="input-dark" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description (English)</label>
                  <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input-dark resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description (Arabic)</label>
                  <textarea value={form.description_ar} onChange={(e) => setForm(p => ({ ...p, description_ar: e.target.value }))} className="input-dark resize-none" rows={3} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Discount %</label>
                  <input type="number" min="0" max="100" value={form.discount_percentage} onChange={(e) => setForm(p => ({ ...p, discount_percentage: e.target.value }))} required className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm(p => ({ ...p, start_date: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm(p => ({ ...p, end_date: e.target.value }))} className="input-dark" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Trip (optional)</label>
                <select value={form.trip_id} onChange={(e) => setForm(p => ({ ...p, trip_id: e.target.value }))} className="input-dark">
                  <option value="">All Trips</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>{trip.title}</option>
                  ))}
                </select>
              </div>

              <ImageUpload
                value={form.image}
                onChange={(url) => setForm(p => ({ ...p, image: url }))}
                bucket="images"
                folder="offers"
                label="Offer Image"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-300">{t('admin.trips.active')}</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3">Cancel</button>
                <button type="submit" className="flex-1 gradient-btn py-3"><span>{editing ? 'Update' : 'Create'}</span></button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;
