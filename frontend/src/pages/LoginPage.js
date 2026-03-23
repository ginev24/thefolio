import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirect based on role
      navigate(user.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container'>
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
