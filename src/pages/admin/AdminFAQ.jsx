import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const AdminFAQ = () => {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    question: '', question_ar: '', answer: '', answer_ar: '',
    category: '', sort_order: 0, is_active: true,
  });

  const fetchFAQs = async () => {
    const { data } = await supabase.from('faq').select('*').order('sort_order');
    setFaqs(data || []);
  };

  useEffect(() => { fetchFAQs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      question: form.question,
      question_ar: form.question_ar,
      answer: form.answer,
      answer_ar: form.answer_ar,
      category: form.category,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('faq').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const { error } = await supabase.from('faq').insert(payload);
        if (error) throw error;
        toast.success('Created');
      }
      setShowModal(false); setEditing(null); fetchFAQs();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.faq.confirmDelete'))) return;
    const { error } = await supabase.from('faq').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted'); fetchFAQs();
  };

  const emptyForm = { question: '', question_ar: '', answer: '', answer_ar: '', category: '', sort_order: 0, is_active: true };

  const handleEdit = (f) => {
    setEditing(f);
    setForm({
      question: f.question || '',
      question_ar: f.question_ar || '',
      answer: f.answer || '',
      answer_ar: f.answer_ar || '',
      category: f.category || '',
      sort_order: f.sort_order || 0,
      is_active: f.is_active !== false,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.faq.title')}</h1>
        <button onClick={() => { setShowModal(true); setEditing(null); setForm(emptyForm); }}
          className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm"><FiPlus className="w-4 h-4" /><span>{t('admin.faq.addFaq')}</span></button>
      </div>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="glass-card p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">{f.question}</p>
              {f.question_ar && <p className="font-semibold text-sm mb-1 text-gray-400" dir="rtl">{f.question_ar}</p>}
              <p className="text-gray-400 text-sm line-clamp-2">{f.answer}</p>
              {f.answer_ar && <p className="text-gray-500 text-sm line-clamp-2" dir="rtl">{f.answer_ar}</p>}
              <span className="text-xs text-gray-500 mt-1 inline-block">{f.category}</span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleEdit(f)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(f.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="glass-card p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing ? t('admin.faq.edit') : t('admin.faq.addNew')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Question (English)</label>
                  <input type="text" value={form.question} onChange={(e) => setForm(p => ({ ...p, question: e.target.value }))} required className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Question (Arabic)</label>
                  <input type="text" value={form.question_ar} onChange={(e) => setForm(p => ({ ...p, question_ar: e.target.value }))} className="input-dark" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Answer (English)</label>
                  <textarea value={form.answer} onChange={(e) => setForm(p => ({ ...p, answer: e.target.value }))} required className="input-dark resize-none" rows={4} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Answer (Arabic)</label>
                  <textarea value={form.answer_ar} onChange={(e) => setForm(p => ({ ...p, answer_ar: e.target.value }))} className="input-dark resize-none" rows={4} dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">{t('admin.faq.form.category')}</label>
                  <input type="text" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className="input-dark" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm(p => ({ ...p, sort_order: e.target.value }))} className="input-dark" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-300">Active</span>
              </label>

              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3">{t('admin.faq.cancel')}</button><button type="submit" className="flex-1 gradient-btn py-3"><span>{t('admin.faq.save')}</span></button></div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
