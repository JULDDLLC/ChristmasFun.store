import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MUSIC_SRC = '/christmasmagic.mp3';
// Music starts gentle on load. Visitors can raise it with the slider.
const DEFAULT_VOLUME = 0.18;

export const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumePercent, setVolumePercent] = useState(Math.round(DEFAULT_VOLUME * 100));

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set the starting volume and try to start the music as the page opens.
  // Browsers may block sound before the first tap or click, so a one time
  // pointer handler below starts it on the first interaction instead.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = DEFAULT_VOLUME;

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay prevented, waiting for user interaction');
      }
    };

    void tryPlay();

    const handleFirstInteraction = async () => {
      if (!audio.paused) return;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Audio playback error on first interaction:', error);
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Audio playback error:', error);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (value: number) => {
    const audio = audioRef.current;
    setVolumePercent(value);
    if (!audio) return;

    audio.volume = value / 100;
    if (value > 0 && isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-xl border border-amber-400/30 px-3 py-2 shadow-lg">
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => console.error('Audio loading error:', e)}
      />

      {/* Play / pause button */}
      <button
        onClick={togglePlay}
        className="group relative p-1.5 rounded-full hover:bg-red-600/30 transition-all duration-300"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <div className="relative flex items-center">
          {isPlaying ? (
            <div className="flex items-center gap-0.5">
              <div
                className="w-0.5 h-3 bg-amber-300 rounded-full animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-0.5 h-4 bg-amber-300 rounded-full animate-pulse"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-0.5 h-2.5 bg-amber-300 rounded-full animate-pulse"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          ) : (
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-amber-300 border-b-[5px] border-b-transparent ml-0.5" />
          )}
        </div>
      </button>

      <span className="hidden sm:block text-xs font-medium tracking-wide text-amber-100/90">
        Music
      </span>

      {/* Volume adjuster */}
      <input
        type="range"
        min={0}
        max={100}
        value={isMuted ? 0 : volumePercent}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
        className="w-20 sm:w-28 accent-amber-300 cursor-pointer"
        aria-label="Music volume"
      />

      {/* Mute / unmute */}
      <button
        onClick={toggleMute}
        className="p-1.5 rounded-full hover:bg-red-600/30 transition-all duration-300"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-amber-300" />
        ) : (
          <Volume2 className="w-4 h-4 text-amber-300" />
        )}
      </button>
    </div>
  );
};
