import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ── MessageRow component ──────────────────────────────────────────────────
const MessageRow = ({ m, onRead, onReply, onDelete }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const markRead = async () => {
    if (m.isRead) return;
    try {
      const { data } = await API.patch(`/messages/${m._id}/read`);
      onRead(data);
    } catch (err) {
      alert('Failed to mark as read.');
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const { data } = await API.patch(`/messages/${m._id}/reply`, { reply: replyText });
      onReply(data);
      setReplyText('');
      setShowReply(false);
    } catch (err) {
      alert('Failed to save reply.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await API.delete(`/messages/${m._id}`);
      onDelete(m._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message.');
    } finally {
      setDeleting(false);
    }
  };

  // Determine last sender for "Waiting..." indicator
  const lastThread = m.threads?.length > 0 ? m.threads[m.threads.length - 1] : null;
  const hasUserReplied = m.threads?.length > 0
    ? lastThread?.sender === 'user'
    : !!m.userReply;

  return (
    <>
      <tr style={{ background: m.isRead ? 'transparent' : 'rgba(176,137,104,0.15)' }}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!m.isRead && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#e67e22', display: 'inline-block', flexShrink: 0
              }} />
            )}
            <span style={{ fontWeight: m.isRead ? 400 : 700 }}>{m.name}</span>
          </div>
        </td>
        <td>{m.email}</td>
        <td>{m.message}</td>
        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
        <td>
          <span style={{
            padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
            background: m.isRead ? '#27ae60' : '#e67e22',
            color: 'white'
          }}>
            {m.isRead ? 'Read' : 'Unread'}
          </span>
          {hasUserReplied && (
            <span style={{
              marginTop: '4px', display: 'block',
              padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
              background: '#2ecc71', color: 'white'
            }}>
              User Replied
            </span>
          )}
        </td>

        <td>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {!m.isRead && (
              <button
                className='btn-primary'
                onClick={markRead}
                style={{ padding: '5px 12px', fontSize: '0.78rem', background: '#27ae60', color: '#fff' }}
              >
                Mark Read
              </button>
            )}
            <button
              className='btn-primary'
              onClick={() => setShowReply(!showReply)}
              style={{ padding: '5px 12px', fontSize: '0.78rem', background: '#2980b9', color: '#fff' }}
            >
              {showReply ? 'Close' : (m.threads?.length > 0 || m.reply) ? 'View / Reply' : 'Reply'}
            </button>
            <button
              className='btn-primary'
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '5px 12px', fontSize: '0.78rem', background: '#c0392b', color: '#fff' }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </td>
      </tr>

      {/* ── Expanded conversation row ── */}
      {showReply && (
        <tr>
          <td colSpan={6} style={{ padding: '16px', background: 'var(--accent-light)' }}>

            {/* ── Conversation thread ── */}
            <div style={{
              marginBottom: '14px',
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '8px',
              background: 'rgba(255,255,255,0.4)',
              borderRadius: '8px',
            }}>

              {/* Original message ng user */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  maxWidth: '70%',
                  background: '#fff',
                  border: '1.5px solid #b08968',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '10px 14px',
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#b08968', marginBottom: '4px' }}>
                    {m.name} (Original Message)
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{m.message}</p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#888' }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* ── NEW: Continuous threads array ── */}
              {m.threads && m.threads.length > 0 ? (
                m.threads.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: t.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: t.sender === 'admin' ? '#2980b9' : '#fff',
                      color: t.sender === 'admin' ? '#fff' : '#333',
                      border: t.sender === 'admin' ? 'none' : '1.5px solid #27ae60',
                      borderRadius: t.sender === 'admin' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '10px 14px',
                    }}>
                      <p style={{
                        margin: 0, fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px',
                        color: t.sender === 'admin' ? 'rgba(255,255,255,0.85)' : '#27ae60'
                      }}>
                        {t.sender === 'admin' ? 'You (Admin)' : `${m.name} (User)`}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{t.text}</p>
                      <p style={{
                        margin: '6px 0 0', fontSize: '0.72rem',
                        color: t.sender === 'admin' ? 'rgba(255,255,255,0.7)' : '#888',
                        textAlign: t.sender === 'admin' ? 'right' : 'left'
                      }}>
                        {new Date(t.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                /* ── Fallback para sa lumang messages na wala pang threads ── */
                <>
                  {m.reply && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{
                        maxWidth: '70%', background: '#2980b9', color: '#fff',
                        borderRadius: '12px 12px 2px 12px', padding: '10px 14px',
                      }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, opacity: 0.85, marginBottom: '4px' }}>
                          You (Admin)
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{m.reply}</p>
                        {m.repliedAt && (
                          <p style={{ margin: '6px 0 0', fontSize: '0.72rem', opacity: 0.75, textAlign: 'right' }}>
                            {new Date(m.repliedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {m.userReply && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', background: '#fff', border: '1.5px solid #27ae60',
                        borderRadius: '12px 12px 12px 2px', padding: '10px 14px',
                      }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#27ae60', marginBottom: '4px' }}>
                          {m.name} (User)
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{m.userReply}</p>
                        {m.userRepliedAt && (
                          <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#888' }}>
                            {new Date(m.userRepliedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Waiting indicator — kapag ang huli ay admin ang nagsend */}
              {lastThread?.sender === 'admin' && (
                <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#888', textAlign: 'center', margin: '4px 0' }}>
                  Waiting for user's reply...
                </p>
              )}
            </div>

            {/* ── Reply textarea ── */}
            <textarea
              className='form-input'
              rows={3}
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder='Write your reply...'
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                className='btn-primary'
                onClick={submitReply}
                disabled={saving}
                style={{ background: '#2980b9', color: '#fff' }}
              >
                {saving ? 'Saving...' : 'Send Reply'}
              </button>
              <button
                className='btn-primary'
                onClick={() => setShowReply(false)}
                style={{ background: '#7f8c8d', color: '#fff' }}
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── AdminPage component ───────────────────────────────────────────────────
const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users,    setUsers]    = useState([]);
  const [posts,    setPosts]    = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab,      setTab]      = useState('users');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/users'),
      API.get('/admin/posts'),
      API.get('/messages'),
    ])
      .then(([usersRes, postsRes, msgsRes]) => {
        setUsers(usersRes.data);
        setPosts(postsRes.data);
        setMessages(msgsRes.data);
      })
      .catch(err => console.error('Admin fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (userId) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}/status`);
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const removePost = async (postId) => {
    if (!window.confirm('Remove this post? It will be hidden from public view.')) return;
    try {
      await API.put(`/admin/posts/${postId}/remove`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'removed' } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove post.');
    }
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  const tabStyle = (name) => ({
    background:    tab === name ? 'var(--accent)' : 'rgba(139,94,60,0.15)',
    color:         tab === name ? '#ffffff'        : 'black',
    border:        '2px solid var(--accent)',
    fontWeight:    tab === name ? 850              : 700,
    padding:       '8px 18px',
    borderRadius:  '6px',
    cursor:        'pointer',
    fontFamily:    "'Cinzel', serif",
    fontSize:      '0.88rem',
    letterSpacing: '0.03em',
    transition:    'all 0.2s ease',
    opacity:       tab === name ? 1 : 0.75,
  });

  if (loading) return (
    <main className='container'>
      <p style={{ padding: '3rem', fontStyle: 'italic' }}>Loading dashboard...</p>
    </main>
  );

  return (
    <main className='container'>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", borderBottom: '3px solid var(--accent)', paddingBottom: '8px' }}>
          Admin Dashboard
        </h2>
      </section>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button style={tabStyle('users')}    onClick={() => setTab('users')}>
          Members ({users.length})
        </button>
        <button style={tabStyle('posts')}    onClick={() => setTab('posts')}>
          All Posts ({posts.length})
        </button>
        <button style={tabStyle('messages')} onClick={() => setTab('messages')}>
          Messages ({messages.length}){unreadCount > 0 && ` • ${unreadCount} new`}
        </button>
      </div>

      {/* ── Members tab ── */}
      {tab === 'users' && (
        <section className='card-warm' style={{ overflowX: 'auto' }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '16px' }}>Member Accounts</h3>
          {users.length === 0 && <p style={{ fontStyle: 'italic' }}>No members registered yet.</p>}
          <table className='resources-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.profilePic && (
                        <img src={u.profilePic} alt=''
                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', margin: 0 }} />
                      )}
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                      background: u.status === 'active' ? '#27ae60' : '#c0392b',
                      color: 'white'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className='btn-primary'
                      onClick={() => toggleStatus(u._id)}
                      style={{ padding: '5px 14px', fontSize: '0.8rem', background: u.status === 'active' ? '#c0392b' : '#27ae60', color: '#fff' }}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── Messages tab ── */}
      {tab === 'messages' && (
        <section className='card-warm' style={{ overflowX: 'auto' }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '16px' }}>Contact Messages</h3>
          {messages.length === 0 && <p style={{ fontStyle: 'italic' }}>No messages yet.</p>}
          <table className='resources-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <MessageRow
                  key={m._id}
                  m={m}
                  onRead={(updated)  => setMessages(prev => prev.map(x => x._id === updated._id ? updated : x))}
                  onReply={(updated) => setMessages(prev => prev.map(x => x._id === updated._id ? updated : x))}
                  onDelete={deleteMessage}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── Posts tab ── */}
      {tab === 'posts' && (
        <section className='card-warm' style={{ overflowX: 'auto' }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '16px' }}>All Posts</h3>
          {posts.length === 0 && <p style={{ fontStyle: 'italic' }}>No posts yet.</p>}
          <table className='resources-table'>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.author?.name}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                      background: p.status === 'published' ? '#27ae60' : '#c0392b',
                      color: 'white'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === 'published' && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {p.author?._id === currentUser?._id && (
                          <button
                            className='btn-primary'
                            onClick={() => navigate(`/edit-post/${p._id}`)}
                            style={{ padding: '5px 14px', fontSize: '0.8rem', background: '#2980b9', color: '#fff' }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className='btn-primary'
                          onClick={() => removePost(p._id)}
                          style={{ padding: '5px 14px', fontSize: '0.8rem', background: '#c0392b', color: '#fff' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {p.status === 'removed' && (
                      <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        Removed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

    </main>
  );
};

export default AdminPage;