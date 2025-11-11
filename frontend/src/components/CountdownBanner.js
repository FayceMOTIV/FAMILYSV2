import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

const CountdownBanner = ({ endTime, message, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (isExpired) return null;

  return (
    <div className="bg-gradient-to-r from-[#C62828] via-[#8B0000] to-[#C62828] rounded-3xl p-4 shadow-xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 bg-[#FFD54F] rounded-full flex items-center justify-center animate-bounce">
            <Flame className="w-6 h-6 text-[#121212]" />
          </div>
          <div className="text-white flex-1">
            <p className="text-sm font-semibold opacity-90">Offre limitée</p>
            <p className="text-base font-black">{message}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
          <Clock className="w-5 h-5 text-[#FFD54F]" />
          <div className="flex items-center space-x-1 text-white font-black">
            <div className="text-center">
              <div className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</div>
            </div>
            <div className="text-xl">:</div>
            <div className="text-center">
              <div className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</div>
            </div>
            <div className="text-xl">:</div>
            <div className="text-center">
              <div className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownBanner;
