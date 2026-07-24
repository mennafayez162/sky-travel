import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiArrowRight, FiSearch, FiFileText } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import { supabase } from '../services/supabase';
import { formatDate, truncate } from '../utils/helpers';
import { usePagination } from '../hooks/usePagination';
import { useLanguage } from '../context/LanguageContext';

const Blog = () => {
  const { t, isRTL } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const pagination = usePagination(totalItems, 6);

  useEffect(() => {
    fetchPosts();
  }, [pagination.currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blogs')
        .select('*', { count: 'exact' })
        .or('is_published.eq.true,is_published.is.null');

      if (search) {
        query = query.or(`title.ilike.%${search}%,title_ar.ilike.%${search}%,excerpt.ilike.%${search}%`);
      }

      const from = (pagination.currentPage - 1) * 6;
      const to = from + 5;

      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setPosts(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title={t('blog.title')} breadcrumbs={[{ name: t('blog.breadcrumb') }]} />
      <section className="section-padding">
        <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
          <div className="relative max-w-md mx-auto mb-12">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); pagination.goToPage(1); }}
              placeholder={t('blog.searchPlaceholder')}
              className="input-dark pl-12"
            />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <FiFileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">{isRTL ? 'لا توجد مقالات' : 'No posts found'}</h3>
              <p className="text-gray-500">{isRTL ? 'أضف المقالات من لوحة التحكم' : 'Add blog posts from Admin Dashboard'}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link to={`/blog/${post.slug}`} className="group block glass-card overflow-hidden card-hover">
                      {post.image && (
                        <div className="relative h-48 overflow-hidden">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {isRTL ? post.title_ar || post.title : post.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {isRTL ? post.excerpt_ar || post.excerpt : post.excerpt}
                        </p>
                        <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                          {t('blog.readMore')} <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} paginationRange={pagination.paginationRange} onPageChange={pagination.goToPage} onNext={pagination.goToNextPage} onPrev={pagination.goToPrevPage} onFirst={pagination.goToFirstPage} onLast={pagination.goToLastPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
