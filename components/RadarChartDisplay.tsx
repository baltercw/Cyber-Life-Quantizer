
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { CyberStats, STAT_LABELS } from '../types';

interface Props {
  stats: CyberStats;
}

const RadarChartDisplay: React.FC<Props> = ({ stats }) => {
  const data = [
    { subject: STAT_LABELS.body, A: stats.body, fullMark: 100 },
    { subject: STAT_LABELS.intelligence, A: stats.intelligence, fullMark: 100 },
    { subject: STAT_LABELS.reflexes, A: stats.reflexes, fullMark: 100 },
    { subject: STAT_LABELS.technical, A: stats.technical, fullMark: 100 },
    { subject: STAT_LABELS.cool, A: stats.cool, fullMark: 100 },
  ];

  // We use the sum of stats as a key to force re-render/re-animation of the chart when data changes
  // Fix: Explicitly cast Object.values to number[] to resolve '+' operator type mismatch on unknown values
  const animationKey = (Object.values(stats) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="w-full h-64 md:h-80 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart key={animationKey} cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#00f3ff', fontSize: 12, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#39ff14"
            fill="#39ff14"
            fillOpacity={0.5}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartDisplay;
