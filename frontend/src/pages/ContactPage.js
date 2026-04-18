import { useState } from 'react';
import API from '../api/axios';
import resourcesData from '../data/resourcesData';

// ─── Validation helper ────────────────────────────────────────────────────
function validateForm(form) {
  const errors = {};
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  if (!nameRegex.test(form.name.trim()))
    errors.name = 'Please enter a valid name (letters only, at least 2 characters).';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim()))
    errors.email = 'Please enter a valid email address.';
  if (form.message.trim().length < 10)
    errors.message = 'Message must be at least 10 characters long.';
  return errors;
}

function ContactPage() {
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  const [formData,  setFormData]  = useState({ name: '', email: '', message: '' });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ── Check reply state ──
  const [checkEmail,   setCheckEmail]   = useState('');
  const [checkResults, setCheckResults] = useState(null);
  const [checkError,   setCheckError]   = useState('');
  const [checking,     setChecking]     = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (fieldName) => {
    const fieldErrors = validateForm(formData);
    setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] || '' }));
  };

  const handleSubmit = async () => {
    // ✅ Double-check: block admin even if they bypass the hidden form
    if (isAdmin) {
      alert('Admins are not allowed to send contact messages.');
      return;
    }

    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await API.post('/messages', formData);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to send message. Please try again.');
    }
  };

  const handleCheckReply = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkEmail.trim())) {
      setCheckError('Please enter a valid email address.');
      return;
    }
    setChecking(true);
    setCheckError('');
    setCheckResults(null);
    try {
      const { data } = await API.get(`/messages/reply/${encodeURIComponent(checkEmail.trim())}`);
      setCheckResults(data);
    } catch (err) {
      setCheckError(err.response?.data?.message || 'No messages found for this email.');
    } finally {
      setChecking(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <main className='container'>
        <div className='success-screen'>
          <div className='success-icon'>✉️</div>
          <h2>Message Sent!</h2>
          <p>Thank you! Your message has been received.</p>
          <button
            className='btn-primary'
            style={{ marginTop: '1.5rem' }}
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', message: '' });
              setErrors({});
            }}
          >
            Send Another Message
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className='container'>

      {/* ── Contact form — hidden for admin ── */}
      {!isAdmin ? (
        <section className='card-form' style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
            Get in Touch
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Have questions about chess strategies or want to join a match?
            Send me a message!
          </p>
          <div className='form-inner'>
            <div className='form-field'>
              <label htmlFor='name'>Name:</label>
              <input
                id='name' name='name' type='text'
                className='form-input'
                placeholder='Enter your full name'
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
              />
              <span className='error-msg'>{errors.name || ''}</span>
            </div>
            <div className='form-field'>
              <label htmlFor='email'>Email:</label>
              <input
                id='email' name='email' type='email'
                className='form-input'
                placeholder='email@example.com'
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
              />
              <span className='error-msg'>{errors.email || ''}</span>
            </div>
            <div className='form-field'>
              <label htmlFor='message'>Message:</label>
              <textarea
                id='message' name='message'
                className='form-input'
                rows={4}
                placeholder='Write your message here...'
                value={formData.message}
                onChange={handleChange}
                onBlur={() => handleBlur('message')}
              />
              <span className='error-msg'>{errors.message || ''}</span>
            </div>
            <button className='btn-primary' onClick={handleSubmit}>
              Send Message
            </button>
          </div>
        </section>
      ) : (
        <section className='card-warm' style={{ marginBottom: '40px', textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--accent)' }}>Restricted</h2>
          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            Admins cannot send contact messages.
          </p>
        </section>
      )}

      {/* ── Check Reply section — hidden for admin ── */}
      {!isAdmin && (
        <section className='card-form' style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
            Check Admin Reply
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Enter the email you used to send a message to check if the admin has replied.
          </p>
          <div className='form-inner'>
            <div className='form-field'>
              <label htmlFor='checkEmail'>Your Email:</label>
              <input
                id='checkEmail'
                type='email'
                className='form-input'
                placeholder='email@example.com'
                value={checkEmail}
                onChange={e => setCheckEmail(e.target.value)}
              />
              {checkError && <span className='error-msg'>{checkError}</span>}
            </div>
            <button
              className='btn-primary'
              onClick={handleCheckReply}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Check Reply'}
            </button>
          </div>

          {/* Results */}
          {checkResults && (
            <div style={{ marginTop: '24px' }}>
              {checkResults.map(m => (
                <div key={m._id} style={{
                  border: '1.5px solid var(--accent)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  background: 'var(--accent-light)'
                }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '6px' }}>
                    <strong>Sent:</strong> {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>Your message:</strong> {m.message}
                  </p>
                  {m.reply ? (
                    <div style={{
                      background: '#fff',
                      border: '1px solid var(--accent)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      marginTop: '8px'
                    }}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--accent)', marginBottom: '4px' }}>
                        <strong>Admin Reply</strong>
                        {m.repliedAt && ` · ${new Date(m.repliedAt).toLocaleDateString()}`}
                      </p>
                      <p>{m.reply}</p>
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--accent)' }}>
                      No reply yet. Please check back later.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Resources table ── */}
      <section className='card-warm' style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif" }}>
          Chess Resources
        </h2>
        <table className='resources-table'>
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {resourcesData.map(resource => (
              <tr key={resource.id}>
                <td>
                  <a href={resource.url} target='_blank' rel='noopener noreferrer'>
                    {resource.name}
                  </a>
                </td>
                <td>{resource.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Google Maps embed ── */}
      <section className='card-warm'>
        <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
          Find Our Local Club
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Visit us at our main headquarters for weekly over-the-board tournaments.
        </p>
        <div className='map-container'>
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61435.43825832746!2d120.36647905187762!3d16.05436630712217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339167e412555555%3A0x6b49e38f19978696!2sMangaldan%2C%20Pangasinan!5e0!3m2!1sen!2sph!4v1715800000000!5m2!1sen!2sph'
            className='map-iframe'
            allowFullScreen
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
            title='Local chess club location — Mangaldan, Pangasinan'
          />
        </div>
      </section>

    </main>
  );
}

export default ContactPage;