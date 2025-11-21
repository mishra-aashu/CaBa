import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './intro.css';

const Intro = ({ onComplete }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');

      if (redirectTo === 'login') {
        navigate('/login');
      } else {
        navigate('/');
      }

      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, onComplete]);

  return (
    <div className="bg-main">
      <div id="intro" className="intro-screen">
        <div className="app-icon floating">
          <div className="gloss-shine"></div>
          <div className="bubble-back"></div>
          <div className="bubble-front">
            <span className="icon-text">C</span>
          </div>
        </div>
        <h1 className="brand-name">CaBa</h1>
        <div className="mt-8 flex space-x-2 opacity-60">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default Intro;