// modelwhiz-frontend/src/components/ModelRadarChart.tsx
'use client';

import { Box } from '@chakra-ui/react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

type Model = {
  name: string;
  version: string;
  task_type: 'classification' | 'regression' | null;
  latest_metrics: { [key: string]: number } | null;
};

type Props = {
  models: [Model, Model];
};

export default function ModelRadarChart({ models }: Props) {
  const [modelA, modelB] = models;
  const isRegression = modelA.task_type === 'regression';

  const subjects = isRegression 
    ? [{ key: 'rmse', label: 'RMSE' }, { key: 'r2_score', label: 'R² Score' }]
    : [{ key: 'accuracy', label: 'Accuracy' }, { key: 'f1_score', label: 'F1 Score' }, { key: 'auc', label: 'AUC' }];

  // --- vvv THIS IS THE FIX vvv ---
  // Use static keys (valueA, valueB) to prevent collisions.
  const data = subjects.map(({ key, label }) => ({
    subject: label,
    valueA: modelA.latest_metrics?.[key] ?? 0,
    valueB: modelB.latest_metrics?.[key] ?? 0,
  }));
  // --- ^^^ END OF FIX ^^^ ---

  return (
    <Box w="100%" h="350px">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={isRegression ? undefined : [0, 1]} />
          <Tooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(4) : val} />
          <Legend />
          {/* --- vvv USE STATIC dataKey AND DYNAMIC name FOR LEGEND vvv --- */}
          <Radar name={`${modelA.name} v${modelA.version}`} dataKey="valueA" stroke="#3182ce" fill="#3182ce" fillOpacity={0.6} />
          <Radar name={`${modelB.name} v${modelB.version}`} dataKey="valueB" stroke="#38a169" fill="#38a169" fillOpacity={0.6} />
          {/* --- ^^^ END OF FIX ^^^ --- */}
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}