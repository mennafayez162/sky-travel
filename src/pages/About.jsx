import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiHeart, FiUsers, FiAward, FiGlobe, FiCompass, FiStar, FiShield } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Testimonials from '../components/home/Testimonials';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

const ICON_MAP = {
  FiTarget, FiEye, FiHeart, FiUsers, FiAward, FiGlobe, FiCompass, FiStar, FiShield,
};

const INITIALS_GRADIENT = [
  'from-blue-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
];

const About = () => {
  const { t, isRTL } = useLanguage();
  const [story, setStory] = useState(null);
  const [values, setValues] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: settings } = await supabase.from('settings').select('*').limit(1).single();
      setStory(settings);

      const { data: valuesData } = await supabase.from('about_values').select('*').eq('is_active', true).order('sort_order');
      setValues(valuesData || []);

      const { data: teamData } = await supabase.from('team_members').select('*').eq('is_active', true).order('sort_order');
      setTeam(teamData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasStoryContent = story?.about_title || story?.about_title_ar || story?.about_paragraph1 || story?.about_paragraph1_ar;

  const storyLabel = isRTL ? (story?.about_label_ar || story?.about_label) : story?.about_label;
  const storyTitle = isRTL ? (story?.about_title_ar || story?.about_title) : story?.about_title;
  const paragraphs = [
    isRTL ? (story?.about_paragraph1_ar || story?.about_paragraph1) : story?.about_paragraph1,
    isRTL ? (story?.about_paragraph2_ar || story?.about_paragraph2) : story?.about_paragraph2,
    isRTL ? (story?.about_paragraph3_ar || story?.about_paragraph3) : story?.about_paragraph3,
  ].filter(Boolean);
  const yearsLabel = isRTL ? (story?.about_years_label_ar || story?.about_years_label) : story?.about_years_label;
  const yearsNumber = story?.about_years_number;
  const aboutImage = story?.about_image;

  return (
    <>
      <PageHeader
        title={t('about.title1')}
        breadcrumbs={[{ name: t('about.breadcrumb') }]}
      />

      {/* Story Section */}
      {hasStoryContent && (
        <section className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {storyLabel && <span className="text-primary font-semibold text-sm uppercase tracking-wider">{storyLabel}</span>}
                {storyTitle && <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">{storyTitle}</h2>}
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <Link to="/trips" className="inline-flex gradient-btn px-8 py-3 mt-6">
                  <span>{t('about.exploreTrips')}</span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {aboutImage && (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={aboutImage} alt="About" className="w-full h-96 object-cover rounded-2xl" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent rounded-2xl" />
                  </div>
                )}
                {yearsNumber && (
                  <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                        <FiAward className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gradient">{yearsNumber}+</p>
                        {yearsLabel && <p className="text-sm text-gray-400">{yearsLabel}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <section className="section-padding bg-dark-card/50">
          <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => {
                const IconComponent = ICON_MAP[v.icon] || FiTarget;
                const title = isRTL ? (v.title_ar || v.title) : v.title;
                const desc = isRTL ? (v.description_ar || v.description) : v.description;
                return (
                  <motion.div
                    key={v.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="glass-card p-8 text-center card-hover"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title}</h3>
                    <p className="text-gray-400">{desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section className="section-padding">
          <div className="container-custom mx-auto px-4 md:px-8 lg:px-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => {
                const name = isRTL ? (member.name_ar || member.name) : member.name;
                const role = isRTL ? (member.role_ar || member.role) : member.role;
                return (
                  <motion.div
                    key={member.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card overflow-hidden text-center card-hover"
                  >
                    {member.image ? (
                      <img src={member.image} alt={name} className="w-full h-64 object-cover" loading="lazy" />
                    ) : (
                      <div className={`w-full h-64 bg-gradient-to-br ${INITIALS_GRADIENT[i % INITIALS_GRADIENT.length]} flex items-center justify-center`}>
                        <span className="text-5xl font-bold text-white/80">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-lg">{name}</h3>
                      <p className="text-primary text-sm">{role}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {!hasStoryContent && values.length === 0 && team.length === 0 && (
        <section className="section-padding text-center">
          <p className="text-gray-500">{isRTL ? 'أضف محتوى من لوحة التحكم' : 'Add content from Admin Dashboard'}</p>
        </section>
      )}

      <Testimonials />
    </>
  );
};

export default About;
