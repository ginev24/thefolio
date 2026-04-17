import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name,    setName]    = useState(user?.name  || '');
  const [bio,     setBio]     = useState(user?.bio   || '');
  const [pic,     setPic]     = useState(null);
  const [curPw,   setCurPw]   = useState('');
  const [newPw,   setNewPw]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' | 'error'

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

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
      const { data } = await API.put('/auth/profile', fd);
      setUser(data);
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

  // ── Delete account ────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showMsg('Please type DELETE to confirm.', 'error');
      return;
    }
    setDeleting(true);
    try {
      await API.delete('/auth/delete-account', {
        data: { password: deletePassword },
      });
      logout();
      navigate('/');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Account deletion failed.', 'error');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const picSrc = user?.profilePic ? `${user.profilePic}` : null;

  return (
    <main className='container'>

      {/* ── Profile card ── */}
      <section className='card-warm' style={{ marginBottom: '30px', textAlign: 'center' }}>
        {picSrc
          ? <img src={picSrc} alt='Profile' style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', margin:'0 auto 12px', border:'3px solid var(--accent)' }} />
          : <div style={{ fontSize:64, marginBottom:8 }}>♟️</div>
        }
        <h2 style={{ fontFamily:"'Cinzel', serif" }}>{user?.name}</h2>
        {user?.bio && <p style={{ fontStyle:'italic', color:'var(--text-secondary)', marginTop:6 }}>{user.bio}</p>}
        <p style={{ fontSize:'0.85rem', color:'var(--accent)', marginTop:4 }}>Role: {user?.role}</p>
      </section>

      {/* ── Status message ── */}
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
      <section className='card-form' style={{ marginBottom: '30px' }}>
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

      {/* ── Danger Zone ── */}
      <section className='card-form' style={{
        marginBottom: '30px',
        border: '1.5px solid #c0392b',
        borderRadius: '8px',
        backgroundColor: '#fff8f8',
      }}>
        <h3 style={{ fontFamily:"'Cinzel', serif", marginBottom:'8px', color:'#c0392b' }}>
          Danger Zone
        </h3>
        <p style={{ fontSize:'0.9rem', color:'#666', marginBottom:'16px' }}>
          Once you delete your account, all your data will be permanently removed and cannot be recovered.
        </p>
        <button
          onClick={() => { setShowDeleteModal(true); setMsg(''); }}
          style={{
            backgroundColor: '#c0392b',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.9rem',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          Delete My Account
        </button>
      </section>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            position: 'relative',
          }}>
            {/* Close button */}
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword(''); }}
              style={{
                position:'absolute', top:14, right:16,
                background:'none', border:'none',
                fontSize:'1.4rem', cursor:'pointer', color:'#888',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily:"'Cinzel', serif", color:'#c0392b', marginBottom:'12px' }}>
              Delete Account
            </h3>
            <p style={{ fontSize:'0.9rem', color:'#444', marginBottom:'20px', lineHeight:1.6 }}>
              This action is <strong>permanent</strong> and cannot be undone. All your posts, settings, and data will be deleted.
            </p>

            <div className='form-field' style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'0.85rem', color:'#555', display:'block', marginBottom:6 }}>
                Enter your password to confirm:
              </label>
              <input
                type='password'
                className='form-input'
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder='Your current password'
                style={{ width:'100%' }}
              />
            </div>

            <div className='form-field' style={{ marginBottom:'20px' }}>
              <label style={{ fontSize:'0.85rem', color:'#555', display:'block', marginBottom:6 }}>
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type='text'
                className='form-input'
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder='DELETE'
                style={{ width:'100%' }}
              />
            </div>

            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword(''); }}
                style={{
                  padding:'9px 20px', borderRadius:'6px',
                  border:'1px solid #ccc', background:'#f5f5f5',
                  cursor:'pointer', fontFamily:"'Crimson Text', serif", fontSize:'1rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE' || !deletePassword}
                style={{
                  padding:'9px 20px', borderRadius:'6px',
                  backgroundColor: (deleting || deleteConfirmText !== 'DELETE' || !deletePassword) ? '#e8a0a0' : '#c0392b',
                  color:'#fff', border:'none',
                  cursor: (deleting || deleteConfirmText !== 'DELETE' || !deletePassword) ? 'not-allowed' : 'pointer',
                  fontFamily:"'Cinzel', serif", fontSize:'0.9rem',
                  letterSpacing:'0.05em',
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default ProfilePage;