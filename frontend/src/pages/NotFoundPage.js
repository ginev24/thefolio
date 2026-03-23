// src/pages/NotFoundPage.js
// 404 page — rendered by the catch-all <Route path='*'> in App.js.
// This prevents users from seeing a blank screen on unknown URLs.

import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <>
      <main className='container'>
        <div className='not-found'>
          <div style={{ fontSize: 64, marginBottom: '1rem' }}>♟️</div>
          <h2>404 — Page Not Found</h2>
          <p style={{ margin: '1rem 0', color: 'var(--accent)' }}>
            Looks like that move isn't on the board.
          </p>
          <Link to='/home' className='btn-primary' style={{ display: 'inline-block', marginTop: '1rem' }}>
            ← Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}

export default NotFoundPage;
