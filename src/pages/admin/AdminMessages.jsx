import { useState, useEffect } from 'react';
import { FiTrash2, FiCheck, FiMail, FiSend, FiCornerUpLeft, FiClock, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import { supabase } from '../../services/supabase';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const EMAILJS_SERVICE_ID = 'service_lnhidee';
const EMAILJS_TEMPLATE_ID = 'template_4uz6yrm';

const AdminMessages = () => {
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => { emailjs.init({ publicKey: 'P0L-zT8TIVp-YyDpG' }); }, []);

  useEffect(() => {
    if (selected) {
      const updated = messages.find(m => m.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [messages]);

  const markRead = async (id) => {
    const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    fetchMessages();
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const { error } = await supabase.from('messages').update({
        reply: replyText.trim(),
        replied_at: new Date().toISOString(),
        is_read: true,
      }).eq('id', selected.id);
      if (error) throw error;

      if (selected.email) {
        try {
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_name: selected.name,
            to_email: selected.email,
            subject: selected.subject,
            reply: replyText.trim(),
          });
        } catch (emailErr) {
          console.error('Email send failed:', emailErr);
        }
      }

      toast.success(isRTL ? 'تم إرسال الرد' : 'Reply sent');
      setReplyText('');
      fetchMessages();
    } catch (err) {
      toast.error(err.message || (isRTL ? 'فشل إرسال الرد' : 'Failed to send reply'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.messages.confirmDelete'))) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    setSelected(null);
    fetchMessages();
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'replied') return !!m.replied_at;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const repliedCount = messages.filter((m) => !!m.replied_at).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.messages.title')} {unreadCount > 0 && <span className="text-sm text-primary">({unreadCount} {isRTL ? 'غير مقروء' : 'unread'})</span>}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: isRTL ? 'الكل' : 'All', count: messages.length },
          { key: 'unread', label: isRTL ? 'غير مقروء' : 'Unread', count: unreadCount },
          { key: 'replied', label: isRTL ? 'تم الرد' : 'Replied', count: repliedCount },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? 'bg-primary text-white' : 'glass-card text-gray-400 hover:text-white'}`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              {isRTL ? 'لا توجد رسائل' : 'No messages'}
            </div>
          ) : filtered.map((m) => (
            <button key={m.id} onClick={() => { setSelected(m); if (!m.is_read) markRead(m.id); }}
              className={`w-full text-left p-4 rounded-xl transition-all ${selected?.id === m.id ? 'bg-primary/20 border border-primary/30' : m.is_read ? 'glass-card' : 'glass-card border-primary/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {!m.is_read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                {m.replied_at && <FiCornerUpLeft className="w-3 h-3 text-green-400 flex-shrink-0" />}
                <p className="text-sm font-semibold truncate">{m.name}</p>
              </div>
              <p className="text-xs text-gray-400 truncate">{m.subject}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{formatDate(m.created_at)}</p>
                {m.replied_at && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">{isRTL ? 'تم الرد' : 'Replied'}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Message detail + reply */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Original message */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{selected.subject}</h2>
                    <p className="text-sm text-gray-400">{isRTL ? 'من' : 'From'}: {selected.name} ({selected.email})</p>
                    {selected.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><FiPhone className="w-3 h-3" /> {selected.phone}</p>}
                    <p className="text-xs text-gray-500">{formatDate(selected.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    {selected.phone && (
                      <a
                        href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(replyText || selected.message || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                        title="WhatsApp"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                      </a>
                    )}
                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}&body=${encodeURIComponent(selected.reply || '')}`} className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Email">
                      <FiMail className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(selected.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="Delete">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-dark-surface/50 rounded-xl p-5">
                  <p className="text-gray-300 whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              {/* Previous reply */}
              {selected.reply && (
                <div className="glass-card p-6 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-400">{isRTL ? 'ردك' : 'Your Reply'}</p>
                      <p className="text-xs text-gray-500">{formatDate(selected.replied_at)}</p>
                    </div>
                  </div>
                  <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-5">
                    <p className="text-gray-300 whitespace-pre-wrap">{selected.reply}</p>
                  </div>
                </div>
              )}

              {/* Reply box */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiCornerUpLeft className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">{isRTL ? 'رد على هذه الرسالة' : 'Reply to this message'}</h3>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="input-dark resize-none w-full mb-4"
                  placeholder={isRTL ? 'اكتب ردك هنا...' : 'Write your reply here...'}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {selected.phone
                      ? (isRTL ? `واتساب: ${selected.phone}` : `WhatsApp: ${selected.phone}`)
                      : (isRTL ? `إرسال إلى: ${selected.email}` : `Sending to: ${selected.email}`)}
                  </p>
                  <div className="flex items-center gap-2">
                    {selected.phone && replyText.trim() && (
                      <a
                        href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(replyText.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        <span>{isRTL ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}</span>
                      </a>
                    )}
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || sending}
                      className="gradient-btn px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiSend className="w-4 h-4" />
                      <span>{sending ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'إرسال الرد' : 'Send Reply')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <FiMail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t('admin.messages.selectMessage')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
