'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import MetricsChart from '@/components/MetricsChart';


type Metric = {
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

type Props = {
  model: Model;
  refreshModels: () => void;
};

export default function ModelCard({ model, refreshModels }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluation = async () => {
    if (!testFile) {
      toast({
        title: 'Please select a CSV file.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsEvaluating(true);

    try {
      const formData = new FormData();
      formData.append('test_file', testFile);

      await apiClient.post(`/models/${model.id}/evaluate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({
        title: '✅ Evaluation Complete',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      refreshModels(); // re-fetch updated metrics
    } catch (error: any) {
      console.error('Evaluation error:', error);
      toast({
        title: '❌ Evaluation failed',
        description: error?.response?.data?.message || 'Something went wrong.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Card>
      <CardHeader fontWeight="bold" display="flex" justifyContent="space-between" alignItems="center">
        <Text>{model.name}</Text>
        <Text fontSize="sm" bg="purple.100" color="purple.800" px={2} py={0.5} borderRadius="md">
          {model.version}
        </Text>
      </CardHeader>

      <CardBody>
        <Text>Uploaded on: {new Date(model.upload_time).toLocaleDateString()}</Text>
        <Text>Accuracy : {model.accuracy ?? model.metrics?.[0]?.accuracy ?? 'N/A'}</Text>
        <Text>F1 Score: {model.f1_score ?? model.metrics?.[0]?.f1_score ?? 'N/A'}</Text>
        <Text>AUC: {model.auc ?? model.metrics?.[0]?.auc ?? 'N/A'}</Text>

        <VStack spacing={3} mt={4}>
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => setTestFile(e.target.files?.[0] || null)}
          />
          <Button
            colorScheme="purple"
            isLoading={isEvaluating}
            onClick={handleEvaluation}
          >
            📁 Upload & Evaluate
          </Button>

        <MetricsChart metrics={model.metrics} />  {/* 👈 this is what you add */}


          <Button
            colorScheme="teal"
            onClick={() => router.push(`/dashboard/${model.id}`)}
          >
            View Model Details
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
