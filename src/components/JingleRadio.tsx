import { useEffect, useRef, useState } from 'react';
import { SkipForward } from 'lucide-react';

const STATIONS = [
  { name: 'Jingle v2', src: '/radio/jingle-v2.mp3' },
  { name: 'Name Tag', src: '/radio/name-tag.mp3' },
  { name: 'Jingle v1', src: '/radio/jingle-v1.mp3' },
  { name: 'Tour Tag', src: '/radio/tour-tag.mp3' },
];

const BULB_COLORS = ['#ff5a4e', '#ffc93f', '#43d95f', '#3f8fff'];
const VOLUME_KEY = 'jingle-radio-volume';
const DEFAULT_VOLUME = 6;

type RadioStatus = 'blocked' | 'playing' | 'paused';

function Bulb({ color, lit }: { color: string; lit: boolean }) {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 12 16"
      aria-hidden="true"
      style={{
        filter: lit ? `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 1px ${color})` : 'none',
        transition: 'filter 500ms ease, opacity 500ms ease',
        opacity: lit ? 1 : 0.55,
      }}
    >
      <path
        d="M6 1 C6 1 10.5 6 10.5 9.5 A4.5 4.5 0 1 1 1.5 9.5 C1.5 6 6 1 6 1 Z"
        fill={lit ? color : '#233028'}
        stroke={lit ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)'}
        strokeWidth="0.6"
      />
      <rect x="3.6" y="13.4" width="4.8" height="2.2" rx="0.8" fill="#8a6d2f" />
    </svg>
  );
}

export const JingleRadio = () => {
  const [station, setStation] = useState(0);
  const [status, setStatus] = useState<RadioStatus>('blocked');
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = Number(sessionStorage.getItem(VOLUME_KEY));
    return Number.isFinite(saved) && saved >= 0 && saved <= 10 ? saved : DEFAULT_VOLUME;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stationRef = useRef(0);
  const dragRef = useRef<{ startY: number; startVolume: number } | null>(null);

  const playStation = async (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    stationRef.current = index;
    setStation(index);
    if (audio.getAttribute('src') !== STATIONS[index].src) {
      audio.src = STATIONS[index].src;
    }
    try {
      await audio.play();
      setStatus('playing');
    } catch {
      setStatus('blocked');
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 10;
    void playStation(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume / 10;
    sessionStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (status === 'playing') {
      audio.pause();
      setStatus('paused');
    } else {
      try {
        await audio.play();
        setStatus('playing');
      } catch {
        setStatus('blocked');
      }
    }
  };

  const handleNext = () => {
    if (status === 'blocked') {
      void playStation(stationRef.current);
      return;
    }
    void playStation((stationRef.current + 1) % STATIONS.length);
  };

  const handleDialTap = () => {
    if (status === 'blocked') void playStation(stationRef.current);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
  };

  const handleKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startVolume: volume };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY;
    const next = Math.min(10, Math.max(0, dragRef.current.startVolume + dy / 7));
    setVolume(Math.round(next * 2) / 2);
    if (next > 0 && muted) {
      const audio = audioRef.current;
      if (audio) audio.muted = false;
      setMuted(false);
    }
  };

  const handleKnobPointerUp = () => {
    dragRef.current = null;
  };

  const lit = status === 'playing';
  const dialTop =
    status === 'blocked'
      ? 'TAP TO TUNE IN'
      : status === 'paused'
        ? 'PAUSED'
        : muted
          ? 'MUTED'
          : `ON AIR ${station + 1}/${STATIONS.length}`;
  const dialName = status === 'blocked' ? STATIONS[0].name : STATIONS[station].name;
  const knobAngle = -135 + (volume / 10) * 270;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50"
      style={{
        background:
          'linear-gradient(180deg, #1e6b39 0%, #14532d 26%, #0e4020 62%, #082e16 100%)',
        borderTop: '2px solid #dc2626',
        boxShadow:
          '0 -8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -10px 18px rgba(0,0,0,0.45)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      role="region"
      aria-label="ChristmasFun jingle radio"
    >
      <style>{`
        @keyframes needleNudge {
          0%, 88%, 100% { transform: translateX(-50%) rotate(0deg); }
          90% { transform: translateX(-50%) rotate(-7deg); }
          94% { transform: translateX(-50%) rotate(6deg); }
          97% { transform: translateX(-50%) rotate(-3deg); }
        }
      `}</style>
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={() => void playStation((stationRef.current + 1) % STATIONS.length)}
      />
      <div className="mx-auto flex h-[84px] max-w-[680px] items-center gap-2 px-2 sm:gap-3 sm:px-4">
        <div
          className="grid shrink-0 grid-cols-4 gap-[2.5px] rounded-md px-1.5 py-1"
          style={{
            background: 'linear-gradient(180deg, #0a2c16, #061f0f)',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.12)',
          }}
          aria-hidden="true"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Bulb key={i} color={BULB_COLORS[i % BULB_COLORS.length]} lit={lit} />
          ))}
        </div>

        <button
          type="button"
          onClick={handleDialTap}
          className="min-w-0 flex-1 rounded-md px-3 py-1.5 text-left"
          style={{
            background:
              status === 'blocked'
                ? 'linear-gradient(180deg, #cdbd93, #b3a37e)'
                : 'linear-gradient(180deg, #fdf3cd, #f3df9f)',
            boxShadow:
              status === 'blocked'
                ? 'inset 0 1px 5px rgba(60,45,10,0.45)'
                : 'inset 0 0 14px rgba(255,190,60,0.55), inset 0 1px 3px rgba(60,45,10,0.35)',
            transition: 'background 500ms ease, box-shadow 500ms ease',
          }}
          aria-label={status === 'blocked' ? 'Tap to tune in' : `Now playing station ${station + 1} of ${STATIONS.length}: ${STATIONS[station].name}`}
        >
          <div
            className="truncate text-[13px] font-bold uppercase leading-tight tracking-[0.14em]"
            style={{ color: '#33270e', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {dialTop}
          </div>
          <div
            className="truncate text-[12px] leading-tight"
            style={{ color: '#4d3d17', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {dialName}
          </div>
          <div className="relative mt-1 h-[10px]" aria-hidden="true">
            <div className="absolute inset-x-0 top-[5px] h-px" style={{ background: 'rgba(51,39,14,0.5)' }} />
            {STATIONS.map((s, i) => (
              <div
                key={s.name}
                className="absolute top-[2px] h-[7px] w-px"
                style={{ left: `${(i / (STATIONS.length - 1)) * 100}%`, background: 'rgba(51,39,14,0.65)' }}
              />
            ))}
            <div
              className="absolute top-0 h-[10px] w-[2px]"
              style={{
                left: `${(station / (STATIONS.length - 1)) * 100}%`,
                transform: 'translateX(-50%)',
                background: '#b91c1c',
                boxShadow: '0 0 2px rgba(0,0,0,0.4)',
                transition: 'left 400ms ease',
                animation: status === 'blocked' ? 'needleNudge 7s ease-in-out 3' : 'none',
                transformOrigin: 'bottom center',
              }}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={status === 'playing' ? 'Pause the jingles' : 'Play the jingles'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
          style={{
            background: 'radial-gradient(circle at 32% 28%, #f87171, #dc2626 55%, #991b1b)',
            boxShadow:
              status === 'blocked'
                ? '0 0 0 2px #ffffff, 0 3px 8px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)'
                : '0 3px 8px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.35), inset 0 2px 3px rgba(255,255,255,0.35)',
          }}
        >
          {status === 'playing' ? (
            <span className="flex items-center gap-[3.5px]" aria-hidden="true">
              <span className="block h-[15px] w-[4.5px] rounded-sm bg-white" />
              <span className="block h-[15px] w-[4.5px] rounded-sm bg-white" />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="ml-[3px] block h-0 w-0 border-b-[8px] border-l-[13px] border-t-[8px] border-b-transparent border-l-white border-t-transparent"
            />
          )}
        </button>

        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <div
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={Math.round(volume)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setVolume((v) => Math.min(10, v + 1));
              if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setVolume((v) => Math.max(0, v - 1));
            }}
            onPointerDown={handleKnobPointerDown}
            onPointerMove={handleKnobPointerMove}
            onPointerUp={handleKnobPointerUp}
            className="relative h-11 w-11 cursor-ns-resize touch-none rounded-full outline-none focus:ring-2 focus:ring-amber-200"
            style={{
              background: 'radial-gradient(circle at 34% 28%, #f3d27a, #c9a227 52%, #7c5f14)',
              boxShadow: '0 3px 8px rgba(0,0,0,0.55), inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.5)',
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-[15px] w-[3px] rounded bg-[#3a2c05]"
              style={{ transform: `translate(-50%, -100%) rotate(${knobAngle}deg)`, transformOrigin: 'bottom center' }}
              aria-hidden="true"
            />
          </div>
          <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">Volume</span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1 rounded-md transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #175c2e, #0c3520)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.45), 0 2px 5px rgba(0,0,0,0.4)',
            border: '1px solid rgba(201,162,39,0.55)',
          }}
        >
          <span
            className="block h-2 w-2 rounded-full"
            style={{
              background: muted ? '#ffc93f' : '#3a4a3e',
              boxShadow: muted ? '0 0 6px #ffc93f, 0 0 2px #ffc93f' : 'inset 0 1px 2px rgba(0,0,0,0.6)',
              transition: 'background 300ms ease, box-shadow 300ms ease',
            }}
            aria-hidden="true"
          />
          <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">Mute</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next station"
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #175c2e, #0c3520)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.45), 0 2px 5px rgba(0,0,0,0.4)',
            border: '1px solid rgba(201,162,39,0.55)',
          }}
        >
          <SkipForward className="h-4 w-4 text-amber-100" aria-hidden="true" />
          <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">Next</span>
        </button>
      </div>
    </div>
  );
};
