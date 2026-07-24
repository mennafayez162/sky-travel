import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiMap, FiDollarSign, FiArrowUp } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { formatCurrency } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 card-hover">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className="text-gray-400 text-sm">{label}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ users: 0, bookings: 0, trips: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [usersRes, bookingsRes, tripsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('bookings').select('*, profiles(full_name), trips(title)'),
          supabase.from('trips').select('id', { count: 'exact', head: true }),
        ]);

        const bookings = bookingsRes.data || [];
        const revenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

        setStats({
          users: usersRes.count || 0,
          bookings: bookings.length,
          trips: tripsRes.count || 0,
          revenue,
        });
        setRecentBookings(bookings.slice(0, 5));

        const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
        setRecentUsers(users || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const cards = [
    { icon: FiUsers, label: t('admin.dashboard.totalUsers'), value: stats.users.toLocaleString(), color: 'bg-primary/20 text-primary' },
    { icon: FiCalendar, label: t('admin.dashboard.totalBookings'), value: stats.bookings.toLocaleString(), color: 'bg-green-500/20 text-green-400' },
    { icon: FiMap, label: t('admin.dashboard.totalTrips'), value: stats.trips.toLocaleString(), color: 'bg-blue-500/20 text-blue-400' },
    { icon: FiDollarSign, label: t('admin.dashboard.totalRevenue'), value: formatCurrency(stats.revenue), color: 'bg-yellow-500/20 text-yellow-400' },
  ];

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.dashboard.title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((stat, i) => (<StatCard key={i} {...stat} />))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">{t('admin.dashboard.recentBookings')}</h3>
          <div className="space-y-3">
            {recentBookings.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">{t('admin.dashboard.noBookings')}</p> : recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-surface/50">
                <div><p className="text-sm font-medium">{b.profiles?.full_name || 'User'}</p><p className="text-xs text-gray-500">{b.trips?.title || 'Trip'}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-gradient">{formatCurrency(b.total_price)}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">{t('admin.dashboard.recentUsers')}</h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">{t('admin.dashboard.noUsers')}</p> : recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/50">
                <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=4F46E5&color=fff&size=80`} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1"><p className="text-sm font-medium">{user.full_name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
