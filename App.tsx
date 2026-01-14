
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { LifeSnippet, CyberStats } from './types';
import RadarChartDisplay from './components/RadarChartDisplay';
import EventCard from './components/EventCard';
import { Mic, Camera, Send, Loader2, Trash2, Terminal, RefreshCw, AlertTriangle, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [snippets, setSnippets] = useState<LifeSnippet[]>([]);
  const [stats, setStats] = useState<CyberStats>({ body: 10, intelligence: 10, reflexes: 10, technical: 10, cool: 10 });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Follow guidelines: Avoid dedicated UI for managing API_KEY. 
  // Simplified environment detection for Supabase status display only.
  const hasSupabase = !!(typeof process !== 'undefined' && process.env.SUPABASE_URL);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const loadedSnippets = await storageService.getSnippets();
      setSnippets(loadedSnippets);
      setStats(storageService.calculateTotalStats(loadedSnippets));
    } catch (err) {
      setError("Cloud sync failure.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm("CONFIRM DATA WIPE: ALL QUANTIFIED DATA WILL BE DELETED.")) {
      await storageService.clearData();
      refreshData();
    }
  };

  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || isProcessing) return;

    const content = textInput;
    setTextInput('');
    setIsProcessing(true);
    setError(null);

    try {
      const result = await geminiService.analyzeInput(`Analyze life update: "${content}"`);
      await saveNewSnippet({ ...result, type: 'text' });
    } catch (err) {
      setError("AI Analysis failed. Check connection.");
      setTextInput(content);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Mic access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await geminiService.analyzeInput("Analyze voice log.", { mimeType: 'audio/webm', data: base64Data });
        await saveNewSnippet({ ...result, type: 'voice' });
      };
    } catch (err) { setError("Neural error."); } finally { setIsProcessing(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Full = reader.result as string;
        const base64Data = base64Full.split(',')[1];
        const result = await geminiService.analyzeInput("Analyze image log.", { mimeType: file.type, data: base64Data });
        await saveNewSnippet({ ...result, type: 'image', mediaUrl: base64Full });
      };
    } catch (err) { setError("Visual error."); } finally { setIsProcessing(false); }
  };

  const saveNewSnippet = async (data: any) => {
    const newSnippet: LifeSnippet = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      eventName: data.eventName,
      statChanges: data.statChanges,
      comment: data.comment,
      type: data.type,
      mediaUrl: data.mediaUrl
    };
    await storageService.saveSnippet(newSnippet);
    await refreshData();
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-4 bg-[#050505] selection:bg-[#00f3ff] selection:text-black">
      <header className="mb-6 flex justify-between items-center border-b border-[#00f3ff]/30 pb-4">
        <div>
          <h1 className="font-cyber text-2xl font-black text-[#00f3ff] neon-text-green tracking-tighter">
            CYBER-LIFE <span className="text-[#39ff14]">QUANTIZER</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            System OS v2.2.0 // {hasSupabase ? 'Cloud-Sync Enabled' : 'Local Buffer Active'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshData} className={`p-2 text-[#00f3ff] hover:text-[#39ff14] transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={18} />
          </button>
          <button onClick={handleClear} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <section className="bg-[#111] p-4 neon-border rounded mb-6 flex flex-col items-center">
        <h2 className="font-cyber text-xs self-start mb-2 text-[#00f3ff] opacity-80 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00f3ff] animate-pulse"></span> Attribute Profile
        </h2>
        <RadarChartDisplay stats={stats} />
      </section>

      <div className="grid grid-cols-5 gap-2 mb-8">
        {(Object.entries(stats) as [keyof CyberStats, number][]).map(([key, val]) => (
          <div key={key} className="flex flex-col items-center p-2 border border-[#222] bg-[#111] rounded group relative">
            <span className="text-[8px] text-gray-500 uppercase font-bold">{key.slice(0, 3)}</span>
            <span className="text-sm font-cyber text-[#39ff14]">{val}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-48">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="font-cyber text-xs uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Terminal size={14} className="text-[#00f3ff]" /> System_Logs.bin
          </h2>
          <span className="text-[10px] text-gray-600 font-mono">PACKETS: {snippets.length}</span>
        </div>

        {snippets.length === 0 && !isRefreshing ? (
          <div className="text-center py-20 border-2 border-dashed border-[#222] rounded-lg">
            <p className="text-gray-600 font-mono text-sm uppercase">Neural grid online. Awaiting lifestyle packets...</p>
          </div>
        ) : (
          snippets.map((s) => <EventCard key={s.id} snippet={s} />)
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto space-y-4">
          <form onSubmit={handleTextSubmit} className="flex gap-2 items-center bg-black/90 p-2 rounded border border-[#00f3ff]/30 shadow-lg">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Inject experience packet..."
              className="flex-1 bg-transparent text-[#00f3ff] text-sm font-mono outline-none px-2"
              disabled={isProcessing}
            />
            <button type="submit" disabled={isProcessing || !textInput.trim()} className="p-2 text-[#00f3ff] hover:text-[#39ff14] transition-colors">
              <Send size={18} />
            </button>
          </form>

          <div className="flex justify-center gap-8 items-center pb-4">
            <button
              onMouseDown={startRecording} onMouseUp={stopRecording}
              onTouchStart={startRecording} onTouchEnd={stopRecording}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 neon-border bg-black/80 hover:bg-[#00f3ff]/10 glitch-hover ${
                isRecording ? 'bg-red-500/20 border-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''
              } ${isProcessing ? 'opacity-50' : ''}`}
            >
              {isProcessing ? <Loader2 className="text-[#00f3ff] animate-spin" size={28} /> : <Mic className={isRecording ? 'text-red-500' : 'text-[#00f3ff]'} size={28} />}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 neon-border bg-black/80 hover:bg-[#39ff14]/10 glitch-hover disabled:opacity-50"
            >
              <Camera className="text-[#39ff14]" size={28} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          
          <div className="h-4 flex justify-center items-center">
            {isProcessing && <p className="text-[10px] font-cyber text-[#00f3ff] animate-pulse uppercase tracking-[0.2em]">>> Quantizing Lifestyle Evidence...</p>}
            {isRecording && <p className="text-[10px] font-cyber text-red-500 animate-pulse uppercase tracking-[0.2em]">>> Capturing Voice Buffer...</p>}
            {error && <p className="text-[10px] font-cyber text-red-400 uppercase tracking-widest font-bold">!! SYSTEM ERROR: {error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
