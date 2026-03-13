'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Copy, Check, ArrowLeft, Volume2, Sparkles } from 'lucide-react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Ready to listen');
  const [copied, setCopied] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(12).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const STT_API = 'https://stt-api-rose.vercel.app/api/transcribe';

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const updateAudioLevels = (analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const levels = Array(12).fill(0).map((_, i) => {
      const start = i * (dataArray.length / 12);
      const end = start + (dataArray.length / 12);
      let sum = 0;
      for (let j = start; j < end; j++) sum += dataArray[j];
      return sum / (end - start) / 255;
    });
    setAudioLevels(levels);
    if (isRecording) {
      animationRef.current = requestAnimationFrame(() => updateAudioLevels(analyser));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        setStatus('Transcribing...');
        
        try {
          const response = await fetch(STT_API, {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          setTranscript(data.text || 'No speech detected');
          setStatus(data.text ? 'Transcription complete' : 'No speech detected');
        } catch (error: any) {
          setStatus('Error: ' + (error.message || 'Unknown error'));
        }
      };
      
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setStatus('Listening...');
      updateAudioLevels(analyser);
    } catch (error: any) {
      setStatus('Microphone error: ' + (error.message || 'Unknown error'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRecording(false);
    setAudioLevels(Array(12).fill(0));
  };

  const copyTranscript = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
      }} />

      <header className="relative z-10 flex items-center justify-between px-5 py-4" style={{
        background: 'rgba(15, 15, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <a href="https://orbit-max-app.vercel.app" className="flex items-center gap-2 text-sm transition-all hover:opacity-80" style={{ color: '#a5b4fc' }}>
          <ArrowLeft size={18} />
          <span>Home</span>
        </a>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
            <Volume2 size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold" style={{ 
            background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 50%, #6366f1 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Speech to Text
          </h1>
        </div>
        <div style={{ width: 60 }} />
      </header>
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center mb-4">
          <p className="text-sm font-medium" style={{ color: '#a5b4fc' }}>{status}</p>
        </div>

        <div className="relative">
          <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isRecording ? 'animate-ping' : ''}`} style={{ 
            background: 'rgba(139, 92, 246, 0.3)',
            animation: isRecording ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'
          }} />
          
          {isRecording && (
            <div className="absolute -inset-8 flex items-end justify-center gap-1 pb-4">
              {audioLevels.map((level, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(8, level * 40)}px`,
                    background: `linear-gradient(to top, #8b5cf6, #a78bfa)`,
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                  }}
                />
              ))}
            </div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ 
              background: isRecording 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
              boxShadow: isRecording 
                ? '0 0 60px rgba(239, 68, 68, 0.5), inset 0 2px 10px rgba(255,255,255,0.2)'
                : '0 10px 50px rgba(139, 92, 246, 0.5), inset 0 2px 10px rgba(255,255,255,0.2)',
            }}
          >
            <div className="p-4 rounded-full" style={{ 
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)'
            }}>
              {isRecording ? (
                <MicOff size={52} className="text-white" />
              ) : (
                <Mic size={52} className="text-white" />
              )}
            </div>
          </button>
        </div>

        <p className="text-center" style={{ color: '#71717a' }}>
          {isRecording ? 'Tap to stop recording' : 'Tap the microphone to start'}
        </p>
        
        <div className="w-full max-w-xl">
          <div className="p-6 rounded-3xl border overflow-hidden relative" style={{ 
            background: 'rgba(18, 18, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            minHeight: '160px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{
              background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)'
            }} />
            
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} style={{ color: '#8b5cf6' }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Transcript</p>
            </div>
            <p className="whitespace-pre-wrap text-lg leading-relaxed" style={{ color: '#ffffff' }}>
              {transcript || <span style={{ color: '#52525b' }}>Your speech will appear here...</span>}
            </p>
            {transcript && (
              <button
                onClick={copyTranscript}
                className="mt-4 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all hover:scale-105"
                style={{ 
                  color: copied ? '#22c55e' : '#a5b4fc', 
                  background: copied ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                  border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
