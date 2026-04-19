import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';

const UserReplyPage = () => {
  const { id } = useParams();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msgData, setMsgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/messages/thread/${id}`)
      .then(res => setMsgData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await API.post(`/messages/${id}/user-reply`, { userReply: text });
      setMsgData(res.data.data);
      setText('');
      setSent(true);
    } catch {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className='container'><p style={{ padding: '3rem' }}>Loading...</p></main>;

  return (
    <main className='container' style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1rem' }}>
      <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--accent)', marginBottom: '16px' }}>
        Conversation Thread
      </h2>

      {/* Conversation history */}
      {msgData && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px',
          maxHeight: '400px', overflowY: 'auto', padding: '12px',
          background: 'var(--accent-light)', borderRadius: '8px' }}>

          {/* Original message */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '75%', background: '#e8f4fd', border: '1.5px solid #b08968',
              borderRadius: '12px 12px 2px 12px', padding: '10px 14px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#b08968', marginBottom: '4px' }}>
                You (Original Message)
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{msgData.message}</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#888' }}>
                {new Date(msgData.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Thread replies */}
          {msgData.threads?.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: t.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                background: t.sender === 'user' ? '#e8f4fd' : '#2980b9',
                color: t.sender === 'user' ? '#333' : '#fff',
                border: t.sender === 'user' ? '1.5px solid #b08968' : 'none',
                borderRadius: t.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '10px 14px',
              }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px',
                  color: t.sender === 'user' ? '#b08968' : '#fff', opacity: t.sender === 'admin' ? 0.85 : 1 }}>
                  {t.sender === 'user' ? 'You' : 'Admin (Chess Unlocked)'}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{t.text}</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.72rem',
                  color: t.sender === 'user' ? '#888' : 'rgba(255,255,255,0.75)',
                  textAlign: t.sender === 'user' ? 'right' : 'left' }}>
                  {new Date(t.sentAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {!sent ? (
        <>
          <textarea
            className='form-input'
            rows={4}
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
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--accent)' }}>Reply Sent!</h3>
          <p>The admin will see your reply shortly.</p>
          <button className='btn-primary' onClick={() => setSent(false)}
            style={{ background: 'var(--accent)', color: '#fff', marginTop: '8px' }}>
            Send Another Reply
          </button>
        </div>
      )}
    </main>
  );
};

export default UserReplyPage;