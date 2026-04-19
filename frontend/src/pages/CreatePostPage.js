import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CreatePostPage = () => {
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [images,  setImages]  = useState([]); // ← array na ngayon
  const [previews, setPreviews] = useState([]); // ← para sa preview
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    // Gawa ng preview URLs
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeImage = (index) => {
    const newImages   = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('body',  body);
    // I-append lahat ng images sa iisang field name na 'images'
    images.forEach(img => fd.append('images', img));

    try {
      const { data } = await API.post('/posts', fd);
      navigate(`/posts/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container'>
      <section className='card-warm' style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif" }}>Write a New Post</h2>
        <p>Share your chess knowledge, games, or thoughts with the community.</p>
      </section>

      <section className='card-form'>
        {error && <p className='error-msg' style={{ marginBottom: '12px' }}>{error}</p>}

        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='title'>Post Title:</label>
            <input id='title' type='text' className='form-input'
              placeholder='Give your post a title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='form-field'>
            <label htmlFor='body'>Post Content:</label>
            <textarea id='body' className='form-input'
              placeholder='Write your post here...'
              rows={12}
              style={{ width: '100%' }}
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            />
          </div>

          {/* ── Multiple Image Upload ── */}
          <div className='form-field'>
            <label htmlFor='images'>Images (Admin only):</label>
            <input
              id='images'
              type='file'
              accept='image/*'
              multiple
              onChange={handleImageChange}
              style={{ marginTop: 6, fontFamily: "'Crimson Text', serif" }}
            />
            <span className='info-msg'>JPG, PNG, GIF or WebP — max 5 MB each</span>

            {/* Previews */}
            {previews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`preview-${i}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                      }}
                    />
                    <button
                      type='button'
                      onClick={() => removeImage(i)}
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

          <button className='btn-primary' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </section>
    </main>
  );
};

export default CreatePostPage;