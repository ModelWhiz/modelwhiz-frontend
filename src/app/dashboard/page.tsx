'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { updateModelMetrics } from '@/lib/apiClient';
import Navbar from '@/components/Navbar';
import MetricsChart from '@/components/MetricsChart';
import ModelCard from "@/components/ModelCard";

import { Box, Button, Grid, Heading } from '@chakra-ui/react';

type Metric = {
  model_id: number;
  accuracy: number;
  f1_score: number;
  auc: number;
  timestamp: string;
};

type Model = {
  id: number;
  name: string;
  version: string;
  filename: string;
  upload_time: string;
  metrics: Metric[];
  accuracy: number | null;
  f1_score: number | null;
  auc: number | null;
};

type MetricInput = {
  accuracy: string;
  f1_score: string;
  auc: string;
};

export default function DashboardPage() {
  const session = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [inputs, setInputs] = useState<Record<number, MetricInput>>({});
  const [showLatestOnly, setShowLatestOnly] = useState(false);


  const fetchModels = async () => {
    try {
      const response = await apiClient.get('/models/');
      setModels(response.data);

      const initialInputs: Record<number, MetricInput> = {};
      response.data.forEach((model: Model) => {
        initialInputs[model.id] = {
          accuracy: '',
          f1_score: '',
          auc: '',
        };
      });
      setInputs(initialInputs);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  useEffect(() => {
    if (!session) {
      router.push('/login');
    } else {
      fetchModels();
    }
  }, [session]);

  const handleInputChange = (modelId: number, field: keyof MetricInput, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (modelId: number) => {
    const { accuracy, f1_score, auc } = inputs[modelId];

    try {
      await updateModelMetrics(modelId, {
        accuracy: parseFloat(accuracy),
        f1_score: parseFloat(f1_score),
        auc: parseFloat(auc),
      });
      alert('✅ Metrics updated');
      await fetchModels();
    } catch {
      alert('❌ Failed to update metrics');
    }
  };
  const filteredModels = showLatestOnly
  ? Array.from(
      models.reduce((map, model) => {
        const current = map.get(model.name);
        const versionNum = parseInt(model.version.replace("v", "")) || 1;
        const currentVersion = current
          ? parseInt(current.version.replace("v", "")) || 1
          : 0;
        if (!current || versionNum > currentVersion) {
          map.set(model.name, model);
        }
        return map;
      }, new Map<string, Model>())
    ).map(([, value]) => value)
  : models;


  if (!session) return null;

  return (
  <>
    <Navbar />
    <Box p={6}>
      <Heading mb={6}>Your Uploaded Models</Heading>

      <Button
        onClick={() => setShowLatestOnly((prev) => !prev)}
        colorScheme="teal"
        mb={4}
      >
        {showLatestOnly ? "✅ Showing Latest Version Only" : "📦 Showing All Versions"}
      </Button>

      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        {filteredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            refreshModels={fetchModels}
          />
        ))}
      </Grid>
    </Box>
  </>
);
}
