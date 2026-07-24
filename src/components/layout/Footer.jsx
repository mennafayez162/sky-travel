import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();
        if (error) throw error;
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const quickLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.trips'), path: '/trips' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const supportLinks = [
    { name: t('footer.helpCenter'), path: '/faq' },
    { name: t('footer.contactUs'), path: '/contact' },
  ];

  const siteName = isRTL ? (settings?.site_name_ar || settings?.site_name || 'Travcano') : (settings?.site_name || 'Travcano');
  const siteDescription = isRTL ? (settings?.site_description_ar || settings?.site_description || '') : (settings?.site_description || '');

  const logoUrl = settings?.logo || null;

  const socialLinks = [
    { icon: FaFacebookF, url: settings?.facebook, label: 'Facebook' },
    { icon: FaTwitter, url: settings?.twitter, label: 'Twitter' },
    { icon: FaInstagram, url: settings?.instagram, label: 'Instagram' },
    { icon: FaYoutube, url: settings?.youtube, label: 'YouTube' },
  ].filter((s) => s.url);

  const copyrightText = isRTL
    ? (settings?.footer_text_ar || `© ${currentYear} ${siteName}. جميع الحقوق محفوظة.`)
    : (settings?.footer_text || `© ${currentYear} ${siteName}. All rights reserved.`);

  return (
    <footer className="relative bg-dark-card border-t border-dark-border">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Newsletter */}
      <div className="border-b border-dark-border">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('footer.newsletterTitle')}</h3>
              <p className="text-gray-400">{t('footer.newsletterSubtitle')}</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="input-dark rounded-r-none flex-1 md:w-72"
              />
              <button
                type="submit"
                className="gradient-btn rounded-l-none px-6 flex items-center gap-2"
              >
                <span className="hidden sm:inline">{t('footer.subscribe')}</span>
                <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
              )}
              <span className="text-xl font-bold">
                <span className="text-gradient">Trav</span>
                <span className="text-white">cano</span>
              </span>
            </Link>
            {siteDescription && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                {siteDescription}
              </p>
            )}

            <div className="space-y-3">
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                  <FiMail className="w-4 h-4 text-primary" />
                  {settings.email}
                </a>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                  <FiPhone className="w-4 h-4 text-primary" />
                  {settings.phone}
                </a>
              )}
              {settings?.address && (
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <FiMapPin className="w-4 h-4 text-primary" />
                  {settings.address}
                </div>
              )}
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4 text-green-500" />
                  {settings.whatsapp}
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.quickLinks') || 'Quick Links'}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white text-sm transition-colors hover:pl-2 duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.support') || 'Support'}</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white text-sm transition-colors hover:pl-2 duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-border">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">{copyrightText}</p>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/50 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            )}
            <p className="text-gray-600 text-xs text-center w-full mt-2">Developed by Menna_M_Fayez</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
