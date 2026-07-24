import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, uploadFile, getFileUrl } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: { session } } = await supabase.auth.getSession();
        const meta = session?.user?.user_metadata || {};
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: meta.full_name || meta.name || '',
            email: session?.user?.email || '',
            avatar_url: meta.avatar_url || meta.picture || '',
            role: 'user',
          }, { onConflict: 'id' })
          .select()
          .single();
        if (insertError) throw insertError;
        setProfile(newProfile);
        return;
      }

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const login = async (email, password) => {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) throw loginError;
    setUser(data.user);
    await fetchProfile(data.user.id);
    return data;
  };

  const register = async (email, password, fullName) => {
    const { data, error: regError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (regError) throw regError;
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: data.user.email || '',
        role: 'user',
      }, { onConflict: 'id' });
      await fetchProfile(data.user.id);
    }
    return data;
  };

  const logout = async () => {
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) throw logoutError;
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);

      if (updates.full_name) {
        await supabase.auth.updateUser({ data: { full_name: updates.full_name } });
      }

      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const updatePassword = async (newPassword) => {
    if (!user) throw new Error('Not logged in');
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    if (pwError) throw pwError;
  };

  const uploadAvatar = async (file) => {
    if (!user) throw new Error('Not logged in');
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    const bucket = 'images';

    await uploadFile(bucket, file, fileName, { upsert: true });
    const publicUrl = getFileUrl(bucket, fileName);
    try {
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    } catch {}
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev);
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    loading,
    error,
    clearError,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    uploadAvatar,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
