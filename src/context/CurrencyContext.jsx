import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('EGP');
  const [currencySymbol, setCurrencySymbol] = useState('ج.م');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('currency, currency_symbol')
        .eq('id', 1)
        .single();
      if (error) throw error;
      if (data?.currency) setCurrency(data.currency);
      if (data?.currency_symbol) setCurrencySymbol(data.currency_symbol);
    } catch (err) {
      console.error('Error fetching currency:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '';
    const num = Number(amount);
    if (isNaN(num)) return '';
    if (currency === 'EGP') {
      return `${num.toLocaleString('ar-EG')} ج.م`;
    }
    return `$${num.toLocaleString('en-US')}`;
  };

  const value = {
    currency,
    currencySymbol,
    loading,
    formatPrice,
    fetchCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
