import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ResetPasswordPage = () => {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className='container'>
        <div className='success-screen'>
          <div className='success-icon'>🔐</div>
          <h2>Password Reset!</h2>
          <p>Your password has been updated. Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className='container'>
      <section className='card-form' style={{ maxWidth: 480, margin: '40px auto' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '20px' }}>
          Reset Your Password
        </h2>
        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='password'>New Password:</label>
            <input
              id='password'
              type='password'
              className='form-input'
              placeholder='Enter new password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className='form-field'>
            <label htmlFor='confirm'>Confirm Password:</label>
            <input
              id='confirm'
              type='password'
              className='form-input'
              placeholder='Confirm new password'
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>
          {error && <p className='error-msg'>{error}</p>}
          <button
            className='btn-primary'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;