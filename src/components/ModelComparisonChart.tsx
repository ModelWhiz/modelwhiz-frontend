// modelwhiz-frontend/src/components/ModelComparisonChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { Box } from '@chakra-ui/react';

type Model = {
  name: string;
  version: string;
  task_type: 'classification' | 'regression' | null;
  latest_metrics: { [key: string]: number } | null;
};

type Props = {
  modelA: Model;
  modelB: Model;
};

export default function ModelComparisonChart({ modelA, modelB }: Props) {
  const isRegression = modelA.task_type === 'regression';

  const metrics = isRegression 
    ? [{ key: 'rmse', label: 'RMSE' }, { key: 'r2_score', label: 'R² Score' }]
    : [{ key: 'accuracy', label: 'Accuracy' }, { key: 'f1_score', label: 'F1 Score' }, { key: 'auc', label: 'AUC' }];

  // --- vvv THIS IS THE FIX vvv ---
  // Use static keys (valueA, valueB) to prevent collisions.
  const data = metrics.map(({ key, label }) => ({
    metric: label,
    valueA: modelA.latest_metrics?.[key] ?? 0,
    valueB: modelB.latest_metrics?.[key] ?? 0,
  }));
  // --- ^^^ END OF FIX ^^^ ---

  return (
    <Box w="100%" h="350px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis domain={isRegression ? undefined : [0, 1]} />
          <Tooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(4) : val} />
          <Legend />
          {/* --- vvv USE STATIC dataKey AND DYNAMIC name FOR LEGEND vvv --- */}
          <Bar dataKey="valueA" name={`${modelA.name} v${modelA.version}`} fill="#3182ce" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="valueA" position="top" formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : ''} />
          </Bar>
          <Bar dataKey="valueB" name={`${modelB.name} v${modelB.version}`} fill="#38a169" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="valueB" position="top" formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : ''} />
          </Bar>
          {/* --- ^^^ END OF FIX ^^^ --- */}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}