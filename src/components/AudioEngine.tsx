
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

interface AudioContextType {
  playSound: (name: 'success' | 'fail' | 'buzz' | 'click' | 'gong' | 'system_buzz') => void;
  playMusic: (stage: 'stage1' | 'stage2' | 'stage3' | 'intro' | 'victory' | 'defeat' | 'profile') => void;
  stopMusic: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  speak: (text: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// All sound effects are synthesized in real-time using the Web Audio API
// to ensure zero latency, 100% offline availability, and no CORS issues inside iframes.

const MUSIC = {
  intro: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Epic opening
  stage1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Instrumental peaceful
  stage2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Moderate tempo
  stage3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Epic orchestral
  victory: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Long fanfare
  defeat: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3', // Soft intro-like
  profile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Relaxed for profile setup
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const musicRef = useRef<Howl | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const duckMusic = () => {
    if (musicRef.current) {
      try {
        const currentVol = musicRef.current.volume() as number;
        musicRef.current.fade(currentVol, 0.02, 250);
      } catch (e) {
        console.warn("Duck failed", e);
      }
    }
  };

  const unduckMusic = () => {
    if (musicRef.current) {
      try {
        const currentVol = musicRef.current.volume() as number;
        musicRef.current.fade(currentVol, 0.2, 800);
      } catch (e) {
        console.warn("Unduck failed", e);
      }
    }
  };

  useEffect(() => {
    try {
      Howler.mute(isMuted);
    } catch (e) {
      console.warn("Howler.mute failed:", e);
    }
  }, [isMuted]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const originalCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);
      window.speechSynthesis.cancel = () => {
        try {
          originalCancel();
        } catch (e) {
          console.warn("Original cancel failed", e);
        }
        unduckMusic();
      };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);

  const playSound = (name: 'success' | 'fail' | 'buzz' | 'click' | 'gong' | 'system_buzz') => {
    if (isMuted) return;

    // Real-time Web Audio synths for high immersion and zero latency
    const playSynthGong = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const duration = 2.8;

        // Big, majestic bronze gong metallic overtones
        const partials = [82.4, 110.0, 143.2, 185.0, 246.9, 329.6, 440.0, 587.3];
        
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(320, now + duration * 0.45);

        masterGain.connect(filter);
        filter.connect(ctx.destination);

        // LFO for a natural metallic flutter/vibrato
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(5.8, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.12, now);
        lfo.connect(lfoGain);

        partials.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          if (idx === 0) {
            osc.type = 'sine';
          } else if (idx < 4) {
            osc.type = 'triangle';
          } else {
            osc.type = 'sawtooth';
          }

          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 0.985, now + duration);

          const baseGain = idx === 0 ? 0.45 : 0.28 / idx;
          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(baseGain, now + 0.02 + idx * 0.008);
          
          const decayTime = duration * (1.0 - (idx * 0.08));
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.1, decayTime));

          osc.connect(oscGain);
          
          if (idx > 0 && idx < 5) {
            lfoGain.connect(oscGain.gain);
          }

          oscGain.connect(masterGain);

          osc.start(now);
          osc.stop(now + duration + 0.1);
        });

        lfo.start(now);
        lfo.stop(now + duration);
      } catch (e) {
        console.error('Gong playback failed', e);
      }
    };

    const playSynthBuzz = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const duration = 0.55;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.12, now + 0.015);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + duration * 0.7);
        filter.Q.setValueAtTime(3.8, now);

        masterGain.connect(filter);
        filter.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(175, now);
        osc1.frequency.linearRampToValueAtTime(135, now + duration);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(178.5, now);
        osc2.frequency.linearRampToValueAtTime(137, now + duration);

        const sub = ctx.createOscillator();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(87.5, now);
        sub.frequency.linearRampToValueAtTime(67, now + duration);

        osc1.connect(masterGain);
        osc2.connect(masterGain);
        sub.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        sub.start(now);

        osc1.stop(now + duration);
        osc2.stop(now + duration);
        sub.stop(now + duration);
      } catch (e) {
        console.error('Buzzer playback failed', e);
      }
    };

    const playSynthSystemBuzz = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const duration = 0.75;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(580, now);
        filter.Q.setValueAtTime(3.5, now);

        masterGain.connect(filter);
        filter.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(115, now);
        osc1.frequency.linearRampToValueAtTime(105, now + duration);

        const osc2 = ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(115.8, now);
        osc2.frequency.linearRampToValueAtTime(105.5, now + duration);

        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(57.5, now);
        sub.frequency.linearRampToValueAtTime(52.5, now + duration);

        osc1.connect(masterGain);
        osc2.connect(masterGain);
        sub.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        sub.start(now);

        osc1.stop(now + duration);
        osc2.stop(now + duration);
        sub.stop(now + duration);
      } catch (e) {
        console.error('System buzzer playback failed', e);
      }
    };

    const playSynthSuccess = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright ascending chime)
        
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.75);
        });
      } catch (e) {
        console.warn('Success sound synth failed:', e);
      }
    };

    const playSynthFail = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const duration = 0.8;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(90, now + duration);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + duration);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration + 0.1);
      } catch (e) {
        console.warn('Fail sound synth failed:', e);
      }
    };

    const playSynthClick = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const duration = 0.05;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + duration);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration + 0.01);
      } catch (e) {
        console.warn('Click sound synth failed:', e);
      }
    };

    if (name === 'gong') {
      playSynthGong();
    } else if (name === 'buzz') {
      playSynthBuzz();
    } else if (name === 'system_buzz') {
      playSynthSystemBuzz();
    } else if (name === 'success') {
      playSynthSuccess();
    } else if (name === 'fail') {
      playSynthFail();
    } else if (name === 'click') {
      playSynthClick();
    }
  };

  const playMusic = (stage: keyof typeof MUSIC) => {
    stopMusic();

    try {
      const newMusic = new Howl({
        src: [MUSIC[stage]],
        html5: true,
        loop: stage !== 'victory' && stage !== 'defeat',
        volume: 0,
        onloaderror: (id, err) => {
          console.warn(`Failed to load music for stage ${stage}:`, err);
        },
        onplayerror: (id, err) => {
          console.warn(`Failed to play music for stage ${stage}:`, err);
          try {
            newMusic.unload();
          } catch (unloadErr) {
            // Ignore unloader errors
          }
        }
      });
      
      newMusic.play();
      newMusic.fade(0, 0.2, 2000);
      musicRef.current = newMusic;
    } catch (musicErr) {
      console.warn("Howl initialization failed:", musicErr);
    }
  };

  const stopMusic = () => {
    try {
      if (musicRef.current) {
        try {
          const vol = musicRef.current.volume() as number;
          musicRef.current.fade(vol, 0, 1000);
        } catch (fadeErr) {
          console.warn("Howl fade failed:", fadeErr);
        }
        const oldMusic = musicRef.current;
        setTimeout(() => {
          try {
            oldMusic.stop();
          } catch (stopErr) {
            console.warn("Howl stop inside setTimeout failed:", stopErr);
          }
        }, 1000);
        musicRef.current = null;
      }
    } catch (e) {
      console.warn("stopMusic failed:", e);
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("speechSynthesis.cancel failed:", e);
      }
    }
  };

  const speak = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;

    try {
      try {
        window.speechSynthesis.cancel();
      } catch (cancelErr) {
        console.warn("speechSynthesis.cancel before speaking failed:", cancelErr);
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      
      utterance.onstart = () => {
        duckMusic();
      };
      
      utterance.onend = () => {
        unduckMusic();
      };
      
      utterance.onerror = (event) => {
        console.warn("SpeechSynthesisUtterance async error event caught:", event);
        unduckMusic();
      };
      
      let voices: SpeechSynthesisVoice[] = [];
      try {
        voices = window.speechSynthesis.getVoices() || [];
      } catch (voicesErr) {
        console.warn("speechSynthesis.getVoices failed:", voicesErr);
      }
      const frenchVoices = voices.filter(v => v.lang.startsWith('fr') || v.lang.startsWith('FR'));
      
      // Look for known masculine voices in French
      const maleKeywords = ['paul', 'thomas', 'henri', 'claude', 'jean', 'nicolas', 'nils', 'mathieu', 'male', 'homme', 'boy', 'guy', 'gilles', 'remi', 'olivier'];
      let selectedVoice = frenchVoices.find(v => {
        const nameLower = v.name.toLowerCase();
        return maleKeywords.some(keyword => nameLower.includes(keyword));
      });
      
      if (!selectedVoice) {
        // Fallback to Microsoft Henri, Claude, or any fr-FR voices that might be natural
        selectedVoice = frenchVoices.find(v => v.lang === 'fr-FR') || frenchVoices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Setup a natural flow
      utterance.rate = 1.0;
      utterance.pitch = 0.88; // Lower the pitch slightly to enhance the masculine tone
      utterance.volume = 1.0;  // Fully audible above the background music
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (speakErr) {
        console.warn("speechSynthesis.speak failed:", speakErr);
      }
    } catch (e) {
      console.error('Text-to-speech error:', e);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nm = !prev;
      if (nm && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("speechSynthesis.cancel inside toggleMute failed:", e);
        }
      }
      return nm;
    });
  };

  return (
    <AudioContext.Provider value={{ playSound, playMusic, stopMusic, isMuted, toggleMute, speak }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
