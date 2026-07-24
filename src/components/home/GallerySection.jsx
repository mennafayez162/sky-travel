import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2, FiImage } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const GallerySection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const { ref, isVisible } = useScrollAnimation();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await supabase
          .from('gallery')
          .select('*')
          .order('sort_order', { ascending: true })
          .limit(8);
        if (data) setImages(data);
      } catch (err) {
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const openLightbox = (index) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const nextImage = () => setLightbox((prev) => ({ ...prev, index: (prev.index + 1) % images.length }));
  const prevImage = () => setLightbox((prev) => ({ ...prev, index: (prev.index - 1 + images.length) % images.length }));

  if (loading) return null;

  if (images.length === 0) {
    return (
      <section ref={ref} className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.gallery')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {isRTL ? 'لحظات' : 'Travel'} <span className="text-gradient">{isRTL ? 'السفر' : 'Moments'}</span>
            </h2>
          </div>
          <div className="text-center py-16 glass-card rounded-2xl">
            <FiImage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد صور بعد' : 'No images yet'}</h3>
            <p className="text-gray-500">{isRTL ? 'أضف الصور من لوحة التحكم' : 'Add images from Admin Dashboard'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="section-padding">
      <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
        <div className={`text-center mb-12 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">{t('homeSections.gallery')}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {isRTL ? 'لحظات' : 'Travel'} <span className="text-gradient">{isRTL ? 'السفر' : 'Moments'}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`relative overflow-hidden rounded-xl cursor-pointer group fade-up ${isVisible ? 'visible' : ''} ${
                i === 0 || i === 5 ? 'row-span-2 h-64 md:h-auto' : 'h-32 md:h-40'
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
              onClick={() => openLightbox(i)}
            >
              <img
                src={img.image_url || img.image}
                alt={isRTL ? img.title_ar || img.title : img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <FiMaximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox.open && images[lightbox.index] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 text-white hover:text-primary">
            <FiX className="w-8 h-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 p-2 text-white hover:text-primary">
            <FiChevronLeft className={`w-8 h-8 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <img
            src={images[lightbox.index].image_url || images[lightbox.index].image}
            alt={images[lightbox.index].title}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 p-2 text-white hover:text-primary">
            <FiChevronRight className={`w-8 h-8 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <div className="absolute bottom-6 text-center text-white">
            <h3 className="font-bold">{isRTL ? images[lightbox.index].title_ar || images[lightbox.index].title : images[lightbox.index].title}</h3>
            <p className="text-sm text-gray-400">{lightbox.index + 1} / {images.length}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
