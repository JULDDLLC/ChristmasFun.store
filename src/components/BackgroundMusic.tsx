import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;

      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.log('Autoplay prevented, user interaction required');
        }
      };

      const timer = setTimeout(() => {
        playAudio();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.log('Audio playback error:', error);
        });
      }
      setIsPlaying(!isPlaying);
      setShowPrompt(false);
      sessionStorage.setItem('music-interacted', 'true');
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <audio
          ref={audioRef}
          src="/christmasmagic.mp3"
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => console.error('Audio loading error:', e)}
        />

        <button
          onClick={togglePlay}
          className="group relative p-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-amber-400/20 hover:bg-red-600/30 transition-all duration-300 shadow-md"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          <div className="relative flex items-center">
            {isPlaying ? (
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-3 bg-amber-300 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-0.5 h-4 bg-amber-300 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-0.5 h-2.5 bg-amber-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-amber-300 border-b-[5px] border-b-transparent ml-0.5" />
            )}
          </div>
        </button>

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
    </>
  );
};
