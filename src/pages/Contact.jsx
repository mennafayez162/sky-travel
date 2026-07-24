import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('settings').select('phone, email, whatsapp, address').eq('id', 1).single();
        if (data) setSettings(data);
      } catch {}
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('messages').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      if (error) throw error;
      toast.success(t('contact.sendMessage'));
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message || t('contact.sendMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const whatsapp = settings?.whatsapp || '';
  const address = settings?.address || '';

  return (
    <>
      <PageHeader title={t('contact.title')} breadcrumbs={[{ name: t('contact.breadcrumb') }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">{t('contact.sendMessage')}</h2>
              {[
                { icon: FiMapPin, label: t('contact.addressLabel'), value: address },
                phone && { icon: FiPhone, label: t('contact.phoneLabel'), value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
                email && { icon: FiMail, label: t('contact.emailLabel'), value: email, href: `mailto:${email}` },
                whatsapp && whatsapp.replace(/[^0-9]/g, '').length >= 8 && { icon: FaWhatsapp, label: t('contact.whatsappLabel'), value: whatsapp, href: `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` },
              ].filter(Boolean).map((item, i) => (
                <div
                  key={i}
                  className="glass-card p-5 flex items-start gap-4 card-hover fade-up visible"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{item.label}</h4>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-gray-400 text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <div className="glass-card p-8 fade-up visible">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiMessageSquare className="w-6 h-6 text-primary" />{t('contact.sendMessage')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('contact.form.name')}</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-dark" placeholder={t('contact.form.namePlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">{t('contact.form.email')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-dark" placeholder={t('contact.form.emailPlaceholder')} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('contact.form.phone')}</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-dark" placeholder={t('contact.form.phonePlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('contact.form.subject')}</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="input-dark" placeholder={t('contact.form.subjectPlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">{t('contact.form.message')}</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="input-dark resize-none" placeholder={t('contact.form.messagePlaceholder')} />
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="gradient-btn px-8 py-3 flex items-center gap-2">
                    <FiSend className="w-4 h-4" />
                    <span>{isSubmitting ? t('contact.sending') : t('contact.sendButton')}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
