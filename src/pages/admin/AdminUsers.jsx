import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiUserPlus, FiX, FiMail, FiLock, FiUser, FiShield } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  { value: 'user', label: 'User', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'admin', label: 'Admin', color: 'bg-primary/20 text-primary' },
  { value: 'moderator', label: 'Moderator', color: 'bg-secondary/20 text-secondary' },
];

const AdminUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const pagination = usePagination(total, PAGE_SIZE);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'user' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const from = (pagination.currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setUsers(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [pagination.currentPage, search]);

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('All fields are required');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: { full_name: newUser.full_name, role: newUser.role },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
        });
        if (profileError) console.error(profileError);
      }

      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm(t('admin.users.confirmDelete'))) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const opt = ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0];
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${opt.color}`}>{opt.label}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{t('admin.users.title')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.users.searchPlaceholder')}
              className="input-dark pl-10 text-sm w-full"
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="gradient-btn px-4 py-2 text-sm flex items-center justify-center gap-2 whitespace-nowrap">
            <FiUserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden">
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-400">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">{t('admin.users.noUsers')}</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=4F46E5&color=fff`}
                      alt=""
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg flex-shrink-0">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border focus:outline-none"
                  >
                    <option value="user">{t('admin.users.roleUser')}</option>
                    <option value="admin">{t('admin.users.roleAdmin')}</option>
                    <option value="moderator">{t('admin.users.roleModerator')}</option>
                  </select>
                  <span className="text-xs text-gray-500">{formatDate(user.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{t('admin.users.noUsers')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400">Joined</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-dark-border/50 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=4F46E5&color=fff`}
                          alt=""
                          className="w-9 h-9 rounded-full"
                        />
                        <span className="text-sm font-medium">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border focus:outline-none"
                      >
                        <option value="user">{t('admin.users.roleUser')}</option>
                        <option value="admin">{t('admin.users.roleAdmin')}</option>
                        <option value="moderator">{t('admin.users.roleModerator')}</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          paginationRange={pagination.paginationRange}
          onPageChange={pagination.goToPage}
          onNext={pagination.goToNextPage}
          onPrev={pagination.goToPrevPage}
          onFirst={pagination.goToFirstPage}
          onLast={pagination.goToLastPage}
        />
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass-card w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="input-dark pl-10 w-full text-sm"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="input-dark pl-10 w-full text-sm"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input-dark pl-10 w-full text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="input-dark pl-10 w-full text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-dark-border text-sm hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateUser} disabled={creating} className="flex-1 gradient-btn px-4 py-2.5 text-sm disabled:opacity-50">
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
