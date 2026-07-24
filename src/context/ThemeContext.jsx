import { createContext, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ThemeContext = createContext(null);

function hexToHSL(hex) {
  if (!hex || !hex.startsWith('#')) return null;
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function lightenHex(hex, amount = 10) {
  const hsl = hexToHSL(hex);
  if (!hsl) return hex;
  return `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + amount, 95)}%)`;
}

function darkenHex(hex, amount = 10) {
  const hsl = hexToHSL(hex);
  if (!hsl) return hex;
  return `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - amount, 5)}%)`;
}

function applyTheme(settings) {
  const root = document.documentElement;
  const p = settings.primary_color || '#4F46E5';
  const s = settings.secondary_color || '#6D28D9';

  root.style.setProperty('--color-primary', p);
  root.style.setProperty('--color-primary-light', lightenHex(p, 10));
  root.style.setProperty('--color-primary-dark', darkenHex(p, 10));
  root.style.setProperty('--color-secondary', s);
  root.style.setProperty('--color-secondary-light', lightenHex(s, 10));
  root.style.setProperty('--color-secondary-dark', darkenHex(s, 10));
}

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('primary_color, secondary_color, logo, favicon')
          .eq('id', 1)
          .single();
        if (data) {
          applyTheme(data);
          if (data.favicon) {
            const link = document.getElementById('favicon');
            if (link) link.href = data.favicon;
          }
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      }
    };

    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
