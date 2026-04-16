import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminPage = () => {
  const [users,   setUsers]   = useState([]);
  const [posts,   setPosts]   = useState([]);
  const [tab,     setTab]     = useState('users'); // 'users' | 'posts'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/users'),
      API.get('/admin/posts'),
    ])
      .then(([usersRes, postsRes]) => {
        setUsers(usersRes.data);
        setPosts(postsRes.data);
      })
      .catch(err => console.error('Admin fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Toggle a member's status between active and inactive
  const toggleStatus = async (userId) => {
    try {
      const { data } = await API.put(`/admin/users/${userId}/status`);
      // Update only that user in the list (don't re-fetch everything)
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Mark a post as removed (inappropriate)
  const removePost = async (postId) => {
    if (!window.confirm('Remove this post? It will be hidden from public view.')) return;
    try {
      await API.put(`/admin/posts/${postId}/remove`);
      // Update only that post's status in the local list
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'removed' } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove post.');
    }
  };

  if (loading) return <main className='container'><p style={{ padding:'3rem', fontStyle:'italic' }}>Loading dashboard...</p></main>;

  return (
    <main className='container'>

      <section style={{ marginBottom:'24px' }}>
        <h2 style={{ fontFamily:"'Cinzel', serif", borderBottom:'3px solid var(--accent)', paddingBottom:'8px' }}>
          Admin Dashboard
        </h2>
      </section>

      {/* ── Tab switcher ── */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'24px' }}>
        <button
          className='btn-primary'
          onClick={() => setTab('users')}
          style={{ background: tab === 'users' ? 'var(--accent-dark)' : '#8B5E3C', color: '#ffffff' }}
          
        >
          Members ({users.length})
        </button>
        <button
          className='btn-primary'
          onClick={() => setTab('posts')}
          style={{ background: tab === 'posts' ? 'var(--accent-dark)' : '#8B5E3C', color: '#ffffff' }}
        >
          All Posts ({posts.length})
        </button>
      </div>

      {/* ── Members tab ── */}
      {tab === 'users' && (
        <section className='card-warm' style={{ overflowX:'auto' }}>
          <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'16px' }}>Member Accounts</h3>
          {users.length === 0 && <p style={{ fontStyle:'italic' }}>No members registered yet.</p>}
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
                  <td style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    {u.profilePic && (
                      <img src={u.profilePic} alt=''
                        style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', margin:0 }} />
                    )}
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding:'3px 10px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:700,
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
                      style={{
                        padding:'5px 14px', fontSize:'0.8rem',
                        background: u.status === 'active' ? '#c0392b' : '#27ae60'
                      }}
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

      {/* ── Posts tab ── */}
      {tab === 'posts' && (
        <section className='card-warm' style={{ overflowX:'auto' }}>
          <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'16px' }}>All Posts</h3>
          {posts.length === 0 && <p style={{ fontStyle:'italic' }}>No posts yet.</p>}
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
                      padding:'3px 10px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:700,
                      background: p.status === 'published' ? '#27ae60' : '#c0392b',
                      color:'white'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === 'published' && (
                      <button
                        className='btn-primary'
                        onClick={() => removePost(p._id)}
                        style={{ padding:'5px 14px', fontSize:'0.8rem', background:'#c0392b' }}
                      >
                        Remove
                      </button>
                    )}
                    {p.status === 'removed' && (
                      <span style={{ fontSize:'0.8rem', fontStyle:'italic', color:'var(--text-secondary)' }}>
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
