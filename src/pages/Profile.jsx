import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiLock,
  FiHeart, FiCalendar, FiSettings, FiLogOut, FiEdit2,
  FiSave, FiX, FiChevronRight, FiShield, FiGlobe,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const { t } = useLanguage();
  const { user, profile, logout, fetchProfile, updateProfile, uploadAvatar, updatePassword, loading, error, clearError } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
    city: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleProfileChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      await fetchProfile(user.id);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: formData.fullName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        bio: formData.bio,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    try {
      await updatePassword(passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout.');
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile.tabs.profile'), icon: FiUser },
    { id: 'bookings', label: t('profile.tabs.bookings'), icon: FiCalendar, link: '/booking-history' },
    { id: 'wishlist', label: t('profile.tabs.wishlist'), icon: FiHeart, count: wishlist.length, link: '/wishlist' },
    { id: 'security', label: t('profile.tabs.security'), icon: FiShield },
  ];

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        breadcrumbs={[{ name: t('profile.breadcrumb') }]}
      />

      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 sticky top-24"
              >
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4 group">
                    <img
                      src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=4F46E5&color=fff&size=200`}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-primary/50"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiCamera className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{profile?.full_name || 'User'}</h3>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  {profile?.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                      <FiShield className="w-3 h-3" />
                      {t('profile.adminBadge')}
                    </span>
                  )}
                </div>

                {/* Nav Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    if (tab.link) {
                      return (
                        <Link
                          key={tab.id}
                          to={tab.link}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1">{tab.label}</span>
                          {tab.count > 0 && (
                            <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                              {tab.count}
                            </span>
                          )}
                          <FiChevronRight className="w-4 h-4" />
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-primary/20 to-secondary/10 text-white border border-primary/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        {tab.count > 0 && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <div className="border-t border-dark-border my-3" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>{t('profile.logout')}</span>
                  </button>
                </nav>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6 md:p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold">{t('profile.personalInfo')}</h2>
                      {!isEditing ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 gradient-btn text-sm"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>{t('profile.edit')}</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setIsEditing(false); setFormData({
                            fullName: profile?.full_name || '',
                            phone: profile?.phone || '',
                            country: profile?.country || '',
                            city: profile?.city || '',
                            bio: profile?.bio || '',
                          }); }}
                          className="flex items-center gap-2 px-4 py-2 glass-card text-sm"
                        >
                          <FiX className="w-4 h-4" />
                          <span>{t('profile.cancel')}</span>
                        </motion.button>
                      )}
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('profile.fields.fullName')}
                          </label>
                          <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              className="input-dark pl-12 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('profile.fields.email')}
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="input-dark pl-12 opacity-50 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('profile.fields.phone')}
                          </label>
                          <div className="relative">
                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              className="input-dark pl-12 disabled:opacity-50"
                              placeholder={t('profile.fields.phonePlaceholder')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('profile.fields.country')}
                          </label>
                          <div className="relative">
                            <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              className="input-dark pl-12 disabled:opacity-50"
                              placeholder={t('profile.fields.countryPlaceholder')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('profile.fields.city')}
                          </label>
                          <div className="relative">
                            <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              className="input-dark pl-12 disabled:opacity-50"
                              placeholder={t('profile.fields.cityPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('profile.fields.bio')}
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          rows={4}
                          className="input-dark disabled:opacity-50 resize-none"
                          placeholder={t('profile.fields.bioPlaceholder')}
                        />
                      </div>

                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-end gap-3"
                        >
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 glass-card text-sm"
                          >
                            {t('profile.cancel')}
                          </button>
                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-6 py-2 gradient-btn text-sm"
                          >
                            <FiSave className="w-4 h-4" />
                            <span>{loading ? t('profile.saving') : t('profile.saveChanges')}</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </form>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="glass-card p-6 md:p-8">
                      <h2 className="text-xl font-bold mb-6">{t('profile.securitySettings')}</h2>

                      {/* Change Password */}
                      <div className="glass-card p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                              <FiLock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t('profile.changePassword')}</h3>
                              <p className="text-sm text-gray-400">{t('profile.updatePasswordDesc')}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="px-4 py-2 glass-card text-sm hover:border-primary/50 transition-all"
                          >
                            {showPasswordForm ? t('profile.cancel') : t('profile.change')}
                          </button>
                        </div>

                        <AnimatePresence>
                          {showPasswordForm && (
                            <motion.form
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              onSubmit={handlePasswordSubmit}
                              className="mt-6 space-y-4"
                            >
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                  {t('profile.newPasswordLabel')}
                                </label>
                                <input
                                  type="password"
                                  name="newPassword"
                                  value={passwordData.newPassword}
                                  onChange={handlePasswordChange}
                                  className="input-dark"
                                  placeholder={t('profile.newPasswordPlaceholder')}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                  {t('profile.confirmNewPasswordLabel')}
                                </label>
                                <input
                                  type="password"
                                  name="confirmPassword"
                                  value={passwordData.confirmPassword}
                                  onChange={handlePasswordChange}
                                  className="input-dark"
                                  placeholder={t('profile.confirmPasswordPlaceholder')}
                                />
                              </div>
                              <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="gradient-btn px-6 py-2 text-sm"
                              >
                                <span>{loading ? t('profile.updating') : t('profile.updatePassword')}</span>
                              </motion.button>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
