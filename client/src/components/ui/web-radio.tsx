import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Radio, Music } from "lucide-react";

export default function WebRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");
  const [djQueue, setDjQueue] = useState<string[]>([]);
  const [currentDjIndex, setCurrentDjIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: radioSettings } = useQuery({
    queryKey: ["/api/radio/settings"],
  });

  const { data: djUsers = [] } = useQuery({
    queryKey: ["/api/radio/dj-users"],
  });

  useEffect(() => {
    if (radioSettings?.djMode && djUsers.length > 0) {
      // Create shuffled DJ queue
      const soundcloudUrls = djUsers
        .filter(user => user.soundcloudUrl)
        .map(user => user.soundcloudUrl);
      
      const shuffled = [...soundcloudUrls].sort(() => Math.random() - 0.5);
      setDjQueue(shuffled);
    }
  }, [radioSettings, djUsers]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const audioUrl = radioSettings?.djMode && djQueue.length > 0 
        ? djQueue[currentDjIndex]
        : radioSettings?.radioUrl;
      
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skipToNextDj = () => {
    if (djQueue.length > 0) {
      const nextIndex = (currentDjIndex + 1) % djQueue.length;
      setCurrentDjIndex(nextIndex);
      
      if (audioRef.current && isPlaying) {
        audioRef.current.src = djQueue[nextIndex];
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const getCurrentDjName = () => {
    if (!radioSettings?.djMode || djQueue.length === 0) return null;
    
    const currentUrl = djQueue[currentDjIndex];
    const djUser = djUsers.find(user => user.soundcloudUrl === currentUrl);
    return djUser ? `${djUser.firstName} ${djUser.lastName}` : "Unknown DJ";
  };

  if (!radioSettings?.isActive) return null;

  return (
    <Card className="glow-border bg-cyber-gray/30 backdrop-blur-sm border-0 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-neon-cyan to-neon-pink rounded-full flex items-center justify-center">
              {radioSettings?.djMode ? (
                <Music className="text-cyber-dark text-2xl" />
              ) : (
                <Radio className="text-cyber-dark text-2xl" />
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-neon-cyan">
                {radioSettings?.djMode ? "DJ MODE AKTIV" : "AKUSTIK PRODUKT RADIO"}
              </h3>
              <div className="flex items-center space-x-2">
                {radioSettings?.djMode && getCurrentDjName() && (
                  <Badge className="bg-neon-pink text-cyber-dark">
                    Now Playing: {getCurrentDjName()}
                  </Badge>
                )}
                {isPlaying && (
                  <Badge className="bg-neon-cyan text-cyber-dark animate-pulse">
                    LIVE
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {radioSettings?.djMode && djQueue.length > 1 && (
              <Button
                onClick={skipToNextDj}
                className="cyber-button-outline hover-glow"
                disabled={!isPlaying}
              >
                NEXT DJ
              </Button>
            )}
            
            <Button
              onClick={toggleMute}
              className="cyber-button-outline hover-glow"
              disabled={!isPlaying}
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </Button>
            
            <Button
              onClick={togglePlay}
              className="cyber-button hover-glow"
            >
              {isPlaying ? <Pause /> : <Play />}
              {isPlaying ? "PAUSE" : "PLAY"}
            </Button>
          </div>
        </div>

        {radioSettings?.djMode && djUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-cyber-gray">
            <p className="text-sm text-gray-400 mb-2">Aktive DJs:</p>
            <div className="flex flex-wrap gap-2">
              {djUsers.map((dj, index) => (
                <Badge 
                  key={dj.id} 
                  variant="outline" 
                  className={`border-neon-cyan text-neon-cyan ${
                    djQueue[currentDjIndex] === dj.soundcloudUrl ? 'bg-neon-cyan/20' : ''
                  }`}
                >
                  {dj.firstName} {dj.lastName}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          onEnded={() => {
            if (radioSettings?.djMode && djQueue.length > 0) {
              skipToNextDj();
            } else {
              setIsPlaying(false);
            }
          }}
          onError={() => {
            setIsPlaying(false);
            console.error("Audio playback error");
          }}
        />
      </CardContent>
    </Card>
  );
}