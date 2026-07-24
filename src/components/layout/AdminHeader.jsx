import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiUser, FiLogOut, FiChevronDown, FiSearch, FiCalendar, FiMail, FiMessageSquare, FiStar, FiUserPlus } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

function timeAgo(date, isRTL) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return isRTL ? 'الآن' : 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
  return then.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
}

const ICON_MAP = {
  booking: FiCalendar,
  message: FiMail,
  review: FiStar,
  user: FiUserPlus,
  contact: FiMessageSquare,
};

const COLOR_MAP = {
  booking: 'bg-blue-500/20 text-blue-400',
  message: 'bg-green-500/20 text-green-400',
  review: 'bg-yellow-500/20 text-yellow-400',
  user: 'bg-purple-500/20 text-purple-400',
  contact: 'bg-pink-500/20 text-pink-400',
};

function getDropdownPosition(triggerRef, dropdownWidth, isRTL) {
  if (!triggerRef.current) return { top: 0, left: 0 };
  const rect = triggerRef.current.getBoundingClientRect();
  const gap = 8;
  const padding = 8;
  let left;
  if (isRTL) {
    left = rect.left;
  } else {
    left = rect.right - dropdownWidth;
  }
  left = Math.max(padding, Math.min(left, window.innerWidth - dropdownWidth - padding));
  return { top: rect.bottom + gap, left };
}

const AdminHeader = ({ onToggleSidebar, sidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('dismissed_notifs') || '[]')); } catch { return new Set(); }
  });
  const { user, profile, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const dropdownRef = useRef(null);
  const bellButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const [notifPos, setNotifPos] = useState({ top: 0, left: 0 });
  const [profilePos, setProfilePos] = useState({ top: 0, left: 0 });

  const NOTIF_WIDTH = 400;
  const PROFILE_WIDTH = 224;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [dismissedIds]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileButtonRef.current && !profileButtonRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateNotifPosition = useCallback(() => {
    if (showNotifications) {
      setNotifPos(getDropdownPosition(bellButtonRef, NOTIF_WIDTH, isRTL));
    }
  }, [showNotifications, isRTL]);

  const updateProfilePosition = useCallback(() => {
    if (showProfile) {
      setProfilePos(getDropdownPosition(profileButtonRef, PROFILE_WIDTH, isRTL));
    }
  }, [showProfile, isRTL]);

  useEffect(() => {
    updateNotifPosition();
    if (showNotifications) {
      window.addEventListener('resize', updateNotifPosition);
      window.addEventListener('scroll', updateNotifPosition);
      return () => {
        window.removeEventListener('resize', updateNotifPosition);
        window.removeEventListener('scroll', updateNotifPosition);
      };
    }
  }, [showNotifications, updateNotifPosition]);

  useEffect(() => {
    updateProfilePosition();
    if (showProfile) {
      window.addEventListener('resize', updateProfilePosition);
      window.addEventListener('scroll', updateProfilePosition);
      return () => {
        window.removeEventListener('resize', updateProfilePosition);
        window.removeEventListener('scroll', updateProfilePosition);
      };
    }
  }, [showProfile, updateProfilePosition]);

  async function fetchNotifications() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [bookingsRes, messagesRes, reviewsRes, usersRes] = await Promise.all([
        supabase.from('bookings').select('id, created_at, total_price, profiles(full_name), trips(title)').gte('created_at', oneDayAgo).order('created_at', { ascending: false }).limit(5),
        supabase.from('messages').select('id, created_at, name, subject').gte('created_at', oneDayAgo).order('created_at', { ascending: false }).limit(5),
        supabase.from('reviews').select('id, created_at, rating, user_name').gte('created_at', oneDayAgo).order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, created_at, full_name').gte('created_at', oneDayAgo).order('created_at', { ascending: false }).limit(5),
      ]);

      const items = [];

      (bookingsRes.data || []).forEach(b => {
        items.push({
          id: `booking-${b.id}`,
          type: 'booking',
          title: isRTL ? `حجز جديد من ${b.profiles?.full_name || 'مستخدم'}` : `New booking from ${b.profiles?.full_name || 'User'}`,
          subtitle: b.trips?.title || '',
          time: b.created_at,
          link: '/admin/bookings',
        });
      });

      (messagesRes.data || []).forEach(m => {
        items.push({
          id: `message-${m.id}`,
          type: 'message',
          title: isRTL ? `رسالة جديدة من ${m.name}` : `New message from ${m.name}`,
          subtitle: m.subject || '',
          time: m.created_at,
          link: '/admin/messages',
        });
      });

      (reviewsRes.data || []).forEach(r => {
        items.push({
          id: `review-${r.id}`,
          type: 'review',
          title: isRTL ? `تقييم جديد من ${r.user_name || 'مستخدم'}` : `New review from ${r.user_name || 'User'}`,
          subtitle: '★'.repeat(r.rating || 0),
          time: r.created_at,
          link: '/admin/reviews',
        });
      });

      (usersRes.data || []).forEach(u => {
        if (u.id === user?.id) return;
        items.push({
          id: `user-${u.id}`,
          type: 'user',
          title: isRTL ? `مستخدم جديد: ${u.full_name}` : `New user: ${u.full_name}`,
          subtitle: '',
          time: u.created_at,
          link: '/admin/users',
        });
      });

      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      const visible = items.filter(n => !dismissedIds.has(n.id));
      setNotifications(visible.slice(0, 20));
      setUnreadCount(visible.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }

  return (
    <header className="sticky top-0 z-30 glass py-3 px-4 md:px-6 lg:px-8 border-b border-dark-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-white/5 transition-all"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm focus:outline-none focus:border-primary/50 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              ref={bellButtonRef}
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ position: 'fixed', top: notifPos.top, left: notifPos.left, zIndex: 9999, width: NOTIF_WIDTH, maxWidth: 'calc(100vw - 16px)' }}
                  className="glass-card shadow-xl border border-dark-border"
                >
                  <div className="flex items-center justify-between p-4 border-b border-dark-border">
                    <h4 className="font-bold text-sm">{t('admin.header.notifications')}</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          const newDismissed = new Set(dismissedIds);
                          notifications.forEach(n => newDismissed.add(n.id));
                          setDismissedIds(newDismissed);
                          localStorage.setItem('dismissed_notifs', JSON.stringify([...newDismissed]));
                          setNotifications([]);
                          setUnreadCount(0);
                        }}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        {isRTL ? 'مسح الكل' : 'Clear all'}
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-[70vh]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <FiBell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">{isRTL ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-dark-border">
                        {notifications.map((n) => {
                          const Icon = ICON_MAP[n.type] || FiBell;
                          return (
                            <Link
                              key={n.id}
                              to={n.link}
                              onClick={() => setShowNotifications(false)}
                              className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors"
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[n.type]}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm leading-relaxed break-words">{n.title}</p>
                                {n.subtitle && <p className="text-xs text-gray-500 mt-1 break-words">{n.subtitle}</p>}
                                <p className="text-[11px] text-gray-600 mt-1">{timeAgo(n.time, isRTL)}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileButtonRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'Admin'}&background=4F46E5&color=fff&size=80`}
                alt={t('admin.header.admin')}
                className="w-8 h-8 rounded-full border border-primary/50"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-tight">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{t('admin.header.admin')}</p>
              </div>
              <FiChevronDown className="w-4 h-4 hidden md:block" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ position: 'fixed', top: profilePos.top, left: profilePos.left, zIndex: 9999, width: PROFILE_WIDTH, maxWidth: 'calc(100vw - 16px)' }}
                  className="glass-card p-2 shadow-glass"
                >
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={() => setShowProfile(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={() => setShowProfile(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    {t('admin.header.viewSite')}
                  </Link>
                  <div className="border-t border-dark-border my-1" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
