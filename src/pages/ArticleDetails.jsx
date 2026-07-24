import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiFacebook, FiTwitter } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { supabase } from '../services/supabase';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const ArticleDetails = () => {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*, categories(name, name_ar)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      if (data) {
        setArticle({
          ...data,
          category: data.categories || null,
        });
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24">
        <div className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
            <div className="max-w-4xl mx-auto">
              <div className="h-80 glass-card rounded-2xl animate-pulse mb-8" />
              <div className="h-6 glass-card rounded mb-4 w-1/3 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 glass-card rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-24">
        <div className="section-padding text-center py-20">
          <p className="text-gray-400 text-lg">Article not found.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary-light transition-colors">
            <FiArrowLeft className="w-4 h-4" />{t('articleDetails.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  const dir = t('dir');
  const title = dir === 'rtl' ? article.title_ar || article.title : article.title;
  const content = dir === 'rtl' ? article.content_ar || article.content : article.content;
  const categoryName = article.category
    ? (dir === 'rtl' ? article.category.name_ar || article.category.name : article.category.name)
    : null;

  return (
    <>
      <PageHeader title={title} breadcrumbs={[{ name: t('blog.breadcrumb'), path: '/blog' }, { name: title }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="fade-up visible">
              <div className="relative h-80 rounded-2xl overflow-hidden mb-8">
                <img src={article.image} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent" />
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
                {article.author && (
                  <span className="flex items-center gap-1"><FiUser className="w-4 h-4" />{article.author}</span>
                )}
                {article.created_at && (
                  <span className="flex items-center gap-1"><FiCalendar className="w-4 h-4" />{formatDate(article.created_at)}</span>
                )}
                {categoryName && <span className="px-3 py-1 glass-card text-xs">{categoryName}</span>}
              </div>

              <div className="prose prose-invert max-w-none">
                {(content || '').split('\n').map((para, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed mb-4">{para}</p>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-dark-border">
                <span className="text-sm text-gray-500">{t('articleDetails.share')}</span>
                <a href="#" className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary/50"><FiFacebook className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary/50"><FiTwitter className="w-4 h-4" /></a>
                <button className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary/50"><FiShare2 className="w-4 h-4" /></button>
              </div>

              <Link to="/blog" className="inline-flex items-center gap-2 mt-8 text-primary hover:text-primary-light transition-colors">
                <FiArrowLeft className="w-4 h-4" />{t('articleDetails.backToBlog')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArticleDetails;
