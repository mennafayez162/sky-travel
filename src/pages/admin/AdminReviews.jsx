import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiTrash2, FiEye, FiEyeOff, FiPlus, FiEdit2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const AdminReviews = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    comment: '', comment_ar: '', rating: 5,
    visitor_name: '', visitor_country: '',
    trip_id: '', user_id: '', is_visible: true, is_approved: true,
  });
  const [trips, setTrips] = useState([]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*, profiles(full_name), trips(title)').order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const fetchTrips = async () => {
    const { data } = await supabase.from('trips').select('id, title').order('title');
    setTrips(data || []);
  };

  useEffect(() => { fetchReviews(); fetchTrips(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      comment: form.comment,
      comment_ar: form.comment_ar,
      rating: Number(form.rating),
      visitor_name: form.visitor_name,
      visitor_country: form.visitor_country,
      trip_id: form.trip_id || null,
      user_id: form.user_id || null,
      is_visible: form.is_visible,
      is_approved: form.is_approved,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('reviews').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const { error } = await supabase.from('reviews').insert(payload);
        if (error) throw error;
        toast.success('Created');
      }
      setShowModal(false); setEditing(null); fetchReviews();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.reviews.confirmDelete'))) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.reviews.deleted')); fetchReviews();
  };

  const handleToggleVisibility = async (id, current) => {
    const { error } = await supabase.from('reviews').update({ is_visible: !current }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_visible: !current } : r));
    toast.success(!current ? t('admin.reviews.visible') : t('admin.reviews.hidden'));
  };

  const emptyForm = { comment: '', comment_ar: '', rating: 5, visitor_name: '', visitor_country: '', trip_id: '', user_id: '', is_visible: true, is_approved: true };

  const handleEdit = (r) => {
    setEditing(r);
    setForm({
      comment: r.comment || '',
      comment_ar: r.comment_ar || '',
      rating: r.rating || 5,
      visitor_name: r.visitor_name || '',
      visitor_country: r.visitor_country || '',
      trip_id: r.trip_id || '',
      user_id: r.user_id || '',
      is_visible: r.is_visible !== false,
      is_approved: r.is_approved !== false,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.reviews.title')}</h1>
        <button onClick={() => { setShowModal(true); setEditing(null); setForm(emptyForm); }}
          className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="w-4 h-4" /><span>Add Review</span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-400">{t('common.loading')}</div>
        ) : reviews.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">No reviews</div>
        ) : reviews.map((r) => (
          <div key={r.id} className="glass-card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{r.visitor_name || r.profiles?.full_name || 'N/A'}</p>
                {r.visitor_country && <p className="text-xs text-gray-500">{r.visitor_country}</p>}
                <p className="text-xs text-gray-400 mt-1">{r.trips?.title || 'N/A'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${r.is_visible !== false ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {r.is_visible !== false ? t('admin.reviews.visible') : t('admin.reviews.hidden')}
              </span>
            </div>
            <div className="flex gap-0.5">{[1,2,3,4,5].map((i) => <FiStar key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />)}</div>
            <p className="text-sm text-gray-400 line-clamp-2">{r.comment}</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => handleEdit(r)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleToggleVisibility(r.id, r.is_visible !== false)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-gray-500/10 text-gray-400 border border-gray-500/20 flex items-center justify-center gap-1">
                {r.is_visible !== false ? <><FiEyeOff className="w-3 h-3" /> Hide</> : <><FiEye className="w-3 h-3" /> Show</>}
              </button>
              <button onClick={() => handleDelete(r.id)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-1"><FiTrash2 className="w-3 h-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-dark-border">
            <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.user')}</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.trip')}</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.rating')}</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.comment')}</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.status')}</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.date')}</th>
            <th className="text-right p-4 text-sm font-semibold text-gray-400">{t('admin.reviews.actions')}</th>
          </tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                <td className="p-4">
                  <div>
                    <p className="text-sm">{r.visitor_name || r.profiles?.full_name || 'N/A'}</p>
                    {r.visitor_country && <p className="text-xs text-gray-500">{r.visitor_country}</p>}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400">{r.trips?.title || 'N/A'}</td>
                <td className="p-4"><div className="flex gap-0.5">{[1,2,3,4,5].map((i) => <FiStar key={i} className={`w-3 h-3 ${i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />)}</div></td>
                <td className="p-4 text-sm text-gray-400 max-w-xs truncate">{r.comment}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${r.is_visible !== false ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {r.is_visible !== false ? t('admin.reviews.visible') : t('admin.reviews.hidden')}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">{formatDate(r.created_at)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(r)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleToggleVisibility(r.id, r.is_visible !== false)}
                      className={`p-2 rounded-lg ${r.is_visible !== false ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-400 hover:bg-gray-500/10'}`}>
                      {r.is_visible !== false ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing ? 'Edit Review' : 'Add Review'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Visitor Name</label>
                  <input type="text" value={form.visitor_name} onChange={(e) => setForm(p => ({ ...p, visitor_name: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Visitor Country</label>
                  <input type="text" value={form.visitor_country} onChange={(e) => setForm(p => ({ ...p, visitor_country: e.target.value }))} className="input-dark" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">{t('admin.reviews.trip')}</label>
                <select value={form.trip_id} onChange={(e) => setForm(p => ({ ...p, trip_id: e.target.value }))} className="input-dark">
                  <option value="">Select Trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>{trip.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">{t('admin.reviews.rating')}</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <button key={i} type="button" onClick={() => setForm(p => ({ ...p, rating: i }))}>
                      <FiStar className={`w-6 h-6 ${i <= form.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Comment (English)</label>
                  <textarea value={form.comment} onChange={(e) => setForm(p => ({ ...p, comment: e.target.value }))} className="input-dark resize-none" rows={4} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Comment (Arabic)</label>
                  <textarea value={form.comment_ar} onChange={(e) => setForm(p => ({ ...p, comment_ar: e.target.value }))} className="input-dark resize-none" rows={4} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm(p => ({ ...p, is_visible: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-300">Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_approved} onChange={(e) => setForm(p => ({ ...p, is_approved: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-300">Approved</span>
                </label>
              </div>

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

export default AdminReviews;
