import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiGlobe, FiImage, FiPhone, FiFacebook, FiInfo, FiBarChart2, FiDroplet, FiType } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import ImageUpload from '../../components/common/ImageUpload';

const TABS = [
  { id: 'general', icon: FiGlobe, labelKey: 'general' },
  { id: 'hero', icon: FiImage, labelKey: 'hero' },
  { id: 'contact', icon: FiPhone, labelKey: 'contact' },
  { id: 'social', icon: FiFacebook, labelKey: 'social' },
  { id: 'about', icon: FiInfo, labelKey: 'about' },
  { id: 'stats', icon: FiBarChart2, labelKey: 'stats' },
  { id: 'colors', icon: FiDroplet, labelKey: 'colors' },
  { id: 'footer', icon: FiType, labelKey: 'footer' },
];

const INITIAL_FORM = {
  site_name: '', site_name_ar: '', site_description: '', site_description_ar: '',
  logo: '', favicon: '',
  phone: '', email: '', address: '', whatsapp: '',
  facebook: '', twitter: '', instagram: '', youtube: '',
  google_maps_key: '',
  maintenance_mode: false,
  hero_title: '', hero_title_ar: '', hero_subtitle: '', hero_subtitle_ar: '',
  hero_image: '', hero_badge: '', hero_badge_ar: '',
  primary_color: '#3b82f6', secondary_color: '#8b5cf6',
  footer_text: '', footer_text_ar: '',
  about_title: '', about_title_ar: '', about_description: '', about_description_ar: '', about_image: '',
  stats_clients: 0, stats_destinations: 0, stats_trips: 0, stats_years: 0,
  newsletter_title: '', newsletter_title_ar: '', newsletter_description: '', newsletter_description_ar: '',
  currency: 'EGP', currency_symbol: 'ج.م',
};

const AdminSettings = () => {
  const { t } = useLanguage();
  const { applyTheme } = useTheme();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) setForm((prev) => ({ ...prev, ...data }));
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (field) => (url) => {
    setForm((prev) => ({ ...prev, [field]: url }));
  };

  const handleColorChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...form, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw error;
      applyTheme(form);
      if (form.favicon) {
        const link = document.getElementById('favicon');
        if (link) link.href = form.favicon;
      }
      toast.success(t('admin.settings.saveSuccess'));
    } catch (err) {
      toast.error(t('admin.settings.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'input-dark';
  const textareaClass = 'input-dark resize-none';

  const renderInput = (name, label, type = 'text', rows) => (
    <div key={name}>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={form[name] || ''} onChange={handleChange} className={textareaClass} rows={rows || 3} />
      ) : type === 'number' ? (
        <input type="number" name={name} value={form[name] || ''} onChange={handleChange} className={inputClass} />
      ) : (
        <input type={type} name={name} value={form[name] || ''} onChange={handleChange} className={inputClass} />
      )}
    </div>
  );

  const renderImageUpload = (name, label) => (
    <div key={name}>
      <ImageUpload value={form[name]} onChange={handleImageChange(name)} label={label} />
    </div>
  );

  const renderColorPicker = (name, label) => (
    <div key={name}>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={form[name] || '#3b82f6'}
          onChange={handleColorChange(name)}
          className="w-12 h-12 rounded-lg border border-dark-border cursor-pointer bg-transparent"
        />
        <input
          type="text"
          name={name}
          value={form[name] || ''}
          onChange={handleChange}
          className={`${inputClass} flex-1`}
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('site_name', t('admin.settings.fields.siteName'))}
              {renderInput('site_name_ar', t('admin.settings.fields.siteNameAr'))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('site_description', t('admin.settings.fields.siteDescription'), 'textarea')}
              {renderInput('site_description_ar', t('admin.settings.fields.siteDescriptionAr'), 'textarea')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderImageUpload('logo', t('admin.settings.fields.logo'))}
              {renderImageUpload('favicon', t('admin.settings.fields.favicon'))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Currency</label>
                <select name="currency" value={form.currency || 'EGP'} onChange={(e) => {
                  const symbols = { EGP: 'ج.م', USD: '$', EUR: '€', GBP: '£' };
                  setForm(p => ({ ...p, currency: e.target.value, currency_symbol: symbols[e.target.value] || 'ج.م' }));
                }} className={inputClass}>
                  <option value="EGP">ج.م — Egyptian Pound</option>
                  <option value="USD">$ — US Dollar</option>
                  <option value="EUR">€ — Euro</option>
                  <option value="GBP">£ — British Pound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Currency Symbol</label>
                <input type="text" name="currency_symbol" value={form.currency_symbol || ''} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="maintenance_mode"
                checked={form.maintenance_mode || false}
                onChange={handleChange}
                className="w-5 h-5 rounded border-dark-border text-primary focus:ring-primary bg-dark-card accent-primary"
              />
              <label className="text-sm text-gray-300">{t('admin.settings.fields.maintenanceMode')}</label>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('hero_title', t('admin.settings.fields.heroTitle'))}
              {renderInput('hero_title_ar', t('admin.settings.fields.heroTitleAr'))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('hero_subtitle', t('admin.settings.fields.heroSubtitle'), 'textarea')}
              {renderInput('hero_subtitle_ar', t('admin.settings.fields.heroSubtitleAr'), 'textarea')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('hero_badge', t('admin.settings.fields.heroBadge'))}
              {renderInput('hero_badge_ar', t('admin.settings.fields.heroBadgeAr'))}
            </div>
            {renderImageUpload('hero_image', t('admin.settings.fields.heroImage'))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('phone', t('admin.settings.fields.phone'), 'tel')}
              {renderInput('email', t('admin.settings.fields.email'), 'email')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('whatsapp', t('admin.settings.fields.whatsapp'), 'tel')}
              {renderInput('google_maps_key', t('admin.settings.fields.googleMapsKey'))}
            </div>
            {renderInput('address', t('admin.settings.fields.address'), 'textarea')}
          </div>
        );

      case 'social':
        return (
          <div className="space-y-5">
            {renderInput('facebook', t('admin.settings.fields.facebook'), 'url')}
            {renderInput('twitter', t('admin.settings.fields.twitter'), 'url')}
            {renderInput('instagram', t('admin.settings.fields.instagram'), 'url')}
            {renderInput('youtube', t('admin.settings.fields.youtube'), 'url')}
          </div>
        );

      case 'about':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('about_title', t('admin.settings.fields.aboutTitle'))}
              {renderInput('about_title_ar', t('admin.settings.fields.aboutTitleAr'))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('about_description', t('admin.settings.fields.aboutDescription'), 'textarea')}
              {renderInput('about_description_ar', t('admin.settings.fields.aboutDescriptionAr'), 'textarea')}
            </div>
            {renderImageUpload('about_image', t('admin.settings.fields.aboutImage'))}
          </div>
        );

      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderInput('stats_clients', t('admin.settings.fields.statsClients'), 'number')}
            {renderInput('stats_destinations', t('admin.settings.fields.statsDestinations'), 'number')}
            {renderInput('stats_trips', t('admin.settings.fields.statsTrips'), 'number')}
            {renderInput('stats_years', t('admin.settings.fields.statsYears'), 'number')}
          </div>
        );

      case 'colors':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderColorPicker('primary_color', t('admin.settings.fields.primaryColor'))}
            {renderColorPicker('secondary_color', t('admin.settings.fields.secondaryColor'))}
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('footer_text', t('admin.settings.fields.footerText'), 'textarea')}
              {renderInput('footer_text_ar', t('admin.settings.fields.footerTextAr'), 'textarea')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('newsletter_title', t('admin.settings.fields.newsletterTitle'))}
              {renderInput('newsletter_title_ar', t('admin.settings.fields.newsletterTitleAr'))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {renderInput('newsletter_description', t('admin.settings.fields.newsletterDescription'), 'textarea')}
              {renderInput('newsletter_description_ar', t('admin.settings.fields.newsletterDescriptionAr'), 'textarea')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.settings.title')}</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'glass-card text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t(`admin.settings.tabs.${tab.labelKey}`)}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 max-w-4xl">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="gradient-btn px-8 py-3 mt-8 flex items-center gap-2"
        >
          <FiSave className="w-4 h-4" />
          <span>{loading ? t('admin.settings.saving') : t('admin.settings.saveSettings')}</span>
        </motion.button>
      </form>
    </div>
  );
};

export default AdminSettings;
