import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiHome, FiUsers, FiMap, FiCalendar, FiMapPin,
  FiImage, FiFileText, FiStar, FiSettings, FiMail,
  FiHelpCircle, FiMessageSquare, FiTrendingUp, FiX, FiPercent, FiInfo,
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const sidebarLinks = [
    { name: t('admin.sidebar.dashboard'), path: '/admin', icon: FiHome },
    { name: t('admin.sidebar.users'), path: '/admin/users', icon: FiUsers },
    { name: t('admin.sidebar.trips'), path: '/admin/trips', icon: FiMap },
    { name: t('admin.sidebar.bookings'), path: '/admin/bookings', icon: FiCalendar },
    { name: t('admin.sidebar.destinations'), path: '/admin/destinations', icon: FiMapPin },
    { name: t('admin.sidebar.gallery'), path: '/admin/gallery', icon: FiImage },
    { name: t('admin.sidebar.blog'), path: '/admin/blog', icon: FiFileText },
    { name: t('admin.sidebar.reviews'), path: '/admin/reviews', icon: FiStar },
    { name: t('admin.sidebar.offers'), path: '/admin/offers', icon: FiPercent },
    { name: t('admin.sidebar.services'), path: '/admin/services', icon: FiTrendingUp },
    { name: t('admin.sidebar.faq'), path: '/admin/faq', icon: FiHelpCircle },
    { name: t('admin.sidebar.newsletter'), path: '/admin/newsletter', icon: FiMail },
    { name: t('admin.sidebar.messages'), path: '/admin/messages', icon: FiMessageSquare },
    { name: 'About Page', path: '/admin/about', icon: FiInfo },
    { name: t('admin.sidebar.settings'), path: '/admin/settings', icon: FiSettings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-dark-card border-r border-dark-border z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between min-h-[4rem]">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className={`text-lg font-bold transition-opacity duration-200 ${isOpen ? 'lg:block' : 'lg:hidden'}`}>
              <span className="text-gradient">Trav</span>
              <span className="text-white"> Admin</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                title={link.name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/10 text-white border border-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'lg:block opacity-100' : 'lg:hidden opacity-0 w-0'}`}>
                  {link.name}
                </span>
                {/* Tooltip for collapsed state */}
                <span className={`hidden lg:block absolute left-full ml-3 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 ${isOpen ? 'hidden' : ''}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-dark-border">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all ${!isOpen ? 'lg:justify-center' : ''}`}
          >
            <FiHome className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'lg:block opacity-100' : 'lg:hidden opacity-0 w-0'}`}>
              {t('admin.sidebar.backToSite')}
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
