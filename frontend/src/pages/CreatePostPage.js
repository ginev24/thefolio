import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const CreatePostPage = () => {
  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [image,   setImage]   = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { user }  = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('body',  body);
    if (image) fd.append('image', image);

    try {
      const { data } = await API.post('/posts', fd);
      navigate(`/posts/${data._id}`); // go to the new post immediately
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container'>
      <section className='card-warm' style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily:"'Cinzel', serif" }}>Write a New Post</h2>
        <p>Share your chess knowledge, games, or thoughts with the community.</p>
      </section>

      <section className='card-form'>
        {error && <p className='error-msg' style={{ marginBottom:'12px' }}>{error}</p>}

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
              style={{ width:'100%' }}
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            />
          </div>

          {/* Image upload — only shown to admins */}
          {user?.role === 'admin' && (
            <div className='form-field'>
              <label htmlFor='image'>Cover Image (Admin only):</label>
              <input id='image' type='file' accept='image/*'
                onChange={e => setImage(e.target.files[0])}
                style={{ marginTop:6, fontFamily:"'Crimson Text', serif" }} />
              <span className='info-msg'>JPG, PNG, GIF or WebP — max 5 MB</span>
            </div>
          )}

          <button className='btn-primary' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </section>
    </main>
  );
};

export default CreatePostPage;
