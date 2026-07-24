import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      const local = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(local);
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (tripId) => {
    if (user) {
      try {
        await supabase.from('wishlist').insert({ user_id: user.id, trip_id: tripId });
        await fetchWishlist();
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    } else {
      const updated = [...wishlist, { trip_id: tripId }];
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  };

  const removeFromWishlist = async (tripId) => {
    if (user) {
      try {
        await supabase.from('wishlist').delete().eq('user_id', user.id).eq('trip_id', tripId);
        await fetchWishlist();
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    } else {
      const updated = wishlist.filter((item) => item.trip_id !== tripId);
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  };

  const isInWishlist = (tripId) => {
    return wishlist.some((item) => item.trip_id === tripId);
  };

  const toggleWishlist = (tripId) => {
    if (isInWishlist(tripId)) {
      removeFromWishlist(tripId);
    } else {
      addToWishlist(tripId);
    }
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
