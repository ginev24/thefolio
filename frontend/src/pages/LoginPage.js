import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // o gamitin ang iyong authService

const ForgotPasswordModal = ({ onClose }) => {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStatus('success');
      setMessage('Reset link sent! Check your email inbox.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '1.5rem', width: '360px', maxWidth: '90%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Reset your password</h3>
          <button onClick={handleClose} style={{ border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {status === 'success' ? (
          <p style={{ color: '#2e7d32', background: '#e8f5e9', borderRadius: '8px', padding: '12px', fontSize: '0.9rem' }}>
            {message}
          </p>
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <div className='form-field'>
              <label htmlFor='reset-email'>Email Address:</label>
              <input
                id='reset-email'
                type='email'
                className='form-input'
                placeholder='your@email.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {status === 'error' && (
              <p className='error-msg' style={{ marginTop: '8px' }}>{message}</p>
            )}
            <button
              className='btn-primary'
              onClick={handleSubmit}
              disabled={status === 'loading' || !email}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container'>
      {showForgotPass && <ForgotPasswordModal onClose={() => setShowForgotPass(false)} />}

      <section className='card-form' style={{ maxWidth: 480, margin: '40px auto' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '20px' }}>
          Login to Chess Unlocked
        </h2>

        {error && <p className='error-msg' style={{ marginBottom: '12px' }}>{error}</p>}

        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='email'>Email Address:</label>
            <input
              id='email' type='email' className='form-input'
              placeholder='your@email.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='form-field'>
            <label htmlFor='password'>Password:</label>
            <input
              id='password' type='password' className='form-input'
              placeholder='Your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {/* Forgot Password link */}
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <button
                type='button'
                onClick={() => setShowForgotPass(true)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: '#1976d2', fontSize: '0.85rem',
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            className='btn-primary'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p style={{ marginTop: '16px', fontSize: '0.95rem' }}>
          Don't have an account?{' '}
          <Link to='/register'>Register here</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;