// frontend/src/pages/RegisterPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    level: '', terms: false,
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.terms) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container'>
      <section className='card-warm' style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif" }}>Sign Up for Chess Unlocked</h2>
        <p>Register to write posts, leave comments, and join our chess community.</p>
      </section>
      <section className='card-form' style={{ maxWidth: 520, margin: '0 auto' }}>
        {error && <p className='error-msg' style={{ marginBottom: '12px' }}>{error}</p>}
        <div className='form-inner' style={{ paddingLeft: 0 }}>
          <div className='form-field'>
            <label htmlFor='name'>Full Name:</label>
            <input id='name' name='name' type='text' className='form-input'
              placeholder='Enter your full name' value={form.name} onChange={handleChange} required />
          </div>
          <div className='form-field'>
            <label htmlFor='email'>Email Address:</label>
            <input id='email' name='email' type='email' className='form-input'
              placeholder='your@email.com' value={form.email} onChange={handleChange} required />
          </div>
          <div className='form-field'>
            <label htmlFor='password'>Password:</label>
            <input id='password' name='password' type='password' className='form-input'
              placeholder='Minimum 6 characters' value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {/* Skill level — radio buttons */}
          <div className='form-field'>
            <fieldset>
              <legend>Skill Level</legend>
              {['beginner', 'intermediate', 'expert'].map(level => (
                <label key={level} className='radio-option'>
                  <input
                    type='radio'
                    name='level'
                    value={level}
                    checked={form.level === level}
                    onChange={handleChange}
                  />
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </label>
              ))}
            </fieldset>
          </div>

          {/* Terms & Conditions */}
          <div className='form-field'>
            <label className='checkbox-option'>
              <input
                type='checkbox'
                name='terms'
                checked={form.terms}
                onChange={handleChange}
              />
              I agree to the Terms and Conditions
            </label>
          </div>

          <button className='btn-primary' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating account...' : 'Register Now'}
          </button>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.95rem' }}>
          Already have an account? <Link to='/login'>Login here</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;