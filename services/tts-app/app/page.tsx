'use client';

import { useState, useRef } from 'react';
import { Volume2, Play, Pause, Loader2, ArrowLeft, Waves, Sparkles, Download } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('af_sarah');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const TTS_API = 'https://tts-api-green.vercel.app/api/synthesize';
  const VOICES = [
    { value: 'af_sarah', label: 'Sarah', desc: 'Female' },
    { value: 'af_alloy', label: 'Alloy', desc: 'Female' },
    { value: 'af_echo', label: 'Echo', desc: 'Female' },
    { value: 'af_fable', label: 'Fable', desc: 'Female' },
    { value: 'af_onix', label: 'Onix', desc: 'Female' },
    { value: 'af_nova', label: 'Nova', desc: 'Female' },
    { value: 'af_shimmer', label: 'Shimmer', desc: 'Female' },
    { value: 'am_adam', label: 'Adam', desc: 'Male' },
    { value: 'am_michael', label: 'Michael', desc: 'Male' }
  ];

  const generateTTS = async () => {
    if (!text.trim()) {
      setStatus('Enter text first');
      return;
    }

    setIsLoading(true);
    setStatus('Generating...');
    
    try {
      const response = await fetch(TTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setStatus('Ready');
      
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch (error: any) {
      setStatus('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'orbit-tts.mp3';
      a.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(236, 72, 153, 0.15) 0%, transparent 60%)',
      }} />

      <header className="relative z-10 flex items-center justify-between px-5 py-4" style={{
        background: 'rgba(15, 15, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(236, 72, 153, 0.2)'
      }}>
        <a href="https://orbit-max-app.vercel.app" className="flex items-center gap-2 text-sm transition-all hover:opacity-80" style={{ color: '#f9a8d4' }}>
          <ArrowLeft size={18} />
          <span>Home</span>
        </a>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>
            <Waves size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold" style={{ 
            background: 'linear-gradient(135deg, #f9a8d4 0%, #c4b5fd 50%, #818cf8 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Text to Speech
          </h1>
        </div>
        <div style={{ width: 60 }} />
      </header>
      
      <main className="relative z-10 flex-1 flex flex-col items-center p-6 gap-6 max-w-lg mx-auto w-full">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: '#ec4899' }} />
            <label className="text-sm font-semibold" style={{ color: '#ec4899' }}>Enter text to speak</label>
          </div>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something magical..."
              className="w-full h-44 p-5 rounded-3xl border resize-none outline-none transition-all"
              style={{ 
                background: 'rgba(18, 18, 26, 0.8)', 
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(236, 72, 153, 0.2)', 
                color: '#ffffff',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            />
            <div className="absolute bottom-4 right-4 text-xs" style={{ color: '#52525b' }}>
              {text.length} characters
            </div>
          </div>
        </div>

        <div className="w-full">
          <label className="text-sm font-semibold mb-3 block" style={{ color: '#a5b4fc' }}>Select voice</label>
          <div className="grid grid-cols-3 gap-3">
            {VOICES.map(v => (
              <button
                key={v.value}
                onClick={() => setVoice(v.value)}
                className="py-4 px-3 rounded-2xl text-sm font-medium transition-all hover:scale-105"
                style={{ 
                  background: voice === v.value 
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    : 'rgba(18, 18, 26, 0.8)',
                  border: `1px solid ${voice === v.value ? 'transparent' : 'rgba(236, 72, 153, 0.2)'}`,
                  color: voice === v.value ? '#ffffff' : '#a5b4fc',
                  boxShadow: voice === v.value ? '0 10px 30px rgba(236, 72, 153, 0.3)' : 'none'
                }}
              >
                <div>{v.label}</div>
                <div className="text-xs opacity-70" style={{ color: voice === v.value ? '#ffffff' : '#71717a' }}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={generateTTS}
            disabled={isLoading || !text.trim()}
            className="flex-1 py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all font-semibold hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              background: isLoading || !text.trim() 
                ? 'rgba(139, 92, 246, 0.3)' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
              color: 'white',
              border: 'none',
              boxShadow: isLoading || !text.trim() ? 'none' : '0 10px 40px rgba(139, 92, 246, 0.4)'
            }}
          >
            {isLoading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Volume2 size={22} />
            )}
            Generate & Play
          </button>
          
          {audioUrl && !isLoading && (
            <>
              <button
                onClick={togglePlayback}
                className="py-5 px-5 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
                style={{ 
                  background: 'rgba(18, 18, 26, 0.8)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#ffffff'
                }}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button
                onClick={downloadAudio}
                className="py-5 px-5 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
                style={{ 
                  background: 'rgba(18, 18, 26, 0.8)', 
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#a5b4fc'
                }}
              >
                <Download size={22} />
              </button>
            </>
          )}
        </div>

        {audioUrl && (
          <div className="w-full p-5 rounded-3xl border flex items-center gap-4" style={{ 
            background: 'rgba(18, 18, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
              <Volume2 size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ background: isPlaying ? '#22c55e' : '#71717a' }} />
                <span style={{ color: '#ffffff' }}>{isPlaying ? 'Playing...' : 'Audio ready'}</span>
              </div>
              <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-300" 
                  style={{ 
                    width: isPlaying ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
