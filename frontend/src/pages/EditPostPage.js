import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EditPostPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');
  const [images,   setImages]   = useState([]);   // ← bagong images na pipiliin
  const [previews, setPreviews] = useState([]);   // ← preview ng bagong images
  const [existing, setExisting] = useState([]);   // ← kasalukuyang images sa post
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setBody(res.data.body);
        setExisting(res.data.images || []); // ← ipakita ang existing images
      })
      .catch(() => setError('Could not load post.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('body',  body);
    // Kung may bagong images na pinili, ipapalit ang luma
    images.forEach(img => fd.append('images', img));

    try {
      await API.put(`/posts/${id}`, fd);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <main className='container'>
      <p style={{ padding: '3rem', fontStyle: 'italic' }}>Loading post...</p>
    </main>
  );

  return (
    <main className='container'>
      <section className='card-warm' style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif" }}>Edit Post</h2>
      </section>

      <section className='card-form'>
        {error && <p className='error-msg' style={{ marginBottom: '12px' }}>{error}</p>}

        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='edit-title'>Title:</label>
            <input id='edit-title' type='text' className='form-input'
              value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className='form-field'>
            <label htmlFor='edit-body'>Content:</label>
            <textarea id='edit-body' className='form-input'
              rows={12} style={{ width: '100%' }}
              value={body} onChange={e => setBody(e.target.value)} required />
          </div>

          {/* ── Image Section — Admin only ── */}
          {user?.role === 'admin' && (
            <div className='form-field'>
              <label>Replace Images (Admin only):</label>

              {/* Existing images */}
              {existing.length > 0 && (
                <div>
                  <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                    Kasalukuyang mga larawan:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    {existing.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`existing-${i}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          opacity: images.length > 0 ? 0.4 : 1, // dimmed kapag may bagong pinili
                        }}
                      />
                    ))}
                  </div>
                  {images.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '8px' }}>
                      ⚠️ Papalitan ang mga lumang larawan ng mga bagong pinili.
                    </p>
                  )}
                </div>
              )}

              {/* New image picker */}
              <input
                id='edit-images'
                type='file'
                accept='image/*'
                multiple
                onChange={handleImageChange}
                style={{ marginTop: 6, fontFamily: "'Crimson Text', serif" }}
              />

              {/* New image previews */}
              {previews.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {previews.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`new-preview-${i}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid #8B0000',
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => removeNewImage(i)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#8B0000',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          lineHeight: '20px',
                          textAlign: 'center',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className='btn-primary' onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className='btn-primary'
              style={{ background: 'var(--accent-dark)' }}
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