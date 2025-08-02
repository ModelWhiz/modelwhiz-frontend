'use client';

import { Box, Heading } from '@chakra-ui/react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function ModelRadarChart({ models }: { models: any[] }) {
  const data = [
    {
      metric: 'Accuracy',
      [models[0].name]: models[0].accuracy ?? 0,
      [models[1].name]: models[1].accuracy ?? 0,
    },
    {
      metric: 'F1 Score',
      [models[0].name]: models[0].f1_score ?? 0,
      [models[1].name]: models[1].f1_score ?? 0,
    },
    {
      metric: 'AUC',
      [models[0].name]: models[0].auc ?? 0,
      [models[1].name]: models[1].auc ?? 0,
    },
  ];

  return (
    <Box w="100%" h="400px" mt={8}>
      <Heading size="md" mb={4}>🕸️ Radar Comparison</Heading>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, 1]} />
          <Radar
            name={models[0].name}
            dataKey={models[0].name}
            stroke="#3182ce"
            fill="#3182ce"
            fillOpacity={0.6}
          />
          <Radar
            name={models[1].name}
            dataKey={models[1].name}
            stroke="#38a169"
            fill="#38a169"
            fillOpacity={0.6}
          />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}
