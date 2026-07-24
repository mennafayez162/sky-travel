import { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit2, FiImage, FiUsers, FiTarget, FiInfo } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const ICON_OPTIONS = [
  { value: 'FiTarget', label: 'Target' },
  { value: 'FiEye', label: 'Eye' },
  { value: 'FiHeart', label: 'Heart' },
  { value: 'FiStar', label: 'Star' },
  { value: 'FiAward', label: 'Award' },
  { value: 'FiGlobe', label: 'Globe' },
  { value: 'FiCompass', label: 'Compass' },
  { value: 'FiShield', label: 'Shield' },
];

const AdminAbout = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('story');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Story state
  const [story, setStory] = useState({
    about_label: '', about_label_ar: '',
    about_title: '', about_title_ar: '',
    about_paragraph1: '', about_paragraph1_ar: '',
    about_paragraph2: '', about_paragraph2_ar: '',
    about_paragraph3: '', about_paragraph3_ar: '',
    about_image: '',
    about_years_label: '', about_years_label_ar: '',
    about_years_number: 10,
  });

  // Values state
  const [values, setValues] = useState([]);
  const [editingValue, setEditingValue] = useState(null);
  const [valueForm, setValueForm] = useState({
    title: '', title_ar: '', description: '', description_ar: '', icon: 'FiTarget',
  });

  // Team state
  const [team, setTeam] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '', name_ar: '', role: '', role_ar: '', image: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: settings } = await supabase.from('settings').select('*').limit(1).single();
      if (settings) {
        setStory({
          about_label: settings.about_label || '',
          about_label_ar: settings.about_label_ar || '',
          about_title: settings.about_title || '',
          about_title_ar: settings.about_title_ar || '',
          about_paragraph1: settings.about_paragraph1 || '',
          about_paragraph1_ar: settings.about_paragraph1_ar || '',
          about_paragraph2: settings.about_paragraph2 || '',
          about_paragraph2_ar: settings.about_paragraph2_ar || '',
          about_paragraph3: settings.about_paragraph3 || '',
          about_paragraph3_ar: settings.about_paragraph3_ar || '',
          about_image: settings.about_image || '',
          about_years_label: settings.about_years_label || '',
          about_years_label_ar: settings.about_years_label_ar || '',
          about_years_number: settings.about_years_number || 10,
        });
      }

      const { data: valuesData } = await supabase.from('about_values').select('*').order('sort_order');
      setValues(valuesData || []);

      const { data: teamData } = await supabase.from('team_members').select('*').order('sort_order');
      setTeam(teamData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // === STORY HANDLERS ===
  const handleStoryChange = (key, val) => setStory(prev => ({ ...prev, [key]: val }));

  const handleSaveStory = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').update({
        about_label: story.about_label,
        about_label_ar: story.about_label_ar,
        about_title: story.about_title,
        about_title_ar: story.about_title_ar,
        about_paragraph1: story.about_paragraph1,
        about_paragraph1_ar: story.about_paragraph1_ar,
        about_paragraph2: story.about_paragraph2,
        about_paragraph2_ar: story.about_paragraph2_ar,
        about_paragraph3: story.about_paragraph3,
        about_paragraph3_ar: story.about_paragraph3_ar,
        about_image: story.about_image,
        about_years_label: story.about_years_label,
        about_years_label_ar: story.about_years_label_ar,
        about_years_number: Number(story.about_years_number),
      }).eq('id', (await supabase.from('settings').select('id').limit(1).single()).data.id);
      if (error) throw error;
      toast.success('Story saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // === VALUES HANDLERS ===
  const handleSaveValue = async () => {
    if (!valueForm.title) { toast.error('Title is required'); return; }
    try {
      const payload = {
        title: valueForm.title,
        title_ar: valueForm.title_ar,
        description: valueForm.description,
        description_ar: valueForm.description_ar,
        icon: valueForm.icon,
      };

      if (editingValue) {
        const { error } = await supabase.from('about_values').update(payload).eq('id', editingValue.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const maxSort = values.reduce((max, v) => Math.max(max, v.sort_order || 0), 0);
        const { error } = await supabase.from('about_values').insert({ ...payload, sort_order: maxSort + 1 });
        if (error) throw error;
        toast.success('Created');
      }
      setEditingValue(null);
      setValueForm({ title: '', title_ar: '', description: '', description_ar: '', icon: 'FiTarget' });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteValue = async (id) => {
    if (!confirm('Delete this value?')) return;
    const { error } = await supabase.from('about_values').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted');
    fetchData();
  };

  const handleEditValue = (v) => {
    setEditingValue(v);
    setValueForm({
      title: v.title || '',
      title_ar: v.title_ar || '',
      description: v.description || '',
      description_ar: v.description_ar || '',
      icon: v.icon || 'FiTarget',
    });
  };

  // === TEAM HANDLERS ===
  const handleSaveMember = async () => {
    if (!memberForm.name || !memberForm.role) { toast.error('Name and role are required'); return; }
    try {
      const payload = {
        name: memberForm.name,
        name_ar: memberForm.name_ar,
        role: memberForm.role,
        role_ar: memberForm.role_ar,
        image: memberForm.image,
      };

      if (editingMember) {
        const { error } = await supabase.from('team_members').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        toast.success('Updated');
      } else {
        const maxSort = team.reduce((max, m) => Math.max(max, m.sort_order || 0), 0);
        const { error } = await supabase.from('team_members').insert({ ...payload, sort_order: maxSort + 1 });
        if (error) throw error;
        toast.success('Created');
      }
      setEditingMember(null);
      setMemberForm({ name: '', name_ar: '', role: '', role_ar: '', image: '' });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Delete this member?')) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Deleted');
    fetchData();
  };

  const handleEditMember = (m) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name || '',
      name_ar: m.name_ar || '',
      role: m.role || '',
      role_ar: m.role_ar || '',
      image: m.image || '',
    });
  };

  const TABS = [
    { key: 'story', icon: FiInfo, label: 'Story Section' },
    { key: 'values', icon: FiTarget, label: 'Values' },
    { key: 'team', icon: FiUsers, label: 'Team' },
  ];

  if (loading) {
    return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">About Page</h1>
        {activeTab === 'story' && (
          <button onClick={handleSaveStory} disabled={saving} className="gradient-btn px-4 py-2 text-sm flex items-center gap-2">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Story'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === key ? 'bg-primary text-white' : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* === STORY TAB === */}
      {activeTab === 'story' && (
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold mb-4">Story Header</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Label (English)</label>
                <input type="text" value={story.about_label} onChange={(e) => handleStoryChange('about_label', e.target.value)} className="input-dark w-full text-sm" placeholder="Our Story" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Label (Arabic)</label>
                <input type="text" value={story.about_label_ar} onChange={(e) => handleStoryChange('about_label_ar', e.target.value)} className="input-dark w-full text-sm" dir="rtl" placeholder="قصتنا" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title (English)</label>
                <input type="text" value={story.about_title} onChange={(e) => handleStoryChange('about_title', e.target.value)} className="input-dark w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title (Arabic)</label>
                <input type="text" value={story.about_title_ar} onChange={(e) => handleStoryChange('about_title_ar', e.target.value)} className="input-dark w-full text-sm" dir="rtl" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold mb-4">Paragraphs</h2>
            {[1, 2, 3].map((num) => (
              <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Paragraph {num} (English)</label>
                  <textarea value={story[`about_paragraph${num}`]} onChange={(e) => handleStoryChange(`about_paragraph${num}`, e.target.value)} className="input-dark w-full text-sm resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Paragraph {num} (Arabic)</label>
                  <textarea value={story[`about_paragraph${num}_ar`]} onChange={(e) => handleStoryChange(`about_paragraph${num}_ar`, e.target.value)} className="input-dark w-full text-sm resize-none" rows={3} dir="rtl" />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold mb-4">Image & Experience</h2>
            <ImageUpload value={story.about_image} onChange={(url) => handleStoryChange('about_image', url)} bucket="images" folder="about" label="About Image" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Years Number</label>
                <input type="number" value={story.about_years_number} onChange={(e) => handleStoryChange('about_years_number', e.target.value)} className="input-dark w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Years Label (English)</label>
                <input type="text" value={story.about_years_label} onChange={(e) => handleStoryChange('about_years_label', e.target.value)} className="input-dark w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Years Label (Arabic)</label>
                <input type="text" value={story.about_years_label_ar} onChange={(e) => handleStoryChange('about_years_label_ar', e.target.value)} className="input-dark w-full text-sm" dir="rtl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === VALUES TAB === */}
      {activeTab === 'values' && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingValue ? 'Edit Value' : 'Add Value'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title (English)</label>
                <input type="text" value={valueForm.title} onChange={(e) => setValueForm(p => ({ ...p, title: e.target.value }))} className="input-dark w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title (Arabic)</label>
                <input type="text" value={valueForm.title_ar} onChange={(e) => setValueForm(p => ({ ...p, title_ar: e.target.value }))} className="input-dark w-full text-sm" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description (English)</label>
                <textarea value={valueForm.description} onChange={(e) => setValueForm(p => ({ ...p, description: e.target.value }))} className="input-dark w-full text-sm resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description (Arabic)</label>
                <textarea value={valueForm.description_ar} onChange={(e) => setValueForm(p => ({ ...p, description_ar: e.target.value }))} className="input-dark w-full text-sm resize-none" rows={3} dir="rtl" />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-1">Icon</label>
                <select value={valueForm.icon} onChange={(e) => setValueForm(p => ({ ...p, icon: e.target.value }))} className="input-dark w-full text-sm">
                  {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pb-1">
                <button onClick={handleSaveValue} className="gradient-btn px-6 py-2.5 text-sm">{editingValue ? 'Update' : 'Add'}</button>
                {editingValue && (
                  <button onClick={() => { setEditingValue(null); setValueForm({ title: '', title_ar: '', description: '', description_ar: '', icon: 'FiTarget' }); }} className="glass-card px-4 py-2.5 text-sm">Cancel</button>
                )}
              </div>
            </div>
          </div>

          {/* Values List */}
          <div className="space-y-3">
            {values.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-400 text-sm">No values added yet</div>
            ) : values.map((v) => (
              <div key={v.id} className="glass-card p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{v.icon}</span>
                    <p className="font-semibold text-sm truncate">{v.title}</p>
                  </div>
                  {v.title_ar && <p className="text-sm text-gray-400 truncate" dir="rtl">{v.title_ar}</p>}
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{v.description}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEditValue(v)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteValue(v.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === TEAM TAB === */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingMember ? 'Edit Member' : 'Add Member'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name (English)</label>
                <input type="text" value={memberForm.name} onChange={(e) => setMemberForm(p => ({ ...p, name: e.target.value }))} className="input-dark w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name (Arabic)</label>
                <input type="text" value={memberForm.name_ar} onChange={(e) => setMemberForm(p => ({ ...p, name_ar: e.target.value }))} className="input-dark w-full text-sm" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Role (English)</label>
                <input type="text" value={memberForm.role} onChange={(e) => setMemberForm(p => ({ ...p, role: e.target.value }))} className="input-dark w-full text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Role (Arabic)</label>
                <input type="text" value={memberForm.role_ar} onChange={(e) => setMemberForm(p => ({ ...p, role_ar: e.target.value }))} className="input-dark w-full text-sm" dir="rtl" />
              </div>
            </div>
            <ImageUpload value={memberForm.image} onChange={(url) => setMemberForm(p => ({ ...p, image: url }))} bucket="images" folder="team" label="Member Photo (optional)" />
            <div className="flex gap-2">
              <button onClick={handleSaveMember} className="gradient-btn px-6 py-2.5 text-sm">{editingMember ? 'Update' : 'Add Member'}</button>
              {editingMember && (
                <button onClick={() => { setEditingMember(null); setMemberForm({ name: '', name_ar: '', role: '', role_ar: '', image: '' }); }} className="glass-card px-4 py-2.5 text-sm">Cancel</button>
              )}
            </div>
          </div>

          {/* Team List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-400 text-sm col-span-full">No team members yet</div>
            ) : team.map((m) => (
              <div key={m.id} className="glass-card p-4 text-center">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white/80">{m.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                )}
                <p className="font-bold text-sm">{m.name}</p>
                {m.name_ar && <p className="text-xs text-gray-400" dir="rtl">{m.name_ar}</p>}
                <p className="text-primary text-xs mt-1">{m.role}</p>
                {m.role_ar && <p className="text-primary text-xs" dir="rtl">{m.role_ar}</p>}
                <div className="flex justify-center gap-2 mt-3">
                  <button onClick={() => handleEditMember(m)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteMember(m.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAbout;
