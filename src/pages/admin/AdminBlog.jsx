import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const AdminBlog = () => {
  const { t, language } = useLanguage();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', title_ar: '', slug: '', content: '', content_ar: '',
    image: '', excerpt: '', excerpt_ar: '',
    category_id: '', tags: '', tags_ar: '', is_published: false,
  });

  const fetchBlogs = async () => {
    setLoading(true);
    const { data } = await supabase.from('blogs').select('*, categories(name)').order('created_at', { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, name_ar').order('name');
    setCategories(data || []);
  };

  useEffect(() => { fetchBlogs(); fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toTagsArray = (v) => typeof v === 'string' ? v.split(',').map(t => t.trim()).filter(Boolean) : Array.isArray(v) ? v : [];

    const payload = {
      title: form.title,
      title_ar: form.title_ar,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      content: form.content,
      content_ar: form.content_ar,
      image: form.image,
      excerpt: form.excerpt,
      excerpt_ar: form.excerpt_ar,
      category_id: form.category_id || null,
      tags: toTagsArray(form.tags),
      tags_ar: toTagsArray(form.tags_ar),
      is_published: form.is_published,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const { error } = await supabase.from('blogs').insert(payload);
        if (error) throw error;
        toast.success('Created');
      }
      setShowModal(false); setEditing(null); fetchBlogs();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.blog.confirmDelete'))) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted'); fetchBlogs();
  };

  const emptyForm = { title: '', title_ar: '', slug: '', content: '', content_ar: '', image: '', excerpt: '', excerpt_ar: '', category_id: '', tags: '', tags_ar: '', is_published: false };

  const handleEdit = (b) => {
    setEditing(b);
    const toStr = (v) => Array.isArray(v) ? v.join(', ') : (v || '');
    setForm({
      title: b.title || '',
      title_ar: b.title_ar || '',
      slug: b.slug || '',
      content: b.content || '',
      content_ar: b.content_ar || '',
      image: b.image || '',
      excerpt: b.excerpt || '',
      excerpt_ar: b.excerpt_ar || '',
      category_id: b.category_id || '',
      tags: toStr(b.tags),
      tags_ar: toStr(b.tags_ar),
      is_published: b.is_published || false,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.blog.title')}</h1>
        <button onClick={() => { setShowModal(true); setEditing(null); setForm(emptyForm); }}
          className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm"><FiPlus className="w-4 h-4" /><span>{t('admin.blog.addPost')}</span></button>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-400">{t('common.loading')}</div>
        ) : blogs.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">No posts</div>
        ) : blogs.map((b) => (
          <div key={b.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              {b.image && <img src={b.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{b.title}</p>
                <p className="text-xs text-gray-500 truncate">{b.title_ar || ''}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${b.is_published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{b.is_published ? t('admin.blog.published') : t('admin.blog.draft')}</span>
            </div>
            <p className="text-xs text-gray-500">Category: {b.categories?.name || '-'}</p>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(b)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleDelete(b.id)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-1"><FiTrash2 className="w-3 h-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-dark-border">
              <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.blog.table.title')}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.blog.table.category')}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">{t('admin.blog.table.status')}</th>
              <th className="text-right p-4 text-sm font-semibold text-gray-400">{t('admin.blog.table.actions')}</th>
            </tr></thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                  <td className="p-4"><div className="flex items-center gap-3">{b.image && <img src={b.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}<div><span className="text-sm font-medium">{b.title}</span><p className="text-xs text-gray-500">{b.title_ar || ''}</p></div></div></td>
                  <td className="p-4 text-sm text-gray-400">{b.categories?.name || '-'}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${b.is_published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{b.is_published ? t('admin.blog.published') : t('admin.blog.draft')}</span></td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(b)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing ? t('admin.blog.edit') : t('admin.blog.addNew')}</h2>
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
                  <label className="block text-sm text-gray-300 mb-1">Excerpt (English)</label>
                  <input type="text" value={form.excerpt} onChange={(e) => setForm(p => ({ ...p, excerpt: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Excerpt (Arabic)</label>
                  <input type="text" value={form.excerpt_ar} onChange={(e) => setForm(p => ({ ...p, excerpt_ar: e.target.value }))} className="input-dark" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Content (English)</label>
                  <textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} required className="input-dark resize-none" rows={6} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Content (Arabic)</label>
                  <textarea value={form.content_ar} onChange={(e) => setForm(p => ({ ...p, content_ar: e.target.value }))} className="input-dark resize-none" rows={6} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tags (English, comma separated)</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))} className="input-dark" placeholder="travel, egypt, tour" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tags (Arabic, comma separated)</label>
                  <input type="text" value={form.tags_ar} onChange={(e) => setForm(p => ({ ...p, tags_ar: e.target.value }))} className="input-dark" dir="rtl" placeholder="سياحة, مصر, جولة" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">{t('admin.blog.form.category')}</label>
                <select value={form.category_id} onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))} className="input-dark">
                  <option value="">{t('admin.blog.form.selectCategory')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{language === 'ar' ? c.name_ar : c.name}</option>
                  ))}
                </select>
              </div>

              <ImageUpload value={form.image} onChange={(url) => setForm(p => ({ ...p, image: url }))} bucket="images" folder="blog" label={t('admin.blog.form.image')} />

              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm(p => ({ ...p, is_published: e.target.checked }))} /><span className="text-sm text-gray-300">{t('admin.blog.form.published')}</span></label>

              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3">{t('admin.blog.cancel')}</button><button type="submit" className="flex-1 gradient-btn py-3"><span>{t('admin.blog.save')}</span></button></div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
