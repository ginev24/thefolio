// frontend/src/pages/RegisterPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    level: '', terms: false,
  });
  const [otp,           setOtp]           = useState('');
  const [otpSent,       setOtpSent]       = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpError,      setOtpError]      = useState('');
  const [sendingOtp,    setSendingOtp]    = useState(false);
  const [verifyingOtp,  setVerifyingOtp]  = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Kung nagbago ang email, i-reset ang verification
    if (name === 'email') {
      setOtpSent(false);
      setEmailVerified(false);
      setOtp('');
      setOtpError('');
    }
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!form.email) return setOtpError('Ilagay muna ang email.');
    setSendingOtp(true);
    setOtpError('');
    try {
      const { data } = await API.post('/auth/send-otp', { email: form.email });

      // Kung walang EMAIL config sa backend, auto-verified agad
      if (data.skipped) {
        setEmailVerified(true);
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Hindi mapadala ang OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp) return setOtpError('Ilagay ang verification code.');
    setVerifyingOtp(true);
    setOtpError('');
    try {
      await API.post('/auth/verify-otp', { email: form.email, otp });
      setEmailVerified(true);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Mali o expired ang code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailVerified) return setError('I-verify muna ang iyong email.');
    if (!form.terms)    return setError('You must agree to the Terms and Conditions.');

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

          {/* Full Name */}
          <div className='form-field'>
            <label htmlFor='name'>Full Name:</label>
            <input id='name' name='name' type='text' className='form-input'
              placeholder='Enter your full name' value={form.name}
              onChange={handleChange} required />
          </div>

          {/* Email + Send Code button */}
          <div className='form-field'>
            <label htmlFor='email'>Email Address:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input id='email' name='email' type='email' className='form-input'
                placeholder='your@email.com' value={form.email}
                onChange={handleChange} required
                disabled={emailVerified}
                style={{ flex: 1 }} />
              {!emailVerified && (
                <button type='button' className='btn-primary'
                  onClick={handleSendOtp} disabled={sendingOtp}
                  style={{ whiteSpace: 'nowrap', padding: '0 14px' }}>
                  {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send Code'}
                </button>
              )}
              {emailVerified && (
                <span style={{ color: 'green', alignSelf: 'center', fontWeight: 'bold' }}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* OTP input — lalabas lang kapag napadala na ang code */}
          {otpSent && !emailVerified && (
            <div className='form-field'>
              <label htmlFor='otp'>Verification Code:</label>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 8px' }}>
                Nagpadala kami ng 6-digit code sa <strong>{form.email}</strong>. Tingnan ang iyong inbox.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input id='otp' type='text' className='form-input'
                  placeholder='000000' maxLength={6} value={otp}
                  onChange={(e) => { setOtp(e.target.value); setOtpError(''); }}
                  style={{ flex: 1, letterSpacing: '4px', fontSize: '1.2rem' }} />
                <button type='button' className='btn-primary'
                  onClick={handleVerifyOtp} disabled={verifyingOtp}
                  style={{ whiteSpace: 'nowrap', padding: '0 14px' }}>
                  {verifyingOtp ? 'Checking...' : 'Verify'}
                </button>
              </div>
              {otpError && <p className='error-msg' style={{ marginTop: '6px' }}>{otpError}</p>}
            </div>
          )}

          {/* Password */}
          <div className='form-field'>
            <label htmlFor='password'>Password:</label>
            <input id='password' name='password' type='password' className='form-input'
              placeholder='Minimum 6 characters' value={form.password}
              onChange={handleChange} required minLength={6} />
          </div>

          {/* Skill Level */}
          <div className='form-field'>
            <fieldset>
              <legend>Skill Level</legend>
              {['beginner', 'intermediate', 'expert'].map(level => (
                <label key={level} className='radio-option'>
                  <input type='radio' name='level' value={level}
                    checked={form.level === level} onChange={handleChange} />
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </label>
              ))}
            </fieldset>
          </div>

          {/* Terms & Conditions */}
          <div className='form-field'>
            <label className='checkbox-option'>
              <input type='checkbox' name='terms'
                checked={form.terms} onChange={handleChange} />
              I agree to the Terms and Conditions
            </label>
          </div>

          <button className='btn-primary' onClick={handleSubmit}
            disabled={loading || !emailVerified}>
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