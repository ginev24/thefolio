import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [name,    setName]    = useState(user?.name  || '');
  const [bio,     setBio]     = useState(user?.bio   || '');
  const [pic,     setPic]     = useState(null);
  const [curPw,   setCurPw]   = useState('');
  const [newPw,   setNewPw]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' | 'error'

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); };

  // ── Update profile ────────────────────────────────────────────────────
  const handleProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    const fd = new FormData();
    fd.append('name', name);
    fd.append('bio',  bio);
    if (pic) fd.append('profilePic', pic);

    try {
      // Do NOT set Content-Type — Axios handles multipart/form-data automatically
      const { data } = await API.put('/auth/profile', fd);
      setUser(data); // update global auth state with new name/pic
      showMsg('Profile updated successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  // ── Change password ───────────────────────────────────────────────────
  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await API.put('/auth/change-password', {
        currentPassword: curPw,
        newPassword:     newPw,
      });
      showMsg('Password changed successfully!');
      setCurPw('');
      setNewPw('');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Password change failed.', 'error');
    }
  };

  // Profile picture src — falls back to a chess emoji placeholder
  const picSrc = user?.profilePic
    ? `http://localhost:5000/uploads/${user.profilePic}`
    : null;

  return (
    <main className='container'>

      <section className='card-warm' style={{ marginBottom: '30px', textAlign: 'center' }}>
        {picSrc
          ? <img src={picSrc} alt='Profile' style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', border:'3px solid var(--accent)' }} />
          : <div style={{ fontSize:64, marginBottom:8 }}>♟️</div>
        }
        <h2 style={{ fontFamily:"'Cinzel', serif" }}>{user?.name}</h2>
        {user?.bio && <p style={{ fontStyle:'italic', color:'var(--text-secondary)', marginTop:6 }}>{user.bio}</p>}
        <p style={{ fontSize:'0.85rem', color:'var(--accent)', marginTop:4 }}>Role: {user?.role}</p>
      </section>

      {msg && (
        <p className={msgType === 'error' ? 'error-msg' : ''}
           style={{ marginBottom:'16px', color: msgType === 'success' ? 'green' : undefined, fontWeight:600 }}>
          {msg}
        </p>
      )}

      {/* ── Edit Profile form ── */}
      <section className='card-form' style={{ marginBottom: '30px' }}>
        <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'16px' }}>Edit Profile</h3>
        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='prof-name'>Display Name:</label>
            <input id='prof-name' type='text' className='form-input'
              value={name} onChange={e => setName(e.target.value)} placeholder='Your name' />
          </div>
          <div className='form-field'>
            <label htmlFor='prof-bio'>Short Bio:</label>
            <textarea id='prof-bio' className='form-input' rows={3}
              value={bio} onChange={e => setBio(e.target.value)} placeholder='Tell us about yourself...' />
          </div>
          <div className='form-field'>
            <label htmlFor='prof-pic'>Change Profile Picture:</label>
            <input id='prof-pic' type='file' accept='image/*'
              onChange={e => setPic(e.target.files[0])}
              style={{ marginTop:6, fontFamily:"'Crimson Text', serif" }} />
            <span className='info-msg'>JPG, PNG, GIF or WebP — max 5 MB</span>
          </div>
          <button className='btn-primary' onClick={handleProfile}>Save Profile</button>
        </div>
      </section>

      {/* ── Change Password form ── */}
      <section className='card-form'>
        <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'16px' }}>Change Password</h3>
        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='cur-pw'>Current Password:</label>
            <input id='cur-pw' type='password' className='form-input'
              value={curPw} onChange={e => setCurPw(e.target.value)} placeholder='Enter current password' required />
          </div>
          <div className='form-field'>
            <label htmlFor='new-pw'>New Password:</label>
            <input id='new-pw' type='password' className='form-input'
              value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder='New password (min 6 chars)' required minLength={6} />
          </div>
          <button className='btn-primary' onClick={handlePassword}>Change Password</button>
        </div>
      </section>

    </main>
  );
};

export default ProfilePage;
