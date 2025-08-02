'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Box, useColorModeValue } from '@chakra-ui/react';

type Model = {
  name: string;
  accuracy: number | null;
  f1_score: number | null;
  auc: number | null;
};

type Props = {
  modelA: Model;
  modelB: Model;
};

export default function ModelComparisonChart({ modelA, modelB }: Props) {
  const bg = useColorModeValue('white', 'gray.700');

  const data = [
    {
      metric: 'Accuracy',
      [modelA.name]: Number(modelA.accuracy ?? 0),
      [modelB.name]: Number(modelB.accuracy ?? 0),
    },
    {
      metric: 'F1 Score',
      [modelA.name]: Number(modelA.f1_score ?? 0),
      [modelB.name]: Number(modelB.f1_score ?? 0),
    },
    {
      metric: 'AUC',
      [modelA.name]: Number(modelA.auc ?? 0),
      [modelB.name]: Number(modelB.auc ?? 0),
    },
  ];

  return (
    <Box w="100%" h="350px" p={4} bg={bg} borderRadius="md" shadow="sm" my={8}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis domain={[0, 1]} tickFormatter={(v) =>
            typeof v === 'number' ? v.toFixed(1) : v
          } />
          <Tooltip
            formatter={(val: any) =>
              typeof val === 'number' ? val.toFixed(3) : val
            }
          />
          <Legend />
          <Bar dataKey={modelA.name} fill="#3182ce" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey={modelA.name}
              position="top"
              formatter={(val: any) =>
                typeof val === 'number' ? val.toFixed(2) : val
              }
            />
          </Bar>
          <Bar dataKey={modelB.name} fill="#38a169" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey={modelB.name}
              position="top"
              formatter={(val: any) =>
                typeof val === 'number' ? val.toFixed(2) : val
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
