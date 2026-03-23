import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EditPostPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [image,   setImage]   = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  // Pre-fill form with existing post data
  useEffect(() => {
    API.get(`/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setBody(res.data.body);
      })
      .catch(() => setError('Could not load post.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('body',  body);
    if (image) fd.append('image', image);

    try {
      await API.put(`/posts/${id}`, fd);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className='container'><p style={{ padding:'3rem', fontStyle:'italic' }}>Loading post...</p></main>;

  return (
    <main className='container'>
      <section className='card-warm' style={{ marginBottom:'20px' }}>
        <h2 style={{ fontFamily:"'Cinzel', serif" }}>Edit Post</h2>
      </section>

      <section className='card-form'>
        {error && <p className='error-msg' style={{ marginBottom:'12px' }}>{error}</p>}

        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='edit-title'>Title:</label>
            <input id='edit-title' type='text' className='form-input'
              value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className='form-field'>
            <label htmlFor='edit-body'>Content:</label>
            <textarea id='edit-body' className='form-input'
              rows={12} style={{ width:'100%' }}
              value={body} onChange={e => setBody(e.target.value)} required />
          </div>

          {/* Image replacement — admin only */}
          {user?.role === 'admin' && (
            <div className='form-field'>
              <label htmlFor='edit-image'>Replace Cover Image (Admin only):</label>
              <input id='edit-image' type='file' accept='image/*'
                onChange={e => setImage(e.target.files[0])}
                style={{ marginTop:6, fontFamily:"'Crimson Text', serif" }} />
            </div>
          )}

          <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
            <button className='btn-primary' onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className='btn-primary'
              style={{ background:'var(--accent-dark)' }}
              onClick={() => navigate(`/posts/${id}`)}
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EditPostPage;
