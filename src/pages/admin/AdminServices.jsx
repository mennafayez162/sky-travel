import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiInfo, FiDollarSign, FiList, FiMap, FiCreditCard, FiImage } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import ImageUpload from '../../components/common/ImageUpload';

const TABS = [
  { key: 'basic', icon: FiInfo, labelKey: 'admin.services.tabs.basic' },
  { key: 'pricing', icon: FiDollarSign, labelKey: 'admin.services.tabs.pricing' },
  { key: 'content', icon: FiList, labelKey: 'admin.services.tabs.content' },
  { key: 'itinerary', icon: FiMap, labelKey: 'admin.services.tabs.itinerary' },
  { key: 'payment', icon: FiCreditCard, labelKey: 'admin.services.tabs.payment' },
  { key: 'images', icon: FiImage, labelKey: 'admin.services.tabs.images' },
];

const emptyDay = () => ({ day: 1, title: '', title_ar: '', description: '', description_ar: '' });
const emptyPayment = () => ({ name: '', name_ar: '', icon: '', details: '', details_ar: '' });

const AdminServices = () => {
  const { t, language } = useLanguage();
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState(getEmptyForm());
  const [loading, setLoading] = useState(false);

  function getEmptyForm() {
    return {
      title: '', title_ar: '', slug: '', description: '', description_ar: '',
      icon: '', image: '', features: [], sort_order: 0, is_active: true,
      price: '', price_currency: 'EGP', duration: '',
      highlights: '', highlights_ar: '',
      includes: '', includes_ar: '',
      excludes: '', excludes_ar: '',
      itinerary: [emptyDay()],
      payment_methods: [emptyPayment()],
      gallery: [],
      max_bookings: '', meta_title: '', meta_description: '',
    };
  }

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data || []);
  };

  useEffect(() => { fetchServices(); }, []);

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openNew = () => {
    setEditing(null);
    setForm(getEmptyForm());
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      ...getEmptyForm(),
      ...s,
      highlights: Array.isArray(s.highlights) ? s.highlights.join('\n') : (s.highlights || ''),
      highlights_ar: Array.isArray(s.highlights_ar) ? s.highlights_ar.join('\n') : (s.highlights_ar || ''),
      includes: Array.isArray(s.includes) ? s.includes.join('\n') : (s.includes || ''),
      includes_ar: Array.isArray(s.includes_ar) ? s.includes_ar.join('\n') : (s.includes_ar || ''),
      excludes: Array.isArray(s.excludes) ? s.excludes.join('\n') : (s.excludes || ''),
      excludes_ar: Array.isArray(s.excludes_ar) ? s.excludes_ar.join('\n') : (s.excludes_ar || ''),
      itinerary: Array.isArray(s.itinerary) && s.itinerary.length ? s.itinerary : [emptyDay()],
      payment_methods: Array.isArray(s.payment_methods) && s.payment_methods.length ? s.payment_methods : [emptyPayment()],
      gallery: Array.isArray(s.gallery) ? s.gallery : [],
      price: s.price ?? '',
      max_bookings: s.max_bookings ?? '',
      sort_order: s.sort_order ?? 0,
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const autoSlug = (val) => {
    if (!editing) {
      setForm(p => ({ ...p, title: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    } else {
      setField('title', val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toArray = (v) => (typeof v === 'string' ? v.split('\n').map(l => l.trim()).filter(Boolean) : Array.isArray(v) ? v : []);

    const payload = {
      title: form.title,
      title_ar: form.title_ar,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: form.description,
      description_ar: form.description_ar,
      icon: form.icon,
      image: form.image,
      features: form.features,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      price: form.price !== '' ? Number(form.price) : null,
      price_currency: form.price_currency || 'EGP',
      duration: form.duration,
      highlights: toArray(form.highlights),
      highlights_ar: toArray(form.highlights_ar),
      includes: toArray(form.includes),
      includes_ar: toArray(form.includes_ar),
      excludes: toArray(form.excludes),
      excludes_ar: toArray(form.excludes_ar),
      itinerary: form.itinerary.map((d, i) => ({ ...d, day: i + 1 })),
      payment_methods: form.payment_methods,
      gallery: form.gallery,
      max_bookings: form.max_bookings !== '' ? Number(form.max_bookings) : null,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('services').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success(t('admin.services.toast.updated'));
      } else {
        const { error } = await supabase.from('services').insert(payload);
        if (error) throw error;
        toast.success(t('admin.services.toast.created'));
      }
      setShowModal(false);
      setEditing(null);
      fetchServices();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.services.confirmDelete'))) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.services.toast.deleted'));
    fetchServices();
  };

  const addItineraryDay = () => setForm(p => ({ ...p, itinerary: [...p.itinerary, { ...emptyDay(), day: p.itinerary.length + 1 }] }));
  const removeItineraryDay = (i) => setForm(p => ({ ...p, itinerary: p.itinerary.filter((_, idx) => idx !== i) }));
  const updateItineraryDay = (i, key, val) => setForm(p => ({ ...p, itinerary: p.itinerary.map((d, idx) => idx === i ? { ...d, [key]: val } : d) }));

  const addPayment = () => setForm(p => ({ ...p, payment_methods: [...p.payment_methods, emptyPayment()] }));
  const removePayment = (i) => setForm(p => ({ ...p, payment_methods: p.payment_methods.filter((_, idx) => idx !== i) }));
  const updatePayment = (i, key, val) => setForm(p => ({ ...p, payment_methods: p.payment_methods.map((d, idx) => idx === i ? { ...d, [key]: val } : d) }));

  const addGalleryImage = (url) => setForm(p => ({ ...p, gallery: [...p.gallery, url] }));
  const removeGalleryImage = (i) => setForm(p => ({ ...p, gallery: p.gallery.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.services.title')}</h1>
        <button onClick={openNew} className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm">
          <FiPlus className="w-4 h-4" /><span>{t('admin.services.add')}</span>
        </button>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {services.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">{t('admin.services.noServices')}</div>
        ) : services.map((s) => (
          <div key={s.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              {s.image ? <img src={s.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-gray-500 text-xs flex-shrink-0">N/A</div>}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.title}</p>
                <p className="text-xs text-gray-500 truncate">{s.title_ar}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {s.is_active ? t('admin.services.active') : t('admin.services.inactive')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500 text-xs">Price</span><p className="text-gray-300">{s.price ? `${s.price} ${s.price_currency || 'EGP'}` : '-'}</p></div>
              <div><span className="text-gray-500 text-xs">Duration</span><p className="text-gray-300">{s.duration || '-'}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-1"><FiEdit2 className="w-3 h-3" /> Edit</button>
              <button onClick={() => handleDelete(s.id)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-1"><FiTrash2 className="w-3 h-3" /> Delete</button>
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
                <th className="text-left p-4 text-sm text-gray-400">{t('admin.services.table.title')}</th>
                <th className="text-left p-4 text-sm text-gray-400">{t('admin.services.table.price')}</th>
                <th className="text-left p-4 text-sm text-gray-400">{t('admin.services.table.duration')}</th>
                <th className="text-left p-4 text-sm text-gray-400">{t('admin.services.table.status')}</th>
                <th className="text-right p-4 text-sm text-gray-400">{t('admin.services.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {s.image ? <img src={s.image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-gray-500 text-xs">N/A</div>}
                      <div>
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.title_ar}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{s.price ? `${s.price} ${s.price_currency || 'EGP'}` : '-'}</td>
                  <td className="p-4 text-sm">{s.duration || '-'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {s.is_active ? t('admin.services.active') : t('admin.services.inactive')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-bold">{editing ? t('admin.services.edit') : t('admin.services.addNew')}</h2>
            </div>

            <div className="flex border-b border-dark-border overflow-x-auto">
              {TABS.map(({ key, icon: Icon, labelKey }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors ${activeTab === key ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(labelKey)}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.title')}</label>
                      <input type="text" value={form.title} onChange={(e) => autoSlug(e.target.value)} required className="input-dark w-full" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.titleAr')}</label>
                      <input type="text" value={form.title_ar} onChange={(e) => setField('title_ar', e.target.value)} className="input-dark w-full" dir="rtl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.slug')}</label>
                    <input type="text" value={form.slug} onChange={(e) => setField('slug', e.target.value)} className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.description')}</label>
                    <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} className="input-dark w-full resize-none" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.descriptionAr')}</label>
                    <textarea value={form.description_ar} onChange={(e) => setField('description_ar', e.target.value)} className="input-dark w-full resize-none" rows={3} dir="rtl" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.icon')}</label>
                      <input type="text" value={form.icon} onChange={(e) => setField('icon', e.target.value)} className="input-dark w-full" placeholder="FiCompass" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.sortOrder')}</label>
                      <input type="number" value={form.sort_order} onChange={(e) => setField('sort_order', e.target.value)} className="input-dark w-full" />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} className="w-4 h-4 accent-primary" />
                        <span className="text-sm text-gray-300">{t('admin.services.form.active')}</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'pricing' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.price')}</label>
                      <input type="number" step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} className="input-dark w-full" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.currency')}</label>
                      <select value={form.price_currency} onChange={(e) => setField('price_currency', e.target.value)} className="input-dark w-full">
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.duration')}</label>
                      <input type="text" value={form.duration} onChange={(e) => setField('duration', e.target.value)} className="input-dark w-full" placeholder="3 days" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.maxBookings')}</label>
                    <input type="number" value={form.max_bookings} onChange={(e) => setField('max_bookings', e.target.value)} className="input-dark w-full" />
                  </div>
                </>
              )}

              {activeTab === 'content' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.highlights')}</label>
                      <textarea value={form.highlights} onChange={(e) => setField('highlights', e.target.value)} className="input-dark w-full resize-none" rows={4} placeholder={t('admin.services.form.onePerLine')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.highlightsAr')}</label>
                      <textarea value={form.highlights_ar} onChange={(e) => setField('highlights_ar', e.target.value)} className="input-dark w-full resize-none" rows={4} dir="rtl" placeholder={t('admin.services.form.onePerLine')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.includes')}</label>
                      <textarea value={form.includes} onChange={(e) => setField('includes', e.target.value)} className="input-dark w-full resize-none" rows={4} placeholder={t('admin.services.form.onePerLine')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.includesAr')}</label>
                      <textarea value={form.includes_ar} onChange={(e) => setField('includes_ar', e.target.value)} className="input-dark w-full resize-none" rows={4} dir="rtl" placeholder={t('admin.services.form.onePerLine')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.excludes')}</label>
                      <textarea value={form.excludes} onChange={(e) => setField('excludes', e.target.value)} className="input-dark w-full resize-none" rows={4} placeholder={t('admin.services.form.onePerLine')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">{t('admin.services.form.excludesAr')}</label>
                      <textarea value={form.excludes_ar} onChange={(e) => setField('excludes_ar', e.target.value)} className="input-dark w-full resize-none" rows={4} dir="rtl" placeholder={t('admin.services.form.onePerLine')} />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  {form.itinerary.map((day, i) => (
                    <div key={i} className="glass-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">{t('admin.services.form.day')} {i + 1}</span>
                        {form.itinerary.length > 1 && (
                          <button type="button" onClick={() => removeItineraryDay(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.dayTitle')}</label>
                          <input type="text" value={day.title} onChange={(e) => updateItineraryDay(i, 'title', e.target.value)} className="input-dark w-full" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.dayTitleAr')}</label>
                          <input type="text" value={day.title_ar} onChange={(e) => updateItineraryDay(i, 'title_ar', e.target.value)} className="input-dark w-full" dir="rtl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.dayDescription')}</label>
                          <textarea value={day.description} onChange={(e) => updateItineraryDay(i, 'description', e.target.value)} className="input-dark w-full resize-none" rows={2} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.dayDescriptionAr')}</label>
                          <textarea value={day.description_ar} onChange={(e) => updateItineraryDay(i, 'description_ar', e.target.value)} className="input-dark w-full resize-none" rows={2} dir="rtl" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addItineraryDay} className="w-full py-3 border-2 border-dashed border-dark-border rounded-xl text-sm text-gray-400 hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />{t('admin.services.form.addDay')}
                  </button>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-4">
                  {form.payment_methods.map((pm, i) => (
                    <div key={i} className="glass-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">{t('admin.services.form.paymentMethod')} {i + 1}</span>
                        {form.payment_methods.length > 1 && (
                          <button type="button" onClick={() => removePayment(i)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.paymentName')}</label>
                          <input type="text" value={pm.name} onChange={(e) => updatePayment(i, 'name', e.target.value)} className="input-dark w-full" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.paymentNameAr')}</label>
                          <input type="text" value={pm.name_ar} onChange={(e) => updatePayment(i, 'name_ar', e.target.value)} className="input-dark w-full" dir="rtl" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.paymentIcon')}</label>
                          <input type="text" value={pm.icon} onChange={(e) => updatePayment(i, 'icon', e.target.value)} className="input-dark w-full" placeholder="FiDollar" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.paymentDetails')}</label>
                          <textarea value={pm.details} onChange={(e) => updatePayment(i, 'details', e.target.value)} className="input-dark w-full resize-none" rows={2} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">{t('admin.services.form.paymentDetailsAr')}</label>
                          <textarea value={pm.details_ar} onChange={(e) => updatePayment(i, 'details_ar', e.target.value)} className="input-dark w-full resize-none" rows={2} dir="rtl" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addPayment} className="w-full py-3 border-2 border-dashed border-dark-border rounded-xl text-sm text-gray-400 hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />{t('admin.services.form.addPayment')}
                  </button>
                </div>
              )}

              {activeTab === 'images' && (
                <>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => setField('image', url)}
                    folder="services"
                    label={t('admin.services.form.mainImage')}
                  />
                  <div className="mt-6">
                    <label className="block text-sm text-gray-300 mb-2">{t('admin.services.form.galleryImages')}</label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {form.gallery.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-full h-28 object-cover rounded-xl border border-dark-border" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiTrash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <ImageUpload
                      value=""
                      onChange={(url) => { if (url) addGalleryImage(url); }}
                      folder="services/gallery"
                      label={t('admin.services.form.addGalleryImage')}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-dark-border">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass-card py-3 text-sm">
                  {t('admin.services.cancel')}
                </button>
                <button type="submit" disabled={loading} className="flex-1 gradient-btn py-3 text-sm">
                  {loading ? t('admin.services.saving') : t('admin.services.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
