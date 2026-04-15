import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import HeartButton from '../components/HeartButton';


const PostPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [post,        setPost]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [commentErr,  setCommentErr]  = useState('');

  // reply state
  const [replyingTo,   setReplyingTo]   = useState(null);   // comment._id being replied to
  const [replyBody,    setReplyBody]    = useState('');
  const [replyErr,     setReplyErr]     = useState('');
  const [visibleReplies, setVisibleReplies] = useState({}); // { [commentId]: bool }

  // Fetch post and its comments when the page loads
  useEffect(() => {
    Promise.all([
      API.get(`/posts/${id}`),
      API.get(`/comments/${id}`),
    ])
      .then(([postRes, commentRes]) => {
      const postData = postRes.data;
      if (!Array.isArray(postData.hearts)) postData.hearts = []; // ← dagdag
      setPost(postData);
      setComments(commentRes.data);
    })
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Add a new top-level comment
  const handleAddComment = async () => {
    if (!commentBody.trim()) { setCommentErr('Comment cannot be empty.'); return; }
    setCommentErr('');
    try {
      const { data } = await API.post(`/comments/${id}`, { body: commentBody });
      setComments(prev => [...prev, data]);
      setCommentBody('');
    } catch (err) {
      setCommentErr(err.response?.data?.message || 'Failed to post comment.');
    }
  };

  // Submit a reply to a comment
  const handleAddReply = async (commentId) => {
    if (!replyBody.trim()) { setReplyErr('Reply cannot be empty.'); return; }
    setReplyErr('');
    try {
      const { data } = await API.post(`/comments/${commentId}/replies`, { body: replyBody });
      // Merge the new reply into the matching comment's replies array
      setComments(prev =>
        prev.map(c =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), data] }
            : c
        )
      );
      setReplyBody('');
      setReplyingTo(null);
      // Auto-expand replies so the user sees their new reply
      setVisibleReplies(prev => ({ ...prev, [commentId]: true }));
    } catch (err) {
      setReplyErr(err.response?.data?.message || 'Failed to post reply.');
    }
  };

  // Delete a top-level comment
  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  // Delete a reply
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      await API.delete(`/comments/${commentId}/replies/${replyId}`);
      setComments(prev =>
        prev.map(c =>
          c._id === commentId
            ? { ...c, replies: (c.replies || []).filter(r => r._id !== replyId) }
            : c
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reply.');
    }
  };

  // Delete the whole post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const toggleReplies = (commentId) =>
    setVisibleReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));

  const openReplyBox = (commentId) => {
    setReplyingTo(commentId);
    setReplyBody('');
    setReplyErr('');
  };

  const cloudImg = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  const publicId = image.replace(/^uploads\//, '');
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};

  if (loading) return <main className='container'><p style={{ padding:'3rem', fontStyle:'italic' }}>Loading post...</p></main>;
  if (error)   return <main className='container'><p className='error-msg' style={{ padding:'2rem' }}>{error}</p></main>;

  const isOwner = user && post.author?._id === user._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <main className='container'>

      {/* ── Post content ── */}
      <article className='card-warm' style={{ marginBottom: '30px' }}>

        {post.image && (
          <img
            src={cloudImg(post.image)}
            alt={post.title}
            style={{ width:'100%', maxHeight:360, objectFit:'cover', borderRadius:'8px', margin:'0 0 20px' }}
          />
        )}

        <h2 style={{ fontFamily:"'Cinzel', serif", marginBottom:'10px' }}>{post.title}</h2>

        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', color:'var(--accent)', fontSize:'0.88rem' }}>
          {post.author?.profilePic && (
            <img src={cloudImg(post.author.profilePic)} alt=''
              style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', margin:0 }} />
          )}
          <span>By <strong>{post.author?.name}</strong></span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div style={{ whiteSpace:'pre-wrap', lineHeight:1.8 }}>{post.body}</div>
         

          {/* ── Heart reaction ── */}
{(isOwner || isAdmin) ? (
  <div style={{ display:'flex', gap:'12px', marginTop:'24px', alignItems:'center' }}>
    <HeartButton
      postId={post._id}
      initialHearts={Array.isArray(post.hearts) ? post.hearts.length : 0}
      initialLiked={Array.isArray(post.hearts) && post.hearts.some(h =>
        (h._id || h)?.toString() === user?._id
      )}
    />
    <Link
      to={`/edit-post/${post._id}`}
      className='btn-primary'
      style={{ textDecoration:'none', padding:'8px 20px' }}
    >
      Edit
    </Link>
    <button
      className='btn-primary'
      onClick={handleDeletePost}
      style={{ background:'#c0392b' }}
    >
      Delete
    </button>
  </div>
) : (
  <div style={{ marginTop:'24px' }}>
    <HeartButton
      postId={post._id}
      initialHearts={Array.isArray(post.hearts) ? post.hearts.length : 0}
      initialLiked={Array.isArray(post.hearts) && post.hearts.some(h =>
        (h._id || h)?.toString() === user?._id
      )}
    />
  </div>
)}
      </article>

      {/* ── Comments section ── */}
      <section className='card-warm'>
        <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'20px' }}>
          Comments ({comments.length})
        </h3>

        {comments.length === 0 && (
          <p style={{ fontStyle:'italic', color:'var(--text-secondary)', marginBottom:'16px' }}>
            No comments yet. Be the first!
          </p>
        )}

        {comments.map(comment => {
          const replies        = comment.replies || [];
          const repliesVisible = visibleReplies[comment._id];
          const isReplying     = replyingTo === comment._id;

          return (
            <div key={comment._id} style={{ borderBottom:'1px solid var(--accent-light)', paddingBottom:'14px', marginBottom:'14px' }}>

              {/* ── Comment header ── */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.88rem', color:'var(--accent)' }}>
                  {comment.author?.profilePic && (
                    <img src={cloudImg(comment.author.profilePic)} alt=''
                      style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover', margin:0 }} />
                  )}
                  <strong>{comment.author?.name}</strong>
                  <span>· {new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>

                {user && (user._id === comment.author?._id || user.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    style={{ background:'transparent', border:'none', color:'#c0392b', cursor:'pointer', fontSize:'0.8rem' }}
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* ── Comment body ── */}
              <p style={{ marginTop:'6px' }}>{comment.body}</p>

              {/* ── Action row: Reply + Show/Hide Replies ── */}
              <div style={{ display:'flex', gap:'14px', marginTop:'6px', fontSize:'0.82rem' }}>
                {user && (
                  <button
                    onClick={() => isReplying ? setReplyingTo(null) : openReplyBox(comment._id)}
                    style={{ background:'transparent', border:'none', color:'var(--accent)', cursor:'pointer', padding:0, fontWeight:600 }}
                  >
                    {isReplying ? 'Cancel' : '↩ Reply'}
                  </button>
                )}

                {replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(comment._id)}
                    style={{ background:'transparent', border:'none', color:'var(--accent)', cursor:'pointer', padding:0 }}
                  >
                    {repliesVisible
                      ? `▲ Hide replies (${replies.length})`
                      : `▼ Show replies (${replies.length})`}
                  </button>
                )}
              </div>

              {/* ── Inline reply box ── */}
              {isReplying && (
                <div style={{ marginTop:'10px', paddingLeft:'20px', borderLeft:'2px solid var(--accent-light)' }}>
                  <textarea
                    className='form-input'
                    rows={2}
                    style={{ width:'100%', marginTop:'4px' }}
                    placeholder={`Replying to ${comment.author?.name}…`}
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    autoFocus
                  />
                  {replyErr && <span className='error-msg'>{replyErr}</span>}
                  <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
                    <button className='btn-primary' onClick={() => handleAddReply(comment._id)} style={{ padding:'6px 16px' }}>
                      Post Reply
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      style={{ background:'transparent', border:'1px solid var(--accent-light)', borderRadius:'6px', padding:'6px 14px', cursor:'pointer', color:'var(--text-secondary)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ── Replies list ── */}
              {repliesVisible && replies.length > 0 && (
                <div style={{ marginTop:'12px', paddingLeft:'20px', borderLeft:'2px solid var(--accent-light)' }}>
                  {replies.map(reply => (
                    <div key={reply._id} style={{ marginBottom:'12px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', color:'var(--accent)' }}>
                          {reply.author?.profilePic && (
                            <img src={cloudImg(reply.author.profilePic)} alt=''
                              style={{ width:20, height:20, borderRadius:'50%', objectFit:'cover', margin:0 }} />
                          )}
                          <strong>{reply.author?.name}</strong>
                          <span>· {new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>

                        {user && (user._id === reply.author?._id || user.role === 'admin') && (
                          <button
                            onClick={() => handleDeleteReply(comment._id, reply._id)}
                            style={{ background:'transparent', border:'none', color:'#c0392b', cursor:'pointer', fontSize:'0.78rem' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p style={{ marginTop:'4px', fontSize:'0.9rem' }}>{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}

        {/* ── Add top-level comment ── */}
        {user ? (
          <div style={{ marginTop:'16px' }}>
            <label style={{ fontFamily:"'Cinzel', serif", fontSize:'0.85rem', fontWeight:700, display:'block', whiteSpace:'nowrap' }}>
  Leave a Comment:
</label>
            <textarea
              className='form-input'
              rows={3}
              style={{ width:'100%', marginTop:'8px' }}
              placeholder='Write your comment...'
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
            />
            {commentErr && <span className='error-msg'>{commentErr}</span>}
            <button className='btn-primary' onClick={handleAddComment} style={{ marginTop:'8px' }}>
              Post Comment
            </button>
          </div>
        ) : (
          <p style={{ marginTop:'16px', fontStyle:'italic' }}>
            <Link to='/login'>Login</Link> to leave a comment.
          </p>
        )}
      </section>

    </main>
  );
};

export default PostPage;