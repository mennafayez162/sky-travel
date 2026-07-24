import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiImage, FiPlus, FiX, FiEdit2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import ImageUpload from '../../components/common/ImageUpload';

const AdminGallery = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    category: '', image: '',
  });

  const fetchImages = async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }).limit(100);
    setImages(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('gallery').select('category');
    if (data) {
      const unique = [...new Set(data.map((d) => d.category).filter(Boolean))];
      setCategories(unique);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image && !editing) {
      toast.error(t('admin.gallery.imageRequired'));
      return;
    }

    const payload = {
      title: formData.title,
      title_ar: formData.title_ar,
      description: formData.description,
      description_ar: formData.description_ar,
      category: formData.category,
    };
    if (formData.image) payload.image = formData.image;

    if (editing) {
      const { error } = await supabase.from('gallery').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Updated');
    } else {
      const maxSort = images.reduce((max, img) => Math.max(max, img.sort_order || 0), 0);
      const { error } = await supabase.from('gallery').insert({ ...payload, image: formData.image, sort_order: maxSort + 1 });
      if (error) { toast.error(error.message); return; }
      toast.success(t('admin.gallery.created'));
    }

    setShowModal(false);
    setEditing(null);
    setFormData({ title: '', title_ar: '', description: '', description_ar: '', category: '', image: '' });
    fetchImages();
  };

  const handleEdit = (img) => {
    setEditing(img);
    setFormData({
      title: img.title || '',
      title_ar: img.title_ar || '',
      description: img.description || '',
      description_ar: img.description_ar || '',
      category: img.category || '',
      image: img.image || img.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.gallery.confirmDelete'))) return;
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.gallery.deleted'));
    fetchImages();
  };

  const resetModal = () => {
    setEditing(null);
    setFormData({ title: '', title_ar: '', description: '', description_ar: '', category: '', image: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.gallery.title')}</h1>
        <button
          onClick={() => { setShowModal(true); resetModal(); }}
          className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm"
        >
          <FiPlus className="w-4 h-4" />
          <span>{t('admin.gallery.addImage')}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-xl">
          <FiImage className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t('admin.gallery.noImages')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden glass-card">
              <img
                src={img.image || img.image_url}
                alt={img.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium text-white truncate">{img.title}</p>
                {img.title_ar && <p className="text-xs text-gray-300 truncate" dir="rtl">{img.title_ar}</p>}
                {img.category && (
                  <span className="text-xs text-gray-300 bg-black/40 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {img.category}
                  </span>
                )}
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                <button
                  onClick={() => handleEdit(img)}
                  className="p-2 bg-primary/80 hover:bg-primary rounded-lg text-white backdrop-blur-sm transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white backdrop-blur-sm transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit Image' : t('admin.gallery.addImage')}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData((p) => ({ ...p, image: url }))}
                  bucket="images"
                  folder="gallery"
                  label={t('admin.gallery.form.image')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      required
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Title (Arabic)</label>
                    <input
                      type="text"
                      value={formData.title_ar}
                      onChange={(e) => setFormData((p) => ({ ...p, title_ar: e.target.value }))}
                      className="input-dark"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Description (English)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      className="input-dark resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Description (Arabic)</label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData((p) => ({ ...p, description_ar: e.target.value }))}
                      className="input-dark resize-none"
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">{t('admin.gallery.form.category')}</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="input-dark"
                    placeholder={t('admin.gallery.form.categoryPlaceholder')}
                    list="category-list"
                  />
                  {categories.length > 0 && (
                    <datalist id="category-list">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3">
                    {t('admin.trips.cancel')}
                  </button>
                  <button type="submit" className="flex-1 gradient-btn py-3">
                    <span>{editing ? 'Update' : t('admin.gallery.create')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGallery;
