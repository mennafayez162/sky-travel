import { useState, useEffect } from 'react';
import { FiMail, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const AdminNewsletter = () => {
  const { t } = useLanguage();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data } = await supabase.from('newsletter').select('*').order('created_at', { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id) => {
    if (!confirm(t('admin.newsletter.confirmRemove'))) return;
    const { error } = await supabase.from('newsletter').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(t('admin.newsletter.removed')); fetchSubscribers();
  };

  const handleToggleStatus = async (id, current) => {
    const { error } = await supabase.from('newsletter').update({ is_active: !current }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s));
    toast.success(!current ? t('admin.newsletter.activated') : t('admin.newsletter.deactivated'));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.newsletter.title')} {!loading && `(${subscribers.length})`}</h1>
      {loading ? (
        <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : (
      <>
      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {subscribers.map((s) => (
          <div key={s.id} className="glass-card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FiMail className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm truncate">{s.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {s.is_active ? t('admin.newsletter.active') : t('admin.newsletter.inactive')}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(s.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleToggleStatus(s.id, s.is_active)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${s.is_active ? 'border-green-500/40 text-green-400 hover:bg-green-500/10' : 'border-gray-500/40 text-gray-400 hover:bg-gray-500/10'}`}>
                {s.is_active ? t('admin.newsletter.deactivate') : t('admin.newsletter.activate')}
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-dark-border">
            <th className="text-left p-4 text-sm text-gray-400">{t('admin.newsletter.email')}</th>
            <th className="text-left p-4 text-sm text-gray-400">{t('admin.newsletter.status')}</th>
            <th className="text-left p-4 text-sm text-gray-400">{t('admin.newsletter.date')}</th>
            <th className="text-right p-4 text-sm text-gray-400">{t('admin.newsletter.actions')}</th>
          </tr></thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                <td className="p-4 text-sm flex items-center gap-2"><FiMail className="w-4 h-4 text-primary" />{s.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {s.is_active ? t('admin.newsletter.active') : t('admin.newsletter.inactive')}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">{formatDate(s.created_at)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleToggleStatus(s.id, s.is_active)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${s.is_active ? 'border-green-500/40 text-green-400 hover:bg-green-500/10' : 'border-gray-500/40 text-gray-400 hover:bg-gray-500/10'}`}>
                      {s.is_active ? t('admin.newsletter.deactivate') : t('admin.newsletter.activate')}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
};

export default AdminNewsletter;
