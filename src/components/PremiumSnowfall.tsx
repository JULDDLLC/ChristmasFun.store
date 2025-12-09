import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  drift: number;
  variant: number;
}

const snowflakeVariants = [
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22M12 2L8 6M12 2L16 6M12 22L8 18M12 22L16 18M2 12L22 12M2 12L6 8M2 12L6 16M22 12L18 8M22 12L18 16M6.34 6.34L17.66 17.66M6.34 6.34L8.58 4.1M6.34 6.34L4.1 8.58M17.66 17.66L19.9 15.42M17.66 17.66L15.42 19.9M17.66 6.34L6.34 17.66M17.66 6.34L19.9 8.58M17.66 6.34L15.42 4.1M6.34 17.66L4.1 15.42M6.34 17.66L8.58 19.9"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,

  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22M6 6L18 18M18 6L6 18M3 12L21 12M7.76 4.93L16.24 19.07M16.24 4.93L7.76 19.07M4.93 7.76L19.07 16.24M19.07 7.76L4.93 16.24"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,

  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="5" r="1" fill="currentColor"/>
    <circle cx="12" cy="19" r="1" fill="currentColor"/>
    <circle cx="5" cy="12" r="1" fill="currentColor"/>
    <circle cx="19" cy="12" r="1" fill="currentColor"/>
    <circle cx="7.76" cy="7.76" r="0.8" fill="currentColor"/>
    <circle cx="16.24" cy="16.24" r="0.8" fill="currentColor"/>
    <circle cx="16.24" cy="7.76" r="0.8" fill="currentColor"/>
    <circle cx="7.76" cy="16.24" r="0.8" fill="currentColor"/>
    <path d="M12 5L12 19M5 12L19 12M7.76 7.76L16.24 16.24M16.24 7.76L7.76 16.24"
      stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
  </svg>,

  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L13 8L18 6L14 10L19 12L14 14L18 18L13 16L12 21L11 16L6 18L10 14L5 12L10 10L6 6L11 8L12 3Z"
      fill="currentColor" fillOpacity="0.8"/>
  </svg>,

  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
];

export const PremiumSnowfall = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = [];
    const sizes = [14, 20, 28, 36, 42];

    for (let i = 0; i < 45; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        duration: Math.random() * 7 + 8,
        delay: Math.random() * 5,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        opacity: Math.random() * 0.5 + 0.4,
        drift: (Math.random() - 0.5) * 100,
        variant: Math.floor(Math.random() * 5),
      });
    }

    setSnowflakes(flakes);
  }, []);

  return (
    <div className="premium-snowfall" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="premium-snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            '--drift': `${flake.drift}px`,
          } as React.CSSProperties}
        >
          <div className="snowflake-svg text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            {snowflakeVariants[flake.variant]}
          </div>
        </div>
      ))}
    </div>
  );
};
