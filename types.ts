
export interface CyberStats {
  body: number;        // 肉體
  intelligence: number; // 智力
  reflexes: number;     // 反應
  technical: number;    // 技術
  cool: number;         // 酷勁
}

export interface LifeSnippet {
  id: string;
  eventName: string;
  timestamp: number;
  statChanges: CyberStats;
  comment: string;
  type: 'voice' | 'image' | 'text';
  mediaUrl?: string;
}

export type StatKey = keyof CyberStats;

export const STAT_LABELS: Record<StatKey, string> = {
  body: '肉體',
  intelligence: '智力',
  reflexes: '反應',
  technical: '技術',
  cool: '酷勁'
};
