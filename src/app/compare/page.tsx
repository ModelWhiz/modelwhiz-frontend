// modelwhiz-frontend/src/app/compare/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, Select, SimpleGrid, VStack, Text, Spinner, Container, Card, CardBody, Badge, Icon, useColorModeValue, Progress, Divider, Button, Center, HStack } from '@chakra-ui/react';
import { FiBarChart2, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import apiClient from '@/lib/apiClient';
import ModelComparisonChart from '@/components/ModelComparisonChart';
import ModelRadarChart from '@/components/ModelRadarChart';
import Navbar from '@/components/Navbar'; // Import Navbar for a complete page

type Model = {
  id: number;
  name: string;
  version: string;
  upload_time: string;
  task_type: 'classification' | 'regression' | null;
  latest_metrics: { [key: string]: number } | null;
  metrics: any[];
};

export default function ComparePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelA, setModelA] = useState<Model | null>(null);
  const [modelB, setModelB] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTaskType, setActiveTaskType] = useState<'classification' | 'regression'>('classification');
  
  const bgGradient = useColorModeValue('linear(to-br, blue.50, purple.50)', 'linear(to-br, gray.900, purple.900)');
  const cardBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await apiClient.get('/models/');
        setModels(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchModels();
  }, []);

  const selectableModels = models.filter(m => m.task_type === activeTaskType);
  const isRegression = activeTaskType === 'regression';

  const resetComparison = () => { setModelA(null); setModelB(null); };

  const ModelDisplayCard = ({ model, label, color }: { model: Model | null; label: string; color: string }) => (
    <Card bg={cardBg} shadow="xl" borderRadius="2xl">
      <CardBody p={6}>
        {model ? (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}><Badge colorScheme={color}>{label}</Badge><Heading size="md">{model.name} v{model.version}</Heading></VStack>
              <Icon as={FiCheckCircle} color={`${color}.500`} />
            </HStack>
            <Divider />
            {isRegression ? (
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between"><Text>RMSE</Text><Text fontWeight="bold">{model.latest_metrics?.rmse?.toFixed(4)}</Text></HStack>
                <Progress value={(model.latest_metrics?.r2_score || 0) * 100} colorScheme="teal" size="sm" borderRadius="full" />
                <HStack justify="space-between"><Text>R² Score</Text><Text fontWeight="bold">{model.latest_metrics?.r2_score?.toFixed(4)}</Text></HStack>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between"><Text>Accuracy</Text><Text fontWeight="bold">{model.latest_metrics?.accuracy?.toFixed(3)}</Text></HStack>
                <Progress value={(model.latest_metrics?.accuracy || 0) * 100} colorScheme="purple" size="sm" borderRadius="full" />
                <HStack justify="space-between"><Text>F1 Score</Text><Text fontWeight="bold">{model.latest_metrics?.f1_score?.toFixed(3)}</Text></HStack>
                <HStack justify="space-between"><Text>AUC</Text><Text fontWeight="bold">{model.latest_metrics?.auc?.toFixed(3)}</Text></HStack>
              </VStack>
            )}
          </VStack>
        ) : (
          <Center h="150px"><Text color="gray.500">Select {label}</Text></Center>
        )}
      </CardBody>
    </Card>
  );

  const metricConfig = isRegression 
    ? [{ key: 'rmse', label: 'RMSE' }, { key: 'r2_score', label: 'R² Score' }]
    : [{ key: 'accuracy', label: 'Accuracy' }, { key: 'f1_score', label: 'F1 Score' }, { key: 'auc', label: 'AUC' }];

  return (
    <>
      <Navbar />
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW="7xl" py={12}>
          <VStack spacing={8} align="stretch">
            <Heading textAlign="center">Model Comparison Lab</Heading>
            {loading ? (<Center h="50vh"><Spinner size="xl" /></Center>) : (
              <>
                <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full">
                  <CardBody p={6}>
                    <HStack justify="space-between" mb={4}>
                      <HStack bg={useColorModeValue("gray.100", "gray.700")} p={1} borderRadius="lg" spacing={1}>
                        <Button onClick={() => { setActiveTaskType('classification'); resetComparison(); }} colorScheme={!isRegression ? 'purple' : 'gray'} variant={!isRegression ? 'solid' : 'ghost'}>Classification</Button>
                        <Button onClick={() => { setActiveTaskType('regression'); resetComparison(); }} colorScheme={isRegression ? 'purple' : 'gray'} variant={isRegression ? 'solid' : 'ghost'}>Regression</Button>
                      </HStack>
                      {(modelA || modelB) && <Button size="sm" variant="ghost" leftIcon={<FiRefreshCw />} onClick={resetComparison}>Reset</Button>}
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Select placeholder="Select Model A" value={modelA?.id || ''} onChange={(e) => setModelA(models.find(m => m.id === Number(e.target.value)) || null)}>
                        {selectableModels.map((m) => (<option key={m.id} value={m.id}>{m.name} - v{m.version}</option>))}
                      </Select>
                      <Select placeholder="Select Model B" value={modelB?.id || ''} onChange={(e) => setModelB(models.find(m => m.id === Number(e.target.value)) || null)}>
                        {selectableModels.map((m) => (<option key={m.id} value={m.id}>{m.name} - v{m.version}</option>))}
                      </Select>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
                  <ModelDisplayCard model={modelA} label="Model A" color="blue" />
                  <ModelDisplayCard model={modelB} label="Model B" color="green" />
                </SimpleGrid>

                {modelA && modelB && (
                  <VStack spacing={8} w="full">
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} w="full">
                      <Card bg={cardBg}><CardBody><Heading size="md" mb={4}>Performance Comparison</Heading><ModelComparisonChart modelA={modelA} modelB={modelB} /></CardBody></Card>
                      <Card bg={cardBg}><CardBody><Heading size="md" mb={4}>Radar Analysis</Heading><ModelRadarChart models={[modelA, modelB]} /></CardBody></Card>
                    </SimpleGrid>
                    <Card bg={cardBg} w="full"><CardBody>
                        <Heading size="lg" mb={6} textAlign="center">Detailed Performance Analysis</Heading>
                        <SimpleGrid columns={{ base: 1, md: metricConfig.length }} spacing={6}>
                          {metricConfig.map(({ key, label }) => {
                             const valA = modelA.latest_metrics?.[key] ?? 0;
                             const valB = modelB.latest_metrics?.[key] ?? 0;
                             return (
                              <Card key={key} bg={statBg} borderRadius="xl">
                                  <CardBody>
                                    <VStack spacing={3}>
                                      <Text fontWeight="bold">{label}</Text>
                                      <Divider />
                                      <HStack w="full" justify="space-between">
                                        <Text color="blue.400" fontSize="sm">Model A:</Text>
                                        <Badge colorScheme="blue">{valA.toFixed(4)}</Badge>
                                      </HStack>
                                      <HStack w="full" justify="space-between">
                                        <Text color="green.400" fontSize="sm">Model B:</Text>
                                        <Badge colorScheme="green">{valB.toFixed(4)}</Badge>
                                      </HStack>
                                    </VStack>
                                  </CardBody>
                              </Card>
                             )
                          })}
                        </SimpleGrid>
                    </CardBody></Card>
                  </VStack>
                )}
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}
