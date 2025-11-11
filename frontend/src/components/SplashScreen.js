import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0.5);

  useEffect(() => {
    // Animate logo
    setTimeout(() => setLogoScale(1), 100);

    // Hide splash after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete(), 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible && logoScale === 1) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-gradient-to-br from-[#C62828] via-[#8B0000] to-[#C62828] flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        {/* Logo avec animation */}
        <div
          className="mb-8 transition-all duration-700 ease-out"
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoScale
          }}
        >
          <img
            src="https://customer-assets.emergentagent.com/job_foodie-hub-21/artifacts/ybj62fs7_logo%20family%27s%20ok%20%21.png"
            alt="Family's"
            className="h-32 w-auto mx-auto"
            style={{
              mixBlendMode: 'multiply',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
            }}
          />
        </div>

        {/* Badge animé */}
        <div className="flex items-center justify-center space-x-2 bg-[#FFD54F] text-[#121212] px-6 py-3 rounded-full font-black text-sm shadow-2xl animate-pulse">
          <Award className="w-5 h-5" />
          <span>Family's Original Burger</span>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#FFD54F] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
