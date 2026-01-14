
import { createClient } from '@supabase/supabase-js';
import { LifeSnippet, CyberStats } from '../types';

// Safe access to environment variables
const getEnv = (key: string) => {
  try {
    return typeof process !== 'undefined' ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || '';

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_KEY = 'cyber_life_snippets';

export const storageService = {
  saveSnippet: async (snippet: LifeSnippet) => {
    const localSnippets = storageService.getLocalSnippets();
    localSnippets.unshift(snippet);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(localSnippets));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('snippets')
          .insert([{
            id: snippet.id,
            event_name: snippet.eventName,
            stat_changes: snippet.statChanges,
            comment: snippet.comment,
            type: snippet.type,
            media_url: snippet.mediaUrl,
            created_at: new Date(snippet.timestamp).toISOString()
          }]);
        if (error) console.error("Supabase sync error:", error);
      } catch (e) {
        console.error("Cloud sync failed:", e);
      }
    }
  },

  getLocalSnippets: (): LifeSnippet[] => {
    try {
      const data = localStorage.getItem(LOCAL_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getSnippets: async (): Promise<LifeSnippet[]> => {
    if (!supabase) return storageService.getLocalSnippets();

    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cloudSnippets = data.map(item => ({
        id: item.id,
        eventName: item.event_name,
        timestamp: new Date(item.created_at).getTime(),
        statChanges: item.stat_changes,
        comment: item.comment,
        type: item.type,
        mediaUrl: item.media_url
      }));

      localStorage.setItem(LOCAL_KEY, JSON.stringify(cloudSnippets));
      return cloudSnippets;
    } catch (e) {
      return storageService.getLocalSnippets();
    }
  },

  calculateTotalStats: (snippets: LifeSnippet[]): CyberStats => {
    const baseStats: CyberStats = {
      body: 10,
      intelligence: 10,
      reflexes: 10,
      technical: 10,
      cool: 10
    };

    return snippets.reduce((acc, snippet) => {
      acc.body += (snippet.statChanges.body || 0);
      acc.intelligence += (snippet.statChanges.intelligence || 0);
      acc.reflexes += (snippet.statChanges.reflexes || 0);
      acc.technical += (snippet.statChanges.technical || 0);
      acc.cool += (snippet.statChanges.cool || 0);
      return acc;
    }, baseStats);
  },

  clearData: async () => {
    localStorage.removeItem(LOCAL_KEY);
    if (supabase) {
      await supabase.from('snippets').delete().neq('id', '0');
    }
  }
};
