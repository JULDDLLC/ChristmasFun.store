import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MUSIC_SRC = '/christmasmagic.mp3';

export const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(
    () => sessionStorage.getItem('music-interacted') === 'true'
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set base volume and try an initial autoplay if the user already interacted
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.25;

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        // Autoplay blocked – we'll wait for user interaction handler
        console.log('Autoplay prevented, waiting for user interaction');
      }
    };

    if (hasInteracted) {
      void tryPlay();
    }

    // no cleanup needed here
  }, [hasInteracted]);

  // Attach a one-time global click/tap handler to start music on first interaction
  useEffect(() => {
    if (hasInteracted) return;

    const handleFirstInteraction = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        await audio.play();
        setIsPlaying(true);
        setHasInteracted(true);
        sessionStorage.setItem('music-interacted', 'true');
      } catch (error) {
        console.log('Audio playback error on first interaction:', error);
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, {
      once: true,
    });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, [hasInteracted]);

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
        if (!hasInteracted) {
          setHasInteracted(true);
          sessionStorage.setItem('music-interacted', 'true');
        }
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
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
        className="group relative p-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-amber-400/20 hover:bg-red-600/30 transition-all duration-300 shadow-md"
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

      {/* Mute / unmute */}
      <button
        onClick={toggleMute}
        className="p-2 rounded-full bg-white/5 backdrop-blur-xl border border-amber-400/20 hover:bg-red-600/30 transition-all duration-300 shadow-md"
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
