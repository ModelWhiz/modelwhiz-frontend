'use client';

import {
  Box,
  Heading,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Spinner,
  Container,
  Card,
  CardBody,
  Badge,
  Icon,
  Flex,
  useColorModeValue,
  Progress,
  Divider,
  Button,
  Tooltip,
  Center,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiMinus,
  FiTarget,
  FiClock,
  FiZap,
  FiAward,
  FiRefreshCw,
  FiCheckCircle
} from 'react-icons/fi';
import apiClient from '@/lib/apiClient';
import ModelComparisonChart from '@/components/ModelComparisonChart';
import ModelRadarChart from '@/components/ModelRadarChart';
import { useToast } from '@chakra-ui/react';

type Model = {
  id: number;
  name: string;
  version: string;
  accuracy: number | null;
  f1_score: number | null;
  auc: number | null;
  upload_time: string;
};

export default function ComparePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [modelA, setModelA] = useState<Model | null>(null);
  const [modelB, setModelB] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Theme colors
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await apiClient.get('/models/');
        setModels(res.data);
      } catch (err) {
        console.error(err);
        toast({
            title: 'Failed to load models',
            description: 'Could not fetch model data. Please try again later.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });

      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const getById = (id: string): Model | null => models.find((m) => m.id === Number(id)) || null;

  const resetComparison = () => {
    setModelA(null);
    setModelB(null);
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.9) return 'green';
    if (value >= 0.8) return 'blue';
    if (value >= 0.7) return 'yellow';
    return 'red';
  };

  const formatMetricValue = (value: number | null): string => {
    return value ? (value * 100).toFixed(1) + '%' : 'N/A';
  };

  const getComparisonIcon = (delta: number) => {
    if (delta > 0.01) return FiTrendingUp;
    if (delta < -0.01) return FiTrendingDown;
    return FiMinus;
  };

  const getComparisonColor = (delta: number) => {
    if (delta > 0.01) return 'green.500';
    if (delta < -0.01) return 'red.500';
    return 'gray.500';
  };

  const ModelCard = ({ model, label, color }: { model: Model | null; label: string; color: string }) => (
    <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
      <Box bg={`${color}.500`} h={2} />
      <CardBody p={8}>
        {model ? (
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Badge colorScheme={color} variant="subtle" px={3} py={1} borderRadius="full">
                  {label}
                </Badge>
                <Heading size="lg" color={`${color}.500`}>
                  {model.name}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Version {model.version}
                </Text>
              </VStack>
              <Icon as={FiCheckCircle} w={6} h={6} color={`${color}.500`} />
            </HStack>

            <Divider />

            {/* Metrics */}
            <SimpleGrid columns={1} spacing={4}>
              {[
                { key: 'accuracy', label: 'Accuracy', icon: FiTarget },
                { key: 'f1_score', label: 'F1 Score', icon: FiZap },
                { key: 'auc', label: 'AUC', icon: FiAward },
              ].map(({ key, label, icon }) => {
                const value = model[key as keyof Model] as number | null;
                return (
                  <Box key={key} bg={statBg} p={4} borderRadius="xl">
                    <HStack justify="space-between" mb={2}>
                      <HStack>
                        <Icon as={icon} w={4} h={4} color={`${color}.500`} />
                        <Text fontWeight="semibold" fontSize="sm">
                          {label}
                        </Text>
                      </HStack>
                      <Badge 
                        colorScheme={value ? getMetricColor(value) : 'gray'} 
                        variant="subtle"
                      >
                        {formatMetricValue(value)}
                      </Badge>
                    </HStack>
                    <Progress
                      value={value ? value * 100 : 0}
                      colorScheme={value ? getMetricColor(value) : 'gray'}
                      borderRadius="full"
                      bg="gray.200"
                    />
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Upload Date */}
            <HStack color="gray.500" fontSize="sm">
              <Icon as={FiClock} w={4} h={4} />
              <Text>
                Uploaded {new Date(model.upload_time).toLocaleDateString()}
              </Text>
            </HStack>
          </VStack>
        ) : (
          <Center h="300px">
            <VStack spacing={4} color="gray.400">
              <Icon as={FiBarChart2} w={12} h={12} />
              <Text fontSize="lg" fontWeight="semibold">
                Select {label}
              </Text>
              <Text fontSize="sm" textAlign="center">
                Choose a model to start comparison
              </Text>
            </VStack>
          </Center>
        )}
      </CardBody>
    </Card>
  );

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={12}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Icon as={FiBarChart2} w={16} h={16} color={accentColor} mb={4} />
            <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Model Comparison Lab
            </Heading>
            <Text fontSize="lg" color="gray.500" mt={2}>
              Compare performance metrics and analyze your ML models side by side
            </Text>
          </Box>

          {loading ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Spinner size="xl" color={accentColor} thickness="4px" />
                <Text color="gray.500">Loading your models...</Text>
              </VStack>
            </Center>
          ) : (
            <>
              {/* Model Selection */}
              <Card bg={cardBg} shadow="lg" borderRadius="xl">
                <CardBody p={6}>
                  <HStack justify="space-between" mb={6}>
                    <Text fontWeight="bold" fontSize="lg">
                      Select Models to Compare
                    </Text>
                    {(modelA || modelB) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiRefreshCw />}
                        onClick={resetComparison}
                        colorScheme="gray"
                      >
                        Reset
                      </Button>
                    )}
                  </HStack>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <Text mb={2} fontWeight="semibold" color="blue.500">
                        Model A
                      </Text>
                      <Select
                        placeholder="Select first model"
                        onChange={(e) => setModelA(getById(e.target.value))}
                        value={modelA?.id || ''}
                        size="lg"
                        borderRadius="xl"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'blue.500' }}
                      >
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} - v{m.version}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    
                    <Box>
                      <Text mb={2} fontWeight="semibold" color="green.500">
                        Model B
                      </Text>
                      <Select
                        placeholder="Select second model"
                        onChange={(e) => setModelB(getById(e.target.value))}
                        value={modelB?.id || ''}
                        size="lg"
                        borderRadius="xl"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'green.500' }}
                      >
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} - v{m.version}
                          </option>
                        ))}
                      </Select>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Model Comparison Cards */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <ModelCard model={modelA} label="Model A" color="blue" />
                <ModelCard model={modelB} label="Model B" color="green" />
              </SimpleGrid>

              {/* Charts and Analysis */}
              {modelA && modelB && (
                <VStack spacing={8}>
                  {/* Charts */}
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} w="full">
                    <Card bg={cardBg} shadow="xl" borderRadius="2xl">
                      <CardBody p={6}>
                        <Heading size="md" mb={4} textAlign="center">
                          Performance Comparison
                        </Heading>
                        <Box 
                          h="400px" 
                          w="full" 
                          overflow="hidden"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="xl"
                          bg={statBg}
                          p={4}
                        >
                          <ModelComparisonChart modelA={modelA} modelB={modelB} />
                        </Box>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} shadow="xl" borderRadius="2xl">
                      <CardBody p={6}>
                        <Heading size="md" mb={4} textAlign="center">
                          Radar Analysis
                        </Heading>
                        <Box 
                          h="400px" 
                          w="full" 
                          overflow="hidden"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="xl"
                          bg={statBg}
                          p={4}
                        >
                          <ModelRadarChart models={[modelA, modelB]} />
                        </Box>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Detailed Metric Comparison */}
                  <Card bg={cardBg} shadow="xl" borderRadius="2xl" w="full">
                    <CardBody p={8}>
                      <Heading size="lg" mb={6} textAlign="center">
                        <Icon as={FiBarChart2} mr={3} />
                        Detailed Performance Analysis
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        {[
                          { key: 'accuracy', label: 'Accuracy', icon: FiTarget },
                          { key: 'f1_score', label: 'F1 Score', icon: FiZap },
                          { key: 'auc', label: 'AUC', icon: FiAward },
                        ].map(({ key, label, icon }) => {
                          const valA = Number(modelA[key as keyof Model]) || 0;
                          const valB = Number(modelB[key as keyof Model]) || 0;
                          const delta = valA - valB;
                          const absChange = Math.abs(delta);
                          const percentChange = valB !== 0 ? (absChange / valB) * 100 : 0;

                          const ComparisonIcon = getComparisonIcon(delta);
                          const comparisonColor = getComparisonColor(delta);

                          const winner = delta > 0.01 ? modelA.name : delta < -0.01 ? modelB.name : 'Tie';
                          const winnerColor = delta > 0.01 ? 'blue.500' : delta < -0.01 ? 'green.500' : 'gray.500';

                          return (
                            <Card key={key} bg={statBg} borderRadius="xl" overflow="hidden">
                              <CardBody p={6}>
                                <VStack spacing={4}>
                                  <HStack w="full" justify="space-between">
                                    <HStack>
                                      <Icon as={icon} w={5} h={5} color={accentColor} />
                                      <Text fontWeight="bold">{label}</Text>
                                    </HStack>
                                    <Icon as={ComparisonIcon} w={5} h={5} color={comparisonColor} />
                                  </HStack>

                                  <VStack spacing={2} w="full">
                                    <HStack w="full" justify="space-between">
                                      <Text fontSize="sm" color="blue.500">
                                        {modelA.name}:
                                      </Text>
                                      <Badge colorScheme="blue" variant="subtle">
                                        {formatMetricValue(valA)}
                                      </Badge>
                                    </HStack>
                                    
                                    <HStack w="full" justify="space-between">
                                      <Text fontSize="sm" color="green.500">
                                        {modelB.name}:
                                      </Text>
                                      <Badge colorScheme="green" variant="subtle">
                                        {formatMetricValue(valB)}
                                      </Badge>
                                    </HStack>
                                  </VStack>

                                  <Divider />

                                  <VStack spacing={1} w="full">
                                    <Text fontSize="sm" fontWeight="semibold" color={winnerColor}>
                                      🏆 Winner: {winner}
                                    </Text>
                                    {winner !== 'Tie' && (
                                      <Text fontSize="xs" color="gray.500">
                                        Better by {(absChange * 100).toFixed(2)}% ({percentChange.toFixed(1)}% improvement)
                                      </Text>
                                    )}
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </SimpleGrid>

                      {/* Overall Winner */}
                      <Box mt={8} p={6} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="xl" textAlign="center">
                        <Icon as={FiAward} w={8} h={8} color="blue.500" mb={3} />
                        <Heading size="md" color="blue.500" mb={2}>
                          Overall Performance Leader
                        </Heading>
                        <Text color="gray.600">
                          Based on average performance across all metrics
                        </Text>
                        {(() => {
                          const avgA = ((modelA.accuracy || 0) + (modelA.f1_score || 0) + (modelA.auc || 0)) / 3;
                          const avgB = ((modelB.accuracy || 0) + (modelB.f1_score || 0) + (modelB.auc || 0)) / 3;
                          const overallWinner = avgA > avgB ? modelA.name : avgB > avgA ? modelB.name : 'Tie';
                          const overallColor = avgA > avgB ? 'blue.500' : avgB > avgA ? 'green.500' : 'gray.500';
                          
                          return (
                            <Text fontSize="xl" fontWeight="bold" color={overallColor} mt={3}>
                              🎯 {overallWinner}
                            </Text>
                          );
                        })()}
                      </Box>
                    </CardBody>
                  </Card>
                </VStack>
              )}

              {/* Empty State */}
              {!modelA && !modelB && (
                <Card bg={cardBg} shadow="lg" borderRadius="xl">
                  <CardBody py={20}>
                    <Center>
                      <VStack spacing={4} color="gray.400">
                        <Icon as={FiBarChart2} w={20} h={20} />
                        <Heading size="lg">Ready to Compare?</Heading>
                        <Text textAlign="center" maxW="md">
                          Select two models above to start comparing their performance metrics, 
                          view detailed charts, and identify the best performing model.
                        </Text>
                      </VStack>
                    </Center>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}