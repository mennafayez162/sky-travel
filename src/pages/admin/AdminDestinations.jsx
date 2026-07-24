import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import Pagination from '../../components/common/Pagination';
import ImageUpload from '../../components/common/ImageUpload';
import { usePagination } from '../../hooks/usePagination';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const slugify = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

const AdminDestinations = () => {
  const { t } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', name_ar: '', description: '', description_ar: '',
    meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
    image: '', country_id: '', is_featured: false, is_active: true, rating: 4.5, price_from: '',
  });
  const [count, setCount] = useState(0);
  const pagination = usePagination(count, 10);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const from = (pagination.currentPage - 1) * 10;
      const to = from + 9;
      const { data, count: c } = await supabase.from('destinations').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
      setDestinations(data || []);
      setCount(c || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCountries = async () => {
    const { data } = await supabase.from('countries').select('id, name, name_ar').order('name');
    setCountries(data || []);
  };

  useEffect(() => { fetchDestinations(); fetchCountries(); }, [pagination.currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = slugify(formData.name || `dest-${Date.now()}`);
      const payload = {
        name: formData.name, name_ar: formData.name_ar,
        slug,
        description: formData.description, description_ar: formData.description_ar,
        meta_title: formData.meta_title, meta_title_ar: formData.meta_title_ar,
        meta_description: formData.meta_description, meta_description_ar: formData.meta_description_ar,
        image: formData.image,
        country_id: formData.country_id || null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        rating: Number(formData.rating) || 4.5,
        price_from: formData.price_from ? Number(formData.price_from) : null,
      };
      if (editing) {
        const { error } = await supabase.from('destinations').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const { error } = await supabase.from('destinations').insert(payload);
        if (error) throw error;
        toast.success('Created');
      }
      setShowModal(false); setEditing(null); fetchDestinations();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.destinations.confirmDelete'))) return;
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted'); fetchDestinations();
  };

  const resetForm = () => setFormData({
    name: '', name_ar: '', description: '', description_ar: '',
    meta_title: '', meta_title_ar: '', meta_description: '', meta_description_ar: '',
    image: '', country_id: '', is_featured: false, is_active: true, rating: 4.5, price_from: '',
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.destinations.title')}</h1>
        <button onClick={() => { setShowModal(true); setEditing(null); resetForm(); }} className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="w-4 h-4" /><span>{t('admin.destinations.add')}</span>
        </button>
      </div>

      {loading ? <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div> : (
        <>
          {/* Mobile Cards */}
          <div className="block lg:hidden space-y-3">
            {destinations.map((d) => (
              <div key={d.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={d.image || 'https://via.placeholder.com/100'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-gray-500 truncate">{d.name_ar || ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${d.is_featured ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{d.is_featured ? 'Featured' : 'Normal'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Rating: {d.rating || '-'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(d); setFormData({ name: d.name || '', name_ar: d.name_ar || '', description: d.description || '', description_ar: d.description_ar || '', meta_title: d.meta_title || '', meta_title_ar: d.meta_title_ar || '', meta_description: d.meta_description || '', meta_description_ar: d.meta_description_ar || '', image: d.image || '', country_id: d.country_id || '', is_featured: d.is_featured || false, rating: d.rating || 4.5, price_from: d.price_from || '' }); setShowModal(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-dark-border">
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.destinations.table.destination')}</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Rating</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.destinations.featured')}</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr></thead>
                <tbody>
                  {destinations.map((d) => (
                    <tr key={d.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                      <td className="p-4"><div className="flex items-center gap-3">
                        <img src={d.image || 'https://via.placeholder.com/100'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-gray-500">{d.name_ar || ''}</p></div>
                      </div></td>
                      <td className="p-4 text-sm">{d.rating || '-'}</td>
                      <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${d.is_featured ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{d.is_featured ? 'Yes' : 'No'}</span></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditing(d); setFormData({ name: d.name || '', name_ar: d.name_ar || '', description: d.description || '', description_ar: d.description_ar || '', meta_title: d.meta_title || '', meta_title_ar: d.meta_title_ar || '', meta_description: d.meta_description || '', meta_description_ar: d.meta_description_ar || '', image: d.image || '', country_id: d.country_id || '', is_featured: d.is_featured || false, rating: d.rating || 4.5, price_from: d.price_from || '' }); setShowModal(true); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing ? t('admin.destinations.edit') : t('admin.destinations.addNew')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Name (English)</label><input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="input-dark" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Name (Arabic)</label><input type="text" value={formData.name_ar} onChange={(e) => setFormData(p => ({ ...p, name_ar: e.target.value }))} className="input-dark" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Description (English)</label><textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="input-dark resize-none" rows={3} /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Description (Arabic)</label><textarea value={formData.description_ar} onChange={(e) => setFormData(p => ({ ...p, description_ar: e.target.value }))} className="input-dark resize-none" rows={3} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-300 mb-1">Price From</label><input type="number" value={formData.price_from} onChange={(e) => setFormData(p => ({ ...p, price_from: e.target.value }))} className="input-dark" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Rating</label><input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={(e) => setFormData(p => ({ ...p, rating: e.target.value }))} className="input-dark" /></div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">{t('admin.destinations.form.country')}</label>
                <select value={formData.country_id} onChange={(e) => setFormData(p => ({ ...p, country_id: e.target.value }))} className="input-dark">
                  <option value="">{t('admin.destinations.form.selectCountry')}</option>
                  {countries.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <ImageUpload value={formData.image} onChange={(url) => setFormData(p => ({ ...p, image: url }))} bucket="images" folder="destinations" label={t('admin.destinations.form.image')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} /><span className="text-sm text-gray-300">{t('admin.destinations.form.featured')}</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} /><span className="text-sm text-gray-300">{t('admin.trips.active')}</span></label>
              </div>
              <div className="border-t border-dark-border pt-4 mt-2">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">SEO (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-300 mb-1">Meta Title (EN)</label><input type="text" value={formData.meta_title} onChange={(e) => setFormData(p => ({ ...p, meta_title: e.target.value }))} className="input-dark" /></div>
                  <div><label className="block text-sm text-gray-300 mb-1">Meta Title (AR)</label><input type="text" value={formData.meta_title_ar} onChange={(e) => setFormData(p => ({ ...p, meta_title_ar: e.target.value }))} className="input-dark" dir="rtl" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div><label className="block text-sm text-gray-300 mb-1">Meta Description (EN)</label><textarea value={formData.meta_description} onChange={(e) => setFormData(p => ({ ...p, meta_description: e.target.value }))} className="input-dark resize-none" rows={2} /></div>
                  <div><label className="block text-sm text-gray-300 mb-1">Meta Description (AR)</label><textarea value={formData.meta_description_ar} onChange={(e) => setFormData(p => ({ ...p, meta_description_ar: e.target.value }))} className="input-dark resize-none" rows={2} dir="rtl" /></div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3">{t('admin.destinations.cancel')}</button>
                <button type="submit" className="flex-1 gradient-btn py-3"><span>{t('admin.destinations.save')}</span></button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;
