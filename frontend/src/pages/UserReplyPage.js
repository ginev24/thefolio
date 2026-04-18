import { useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';

const UserReplyPage = () => {
  const { id } = useParams();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await API.post(`/messages/${id}/user-reply`, { userReply: text });
      setSent(true);
    } catch {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (sent) return (
    <main className='container' style={{ textAlign: 'center', padding: '4rem' }}>
      <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--accent)' }}>Reply Sent!</h2>
      <p>The admin will see your reply in the dashboard.</p>
    </main>
  );

  return (
    <main className='container' style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1rem' }}>
      <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--accent)', marginBottom: '16px' }}>
        Reply to Admin
      </h2>
      <textarea
        className='form-input'
        rows={5}
        style={{ width: '100%' }}
        placeholder='Write your reply here...'
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        className='btn-primary'
        onClick={handleSubmit}
        disabled={saving}
        style={{ marginTop: '12px', background: 'var(--accent)', color: '#fff' }}
      >
        {saving ? 'Sending...' : 'Send Reply'}
      </button>
    </main>
  );
};

export default UserReplyPage;