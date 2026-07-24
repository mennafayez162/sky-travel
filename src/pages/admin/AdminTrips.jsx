import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import ImageUpload from '../../components/common/ImageUpload';
import { supabase } from '../../services/supabase';

const slugify = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

const AdminTrips = () => {
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    title: '', title_ar: '',
    description: '', description_ar: '',
    short_description: '', short_description_ar: '',
    highlights: '', highlights_ar: '',
    includes: '', includes_ar: '',
    excludes: '', excludes_ar: '',
    price: '', discount: '', duration: '', destination_id: '',
    price_currency: 'EGP',
    image: '', is_featured: false, is_active: true,
    available_seats: '',
    travel_dates: '[]',
    gallery: [],
  });
  const [destinations, setDestinations] = useState([]);
  const [count, setCount] = useState(0);
  const pagination = usePagination(count, 10);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const from = (pagination.currentPage - 1) * 10;
      const to = from + 9;
      const { data, count: c } = await supabase.from('trips').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
      setTrips(data || []);
      setCount(c || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchDestinations = async () => {
    const { data } = await supabase.from('destinations').select('*').order('name');
    setDestinations(data || []);
  };

  useEffect(() => { fetchTrips(); fetchDestinations(); }, [pagination.currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const toArray = (v) => (typeof v === 'string' ? v.split('\n').map(l => l.trim()).filter(Boolean) : Array.isArray(v) ? v : []);
      let travelDatesParsed = [];
      try { travelDatesParsed = JSON.parse(formData.travel_dates || '[]'); } catch { travelDatesParsed = []; }

      let slug = slugify(formData.title || `trip-${Date.now()}`);

      if (!editingTrip) {
        const { data: existing } = await supabase.from('trips').select('id').eq('slug', slug).maybeSingle();
        if (existing) slug = `${slug}-${Date.now()}`;
      }

      const payload = {
        title: formData.title, title_ar: formData.title_ar,
        slug,
        description: formData.description, description_ar: formData.description_ar,
        short_description: formData.short_description, short_description_ar: formData.short_description_ar,
        highlights: toArray(formData.highlights), highlights_ar: toArray(formData.highlights_ar),
        includes: toArray(formData.includes), includes_ar: toArray(formData.includes_ar),
        excludes: toArray(formData.excludes), excludes_ar: toArray(formData.excludes_ar),
        price: formData.price !== '' ? Number(formData.price) : null,
        price_currency: formData.price_currency || 'EGP',
        discount: formData.discount !== '' ? Number(formData.discount) : null,
        duration: formData.duration,
        destination_id: formData.destination_id || null,
        image: formData.image,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        available_seats: formData.available_seats !== '' ? Number(formData.available_seats) : null,
        travel_dates: travelDatesParsed,
        gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
      };

      if (editingTrip) {
        const { error } = await supabase.from('trips').update(payload).eq('id', editingTrip.id);
        if (error) throw error;
        toast.success(t('admin.trips.update'));
      } else {
        const { error } = await supabase.from('trips').insert(payload);
        if (error) throw error;
        toast.success(t('admin.trips.create'));
      }
      setShowModal(false); setEditingTrip(null); resetForm(); fetchTrips();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    const toText = (v) => Array.isArray(v) ? v.join('\n') : (v || '');
    setFormData({
      title: trip.title || '', title_ar: trip.title_ar || '',
      description: trip.description || '', description_ar: trip.description_ar || '',
      short_description: trip.short_description || '', short_description_ar: trip.short_description_ar || '',
      highlights: toText(trip.highlights), highlights_ar: toText(trip.highlights_ar),
      includes: toText(trip.includes), includes_ar: toText(trip.includes_ar),
      excludes: toText(trip.excludes), excludes_ar: toText(trip.excludes_ar),
      price: trip.price || '', price_currency: trip.price_currency || 'EGP',
      discount: trip.discount || '', duration: trip.duration || '',
      destination_id: trip.destination_id || '', image: trip.image || '',
      is_featured: trip.is_featured || false, is_active: trip.is_active !== false,
      available_seats: trip.available_seats ?? '',
      travel_dates: JSON.stringify(trip.travel_dates || [], null, 2),
      gallery: Array.isArray(trip.gallery) ? trip.gallery : [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.trips.confirmDelete'))) return;
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.trips.confirmDelete')); fetchTrips();
  };

  const resetForm = () => {
    setEditingTrip(null);
    setFormData({
      title: '', title_ar: '', description: '', description_ar: '',
      short_description: '', short_description_ar: '',
      highlights: '', highlights_ar: '', includes: '', includes_ar: '',
      excludes: '', excludes_ar: '',
      price: '', discount: '', duration: '', destination_id: '',
      price_currency: 'EGP', image: '', is_featured: false, is_active: true,
      available_seats: '', travel_dates: '[]', gallery: [],
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.trips.title')}</h1>
        <button onClick={() => { setShowModal(true); resetForm(); }} className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="w-4 h-4" /><span>{t('admin.trips.addTrip')}</span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-400">{t('common.loading')}</div>
        ) : trips.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">No trips</div>
        ) : trips.map((trip) => (
          <div key={trip.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img src={trip.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100'} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{trip.title}</p>
                <p className="text-xs text-gray-500 truncate">{trip.title_ar || ''}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${trip.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{trip.is_active ? t('admin.trips.active') : t('admin.trips.inactive')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500 text-xs">Price</span><p className="font-bold text-gradient">{formatCurrency(trip.price, trip.price_currency || 'EGP')}</p></div>
              <div><span className="text-gray-500 text-xs">Duration</span><p className="text-gray-300">{trip.duration}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(trip)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleDelete(trip.id)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-1"><FiTrash2 className="w-3 h-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-dark-border">
              <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.trips.form.title')}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.trips.form.price')}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.trips.form.duration')}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
              <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
            </tr></thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                  <td className="p-4"><div className="flex items-center gap-3">
                    <img src={trip.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=100'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div><p className="text-sm font-medium">{trip.title}</p><p className="text-xs text-gray-500">{trip.title_ar || ''}</p></div>
                  </div></td>
                  <td className="p-4 text-sm font-bold text-gradient">{formatCurrency(trip.price, trip.price_currency || 'EGP')}</td>
                  <td className="p-4 text-sm text-gray-400">{trip.duration}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${trip.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{trip.is_active ? t('admin.trips.active') : t('admin.trips.inactive')}</span></td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(trip)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(trip.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
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
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editingTrip ? t('admin.trips.editTrip') : t('admin.trips.addNewTrip')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Title (English)</label><input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required className="input-dark" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Title (Arabic)</label><input type="text" value={formData.title_ar} onChange={(e) => setFormData(p => ({ ...p, title_ar: e.target.value }))} className="input-dark" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Description (English)</label><textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="input-dark resize-none" rows={3} /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Description (Arabic)</label><textarea value={formData.description_ar} onChange={(e) => setFormData(p => ({ ...p, description_ar: e.target.value }))} className="input-dark resize-none" rows={3} dir="rtl" /></div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">{t('admin.trips.form.destination')}</label>
                <select value={formData.destination_id} onChange={(e) => setFormData(p => ({ ...p, destination_id: e.target.value }))} className="input-dark">
                  <option value="">{t('admin.trips.form.selectDestination')}</option>
                  {destinations.map((dest) => (<option key={dest.id} value={dest.id}>{dest.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">{t('admin.trips.form.price')}</label><input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} required className="input-dark" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Currency</label>
                  <select value={formData.price_currency} onChange={(e) => setFormData(p => ({ ...p, price_currency: e.target.value }))} className="input-dark">
                    <option value="EGP">ج.م (EGP)</option><option value="USD">$ (USD)</option><option value="EUR">€ (EUR)</option><option value="GBP">£ (GBP)</option>
                  </select>
                </div>
                <div><label className="block text-sm text-gray-300 mb-1">{t('admin.trips.form.discount')} (%)</label><input type="number" value={formData.discount} onChange={(e) => setFormData(p => ({ ...p, discount: e.target.value }))} className="input-dark" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">{t('admin.trips.form.duration')}</label><input type="text" value={formData.duration} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))} className="input-dark" placeholder="7 Days" /></div>
              </div>
              <div><label className="block text-sm text-gray-300 mb-1">Available Seats</label><input type="number" value={formData.available_seats} onChange={(e) => setFormData(p => ({ ...p, available_seats: e.target.value }))} className="input-dark" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Highlights (one per line)</label><textarea value={formData.highlights} onChange={(e) => setFormData(p => ({ ...p, highlights: e.target.value }))} className="input-dark resize-none" rows={4} /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Highlights Arabic (one per line)</label><textarea value={formData.highlights_ar} onChange={(e) => setFormData(p => ({ ...p, highlights_ar: e.target.value }))} className="input-dark resize-none" rows={4} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Includes (one per line)</label><textarea value={formData.includes} onChange={(e) => setFormData(p => ({ ...p, includes: e.target.value }))} className="input-dark resize-none" rows={3} /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Includes Arabic (one per line)</label><textarea value={formData.includes_ar} onChange={(e) => setFormData(p => ({ ...p, includes_ar: e.target.value }))} className="input-dark resize-none" rows={3} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Excludes (one per line)</label><textarea value={formData.excludes} onChange={(e) => setFormData(p => ({ ...p, excludes: e.target.value }))} className="input-dark resize-none" rows={3} /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Excludes Arabic (one per line)</label><textarea value={formData.excludes_ar} onChange={(e) => setFormData(p => ({ ...p, excludes_ar: e.target.value }))} className="input-dark resize-none" rows={3} dir="rtl" /></div>
              </div>
              <div><label className="block text-sm text-gray-300 mb-1">Gallery URLs (one per line)</label>
                <textarea value={(formData.gallery || []).join('\n')} onChange={(e) => setFormData(p => ({ ...p, gallery: e.target.value.split('\n').map(l => l.trim()).filter(Boolean) }))} className="input-dark resize-none" rows={3} placeholder="https://..." />
              </div>
              <ImageUpload value={formData.image} onChange={(url) => setFormData(p => ({ ...p, image: url }))} bucket="images" folder="trips" label={t('admin.trips.form.image')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} className="rounded" /><span className="text-sm text-gray-300">{t('admin.trips.form.featured')}</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="rounded" /><span className="text-sm text-gray-300">{t('admin.trips.active')}</span></label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3">{t('admin.trips.cancel')}</button>
                <button type="submit" className="flex-1 gradient-btn py-3"><span>{editingTrip ? t('admin.trips.update') : t('admin.trips.create')}</span></button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTrips;
