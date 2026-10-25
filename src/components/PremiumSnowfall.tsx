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

const ARM_ANGLES = [0, 60, 120, 180, 240, 300];

// Detailed crystalline flakes modeled on the macro snowflakes in Julie's
// favorite Santa Letters pin: six arms, tiered branching, icy gradient.
const detailedFlakes = [
  // Stellar dendrite: three chevron tiers and a forked tip
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="icy-d1" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#e3f0ff" />
        <stop offset="100%" stopColor="#b9d9ff" />
      </linearGradient>
      <g id="arm-d1" stroke="url(#icy-d1)" strokeLinecap="round" fill="none">
        <path d="M50 50 L50 5" strokeWidth="3.4" />
        <path d="M50 36 L40.5 27.5 M50 36 L59.5 27.5" strokeWidth="2.6" />
        <path d="M50 26 L43 19 M50 26 L57 19" strokeWidth="2.4" />
        <path d="M50 17 L45 11.5 M50 17 L55 11.5" strokeWidth="2.1" />
        <path d="M50 8.5 L46.8 4.8 M50 8.5 L53.2 4.8" strokeWidth="1.8" />
      </g>
    </defs>
    {ARM_ANGLES.map((a) => (
      <use key={a} href="#arm-d1" transform={`rotate(${a} 50 50)`} />
    ))}
    <path
      d="M50 43.5 L55.6 46.8 L55.6 53.2 L50 56.5 L44.4 53.2 L44.4 46.8 Z"
      stroke="url(#icy-d1)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.14)"
    />
  </svg>,

  // Fern dendrite: fine side branches angled toward the tip, longest near the base
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="icy-d2" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="100" y2="0">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#e8f3ff" />
        <stop offset="100%" stopColor="#a8ccff" />
      </linearGradient>
      <g id="arm-d2" stroke="url(#icy-d2)" strokeLinecap="round" fill="none">
        <path d="M50 50 L50 4" strokeWidth="3" />
        <path d="M50 41 L39 31 M50 41 L61 31" strokeWidth="2.3" />
        <path d="M50 33.5 L41.5 24.5 M50 33.5 L58.5 24.5" strokeWidth="2.1" />
        <path d="M50 26.5 L43.5 18.5 M50 26.5 L56.5 18.5" strokeWidth="1.9" />
        <path d="M50 20 L45.2 13.2 M50 20 L54.8 13.2" strokeWidth="1.7" />
        <path d="M50 14 L46.6 8.4 M50 14 L53.4 8.4" strokeWidth="1.5" />
      </g>
    </defs>
    {ARM_ANGLES.map((a) => (
      <use key={a} href="#arm-d2" transform={`rotate(${a} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="3.4" stroke="url(#icy-d2)" strokeWidth="2" fill="rgba(255,255,255,0.18)" />
  </svg>,

  // Sectored plate: wide V branches, diamond accents, double hexagon core
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="icy-d3" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#dceeff" />
        <stop offset="100%" stopColor="#c2ddff" />
      </linearGradient>
      <g id="arm-d3" stroke="url(#icy-d3)" strokeLinecap="round" fill="none">
        <path d="M50 50 L50 7" strokeWidth="3.2" />
        <path d="M50 34 L38.5 24 M50 34 L61.5 24" strokeWidth="2.7" />
        <path d="M50 22.5 L42.5 15 M50 22.5 L57.5 15" strokeWidth="2.3" />
        <path d="M50 27.5 L47.6 30.8 L50 34 L52.4 30.8 Z" strokeWidth="1.4" fill="rgba(255,255,255,0.35)" />
        <path d="M50 12.5 L47.9 15.4 L50 18.3 L52.1 15.4 Z" strokeWidth="1.2" fill="rgba(255,255,255,0.3)" />
      </g>
    </defs>
    {ARM_ANGLES.map((a) => (
      <use key={a} href="#arm-d3" transform={`rotate(${a} 50 50)`} />
    ))}
    <path
      d="M50 41 L57.8 45.5 L57.8 54.5 L50 59 L42.2 54.5 L42.2 45.5 Z"
      stroke="url(#icy-d3)"
      strokeWidth="2.1"
      fill="none"
    />
    <path
      d="M50 45.2 L54.2 47.6 L54.2 52.4 L50 54.8 L45.8 52.4 L45.8 47.6 Z"
      stroke="url(#icy-d3)"
      strokeWidth="1.4"
      fill="rgba(255,255,255,0.12)"
    />
  </svg>,
];

// The simpler flakes already on the site, kept in the mix by Julie's request.
const simpleFlakes = [
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22M12 2L8 6M12 2L16 6M12 22L8 18M12 22L16 18M2 12L22 12M2 12L6 8M2 12L6 16M22 12L18 8M22 12L18 16M6.34 6.34L17.66 17.66M6.34 6.34L8.58 4.1M6.34 6.34L4.1 8.58M17.66 17.66L19.9 15.42M17.66 17.66L15.42 19.9M17.66 6.34L6.34 17.66M17.66 6.34L19.9 8.58M17.66 6.34L15.42 4.1M6.34 17.66L4.1 15.42M6.34 17.66L8.58 19.9"
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
    <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
];

const snowflakeVariants = [...simpleFlakes, ...detailedFlakes];
const DETAILED_START = simpleFlakes.length;

export const PremiumSnowfall = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = [];
    const simpleSizes = [12, 18, 26, 34];
    const detailedSizes = [30, 40, 50, 60];

    for (let i = 0; i < 45; i++) {
      const variant = Math.floor(Math.random() * snowflakeVariants.length);
      const detailed = variant >= DETAILED_START;
      const sizes = detailed ? detailedSizes : simpleSizes;
      const size = sizes[Math.floor(Math.random() * sizes.length)];

      flakes.push({
        id: i,
        left: Math.random() * 100,
        duration: Math.random() * 7 + 8 + size / 14,
        delay: Math.random() * 5,
        size,
        opacity: detailed
          ? Math.random() * 0.4 + 0.55
          : Math.random() * 0.5 + 0.35,
        drift: (Math.random() - 0.5) * 100,
        variant,
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
