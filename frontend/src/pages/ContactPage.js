import { useState } from 'react';
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

// ─── Component ────────────────────────────────────────────────────────────
function ContactPage() {
  // Controlled form state — one object for all fields
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors,   setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Single change handler for all fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate just one field when the user leaves it (real-time feedback)
  const handleBlur = (fieldName) => {
    const fieldErrors = validateForm(formData);
    setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] || '' }));
  };

  const handleSubmit = () => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setSubmitted(true);
  };

  // ── Conditional rendering: success screen ────────────────────────────
  if (submitted) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>

      <main className='container'>

        {/* ── Contact form ── */}
        <section className='card-form' style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>
            Get in Touch
          </h2>
          <p style={{ marginBottom: '20px' }}>
            Have questions about chess strategies or want to join a match?
            Send me a message!
          </p>

          <div className='form-inner'>

            {/* Name */}
            <div className='form-field'>
              <label htmlFor='name'>Name:</label>
              <input
                id='name'
                name='name'
                type='text'
                className='form-input'
                placeholder='Enter your full name'
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
              />
              <span className='error-msg'>{errors.name || ''}</span>
            </div>

            {/* Email */}
            <div className='form-field'>
              <label htmlFor='email'>Email:</label>
              <input
                id='email'
                name='email'
                type='email'
                className='form-input'
                placeholder='email@example.com'
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
              />
              <span className='error-msg'>{errors.email || ''}</span>
            </div>

            {/* Message */}
            <div className='form-field'>
              <label htmlFor='message'>Message:</label>
              <textarea
                id='message'
                name='message'
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

        {/* ── Resources table — rendered with .map() ── */}
        <section className='card-warm' style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif" }}>
            <span style={{ fontFamily: "'Cinzel', serif" }}>C</span>hess Resources
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

    </>
  );
}

export default ContactPage;
