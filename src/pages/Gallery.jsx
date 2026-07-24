import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2, FiImage } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

const Gallery = () => {
  const { t, isRTL } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await supabase
          .from('gallery')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (data) setImages(data);
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const categories = ['All', ...new Set(images.map((img) => img.category).filter(Boolean))];
  const filtered = activeCategory === 'All' ? images : images.filter((img) => img.category === activeCategory);

  const openLightbox = (index) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const next = () => setLightbox((p) => ({ ...p, index: (p.index + 1) % filtered.length }));
  const prev = () => setLightbox((p) => ({ ...p, index: (p.index - 1 + filtered.length) % filtered.length }));

  return (
    <>
      <PageHeader title={t('galleryPage.title')} breadcrumbs={[{ name: t('galleryPage.breadcrumb') }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <FiImage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد صور' : 'No images found'}</h3>
              <p className="text-gray-500">{isRTL ? 'أضف الصور من لوحة التحكم' : 'Add images from Admin Dashboard'}</p>
            </div>
          ) : (
            <>
              {categories.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'gradient-btn' : 'glass-card text-gray-400 hover:text-white'}`}>
                      {cat === 'All' ? t('gallery.categories.all') : cat}
                    </button>
                  ))}
                </div>
              )}

              <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                {filtered.map((img, i) => (
                  <motion.div key={img.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="mb-4 break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden"
                    onClick={() => openLightbox(i)}>
                    <img src={img.image_url || img.image} alt={img.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <FiMaximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">{isRTL ? img.title_ar || img.title : img.title}</p>
                      {img.category && <p className="text-gray-300 text-xs">{img.category}</p>}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>

        <AnimatePresence>
          {lightbox.open && filtered[lightbox.index] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
              <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 text-white hover:text-primary"><FiX className="w-8 h-8" /></button>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 p-2 text-white hover:text-primary"><FiChevronLeft className={`w-8 h-8 ${isRTL ? 'rotate-180' : ''}`} /></button>
              <img src={filtered[lightbox.index].image_url || filtered[lightbox.index].image} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 p-2 text-white hover:text-primary"><FiChevronRight className={`w-8 h-8 ${isRTL ? 'rotate-180' : ''}`} /></button>
              <div className="absolute bottom-6 text-center text-white">
                <h3 className="font-bold">{isRTL ? filtered[lightbox.index].title_ar || filtered[lightbox.index].title : filtered[lightbox.index].title}</h3>
                <p className="text-sm text-gray-400">{lightbox.index + 1} / {filtered.length}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Gallery;
