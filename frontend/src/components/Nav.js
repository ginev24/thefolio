import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../hello9.jpg';

const NAV_LINKS = [
  { path: '/home',     label: 'Home'     },
  { path: '/about',    label: 'About'    },
  { path: '/contact',  label: 'Contact'  },
  { path: '/register', label: 'Register' },
];

function Nav() {
  const location = useLocation();

  // Read saved theme from localStorage on first render
  const [theme, setTheme] = useState(
    () => localStorage.getItem('chessTheme') || 'light'
  );

  // Whenever theme changes, update the <html> attribute and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chessTheme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(current => (current === 'dark' ? 'light' : 'dark'));

  return (
    <header className='site-header'>
      <div className='header-banner'>
        {/* Logo portrait */}
        <img
          src={logo}
          alt='Chess Unlocked Logo'
          className='header-logo'
        />
        <h1>Chess Unlocked</h1>
        <p className='subtitle'>"Master the Board, Master Your Mind"</p>

        {/* Navigation — uses <Link> so routing never reloads the page */}
        <nav className='navbar'>
          <ul>
            {NAV_LINKS.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={location.pathname === link.path ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Floating theme toggle — fixed position defined in CSS */}
      <button
        className='theme-btn'
        onClick={toggleTheme}
        aria-label='Toggle theme'
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  );
}

export default Nav;
