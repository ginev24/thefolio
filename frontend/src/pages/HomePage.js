// frontend/src/pages/HomePage.js — Phase 2: fetches posts from GET /api/posts
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const WHY_CHESS = [
  'Sharpen your mind and improve memory',
  'Builds resilience through tactical losses',
  'Mastering focus, patience, and discipline',
  'Connects players globally across languages',
  'Developing critical thinking and strategic planning',
];
const HomePage = () => {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    API.get('/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className='container'><p style={{ textAlign:'center', padding:'3rem', fontStyle:'italic' }}>Loading posts...</p></main>;

  return (
    <main className='container'>

    {/* ── Hero card ── */}
        <section className='card-hero' style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '14px' }}>
            Strategy. Patience. Victory.
          </h2>
          <p className='prose'>
            Welcome to my portfolio. Chess is more than a game; it is a mental
            battlefield where every move tells a story of logic and passion.
          </p>
          <br />

          <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
            Why Chess?
          </h3>
          <ul style={{ marginLeft: '1.4rem' }}>
          
            {WHY_CHESS.map((item, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
            ))}
          </ul>
        </section>

        {/* ── Journey preview ── */}
        <section className='card-warm' style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
            My Chess Journey
          </h3>
          <p>
            From learning basic moves in 2013 to joining local club tournaments
            in 2020, my journey has been one of constant growth.
          </p>
        
          <p style={{ marginTop: '10px' }}>
            <Link to='/about'>Read the full story →</Link>
          </p>
        </section>

        {/* ── Get involved ── */}
        <section className='card-warm'>
          <h3 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
            Get Involved
          </h3>
          <p>
            Whether you are a beginner or an expert, join our community and
            stay updated on local tournament news.
          </p>
          <p style={{ marginTop: '10px' }}>
            <Link to='/register'>Sign up for updates →</Link>
            {' '}or{' '}
            <Link to='/contact'>View Resources →</Link>
          </p>
        </section>

      <section style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'12px', marginBottom:'30px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <h2 style={{ fontFamily:"'Cinzel', serif", borderBottom:'3px solid var(--accent)', paddingBottom:'8px', margin:0 }}>Latest Chess Posts</h2>
          <p style={{ margin:0, color:'var(--text-color)', fontStyle:'italic' }}>Explore the latest community posts and chess insights.</p>
        </div>
        {user && ( <Link to='/create-post' className='btn-primary' style={{ textDecoration: 'none', background: '#8B5E3C', color: '#ffffff', }} > + Write a Post </Link> )}
      </section>

      {posts.length === 0 && (
        <div className='register-callout'>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', color:'var(--text-color)' }}>
            <p style={{ margin:'0 0 8px', fontSize:'0.9rem', letterSpacing:'1px', fontWeight:700 }}>♟️ New to Chess Unlocked?</p>
            <h3 style={{ margin:'0', fontFamily:"'Cinzel', serif", fontSize:'1.55rem' }}>Start your Chess Journey</h3>
            <p style={{ margin:'10px 0 0', color:'var(--text-color)', maxWidth:'560px' }}>
              No posts yet? Create your first strategy guide, tournament recap, or opening analysis. Join our community and share your best chess ideas.
            </p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <Link to='/register' className='btn-primary' style={{ margin:0 }}>Register</Link>
              <Link to='/login' className='btn-secondary' style={{ margin:0, background:'var(--card-bg)', color:'var(--text-color)', border:'1px solid var(--accent)' }}>Log In</Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'24px' }}>
        {posts.map(post => (
          <div key={post._id} className='card-warm' style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {post.image && (
              <img src={post.image} alt={post.title}
                style={{ width:'100%', height:180, objectFit:'cover', borderRadius:'8px', margin:0 }} />
            )}
            <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:'1rem' }}>
              <Link to={`/posts/${post._id}`} style={{ color:'var(--text-color)' }}>{post.title}</Link>
            </h3>
            <p style={{ color:'var(--text-color)', fontSize:'0.95rem', flexGrow:1 }}>
              {post.body.substring(0, 120)}{post.body.length > 120 ? '...' : ''}
            </p>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'var(--accent)' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                {post.author?.profilePic && (
                  <img src={post.author.profilePic}alt=''
                    style={{ width:24, height:24, borderRadius:'50%', objectFit:'cover', margin:0 }} />
                )}
                {post.author?.name}
              </span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <Link to={`/posts/${post._id}`} style={{ fontSize:'0.85rem', fontFamily:"'Cinzel', serif" }}>Read more →</Link>
          </div>
        ))}
      </div>
    </main>
  );
};
export default HomePage;
