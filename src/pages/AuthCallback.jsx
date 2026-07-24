import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data?.session?.user) {
          const userId = data.session.user.id;
          const meta = data.session.user.user_metadata || {};

          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

          if (!existing) {
            await supabase.from('profiles').upsert({
              id: userId,
              full_name: meta.full_name || meta.name || '',
              email: data.session.user.email || '',
              avatar_url: meta.avatar_url || meta.picture || '',
              role: 'user',
            }, { onConflict: 'id' });
          }

          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
