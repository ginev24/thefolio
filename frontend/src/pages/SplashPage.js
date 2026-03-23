import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SplashPage() {
  const [dots, setDots]   = useState('...');
  const navigate          = useNavigate();

  useEffect(() => {
    // Animate the "Loading..." dots
    const dotInterval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '.' : d + '.'));
    }, 500);

    // Redirect to the home page after 3 s
    const redirectTimer = setTimeout(() => {
      clearInterval(dotInterval);
      navigate('/home');
    }, 3000);

    // Cleanup both timers when the component unmounts
    return () => {
      clearInterval(dotInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className='splash-screen'>
      <img
        src='pics/hello9.jpg'
        alt='Chess Unlocked Logo'
        className='splash-logo'
      />
      <h1>Chess Unlocked</h1>
      <div className='spinner' />
      <p className='loading-text'>Loading{dots}</p>
    </div>
  );
}

export default SplashPage;
