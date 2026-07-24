export const APP_NAME = 'Travcano';
export const APP_DESCRIPTION = 'وكالة سياحة وسفر متكاملة';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const COLORS = {
  primary: '#4F46E5',
  secondary: '#6D28D9',
  accent: '#2563EB',
  dark: '#0B1020',
  darkCard: '#131B2E',
  darkSurface: '#1A2340',
  darkBorder: '#1E2D4A',
};

export const NAV_LINKS = [
  { name: 'Home', path: '/', nameAr: 'الرئيسية' },
  { name: 'About', path: '/about', nameAr: 'عننا' },
  { name: 'Destinations', path: '/destinations', nameAr: 'الوجهات' },
  { name: 'Trips', path: '/trips', nameAr: 'الرحلات' },
  { name: 'Services', path: '/services', nameAr: 'الخدمات' },
  { name: 'Gallery', path: '/gallery', nameAr: 'المعرض' },
  { name: 'Blog', path: '/blog', nameAr: 'المدونة' },
  { name: 'Contact', path: '/contact', nameAr: 'اتصل بنا' },
];

export const FOOTER_LINKS = {
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Press', path: '/press' },
    { name: 'Partners', path: '/partners' },
  ],
  support: [
    { name: 'Help Center', path: '/faq' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ],
};
