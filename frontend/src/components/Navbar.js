import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../hello9.jpg';


function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [logoError, setLogoError] = useState(false);

  // Theme toggle — same logic as Phase 1 Nav.js
  const [theme, setTheme] = useState(
    () => localStorage.getItem('chessTheme') || 'light'
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chessTheme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className='site-header'>
      <div className='header-banner'>
        <div className='header-logo'>
          {!logoError ? (
            <img
              src={logo}
              alt='Chess board logo'
              onError={() => setLogoError(true)}
            />
          ) : (
           <span className='logo-fallback'>♟</span>
          )}
        </div>
        <h1>Chess Unlocked</h1>
        <p className='subtitle'>"Master the Board, Master Your Mind"</p>

        <nav className='navbar'>
          <ul>
            {/* ── Always visible ── */}
            <li><Link to='/home'    className={isActive('/home')}>Home</Link></li>
            <li><Link to='/about'   className={isActive('/about')}>About</Link></li>
            <li><Link to='/contact' className={isActive('/contact')}>Contact</Link></li>

            {/* ── Guest only: show Register + Login ── */}
            {!user && (
              <>
                <li><Link to='/register' className={isActive('/register')}>Register</Link></li>
                <li><Link to='/login'    className={isActive('/login')}>Login</Link></li>
              </>
            )}

            {/* ── Logged-in member or admin ── */}
            {user && (
              <>
                <li><Link to='/create-post' className={isActive('/create-post')}>Write</Link></li>
                <li><Link to='/profile'     className={isActive('/profile')}>Profile</Link></li>
                {user.role === 'admin' && (
                  <li><Link to='/admin' className={isActive('/admin')}>Admin</Link></li>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      fontFamily: "'Cinzel', serif",
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      padding: '11px 10px',
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Floating theme toggle */}
      <button className='theme-btn' onClick={toggleTheme} aria-label='Toggle theme'>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  );
}

export default Navbar;
