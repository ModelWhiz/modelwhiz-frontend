// modelwhiz-frontend/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import Navbar from '@/components/Navbar';
import ModelCard from "@/components/ModelCard"; 

import {
  Box, Button, Grid, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Divider, HStack, Icon, Container, Text, VStack, Badge, Flex,
  Skeleton, useBreakpointValue, useColorModeValue,
} from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown, FaRocket, FaHistory } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionTr = motion(Tr);

type Model = {
  id: number;
  name: string;
  version: string;
  filename: string;
  upload_time: string;
  task_type: 'classification' | 'regression' | null;
  latest_metrics: { [key: string]: number } | null;
  metrics: any[];
};

export default function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTaskType, setActiveTaskType] = useState<'classification' | 'regression'>('classification');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const headingSize = useBreakpointValue({ base: '2xl', md: '3xl' });
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });

  const fetchModels = async () => {
    if (!auth?.user_id) { setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/models/?user_id=${auth.user_id}`);
      setModels(res.data);
    } catch (err) {
      console.error('Error fetching models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth) { fetchModels(); }
  }, [auth, auth?.user_id]);

  const taskFilteredModels = models.filter(m => m.task_type === activeTaskType);

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const sortedModels = [...taskFilteredModels].sort((a, b) => {
    if (!sortField) return 0;
    const valA = sortField === 'upload_time' ? new Date(a.upload_time).getTime() : a.latest_metrics?.[sortField] ?? -Infinity;
    const valB = sortField === 'upload_time' ? new Date(b.upload_time).getTime() : b.latest_metrics?.[sortField] ?? -Infinity;
    return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
        <Container maxW="container.xl" p={containerPadding}>
          <VStack spacing={8}>
            <Heading size={headingSize}>ML Model Dashboard</Heading>
            
            <HStack bg={useColorModeValue("gray.100", "gray.700")} p={1} borderRadius="xl" spacing={1}>
              <Button onClick={() => setActiveTaskType('classification')} colorScheme={activeTaskType === 'classification' ? 'purple' : 'gray'} variant={activeTaskType === 'classification' ? 'solid' : 'ghost'}>Classification Models</Button>
              <Button onClick={() => setActiveTaskType('regression')} colorScheme={activeTaskType === 'regression' ? 'purple' : 'gray'} variant={activeTaskType === 'regression' ? 'solid' : 'ghost'}>Regression Models</Button>
            </HStack>
            
            {models.length > 0 && (
              <HStack spacing={4}>
                  <Button onClick={() => setShowLeaderboard(p => !p)} colorScheme="orange" variant={showLeaderboard ? "solid" : "outline"}>{showLeaderboard ? "Cards View" : "Leaderboard View"}</Button>
                  <Button onClick={() => router.push('/compare')} colorScheme="purple">Compare Models</Button>
                  <Button onClick={() => router.push('/dashboard/evaluations')} colorScheme="blue" leftIcon={<FaHistory />}>View History</Button>
              </HStack>
            )}

            <Divider />

            {isLoading ? ( <Skeleton height="200px" w="full" borderRadius="md" /> ) : (
              <>
                {taskFilteredModels.length === 0 ? (
                  <VStack spacing={4} py={20} textAlign="center">
                    <Icon as={FaRocket} boxSize="50px" color="purple.500" />
                    <Heading size="lg">No {activeTaskType} models found.</Heading>
                    <Text>Upload a new model to get started, or switch model types.</Text>
                    <Button colorScheme="purple" size="lg" mt={4} onClick={() => router.push('/upload')}>Upload a Model</Button>
                  </VStack>
                ) : (
                  <AnimatePresence mode="wait">
                    {showLeaderboard ? (
                      <MotionBox key="leaderboard" width="100%">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Model</Th>
                              <Th>Version</Th>
                              {activeTaskType === 'classification' ? (
                                <>
                                  <Th cursor="pointer" onClick={() => handleSort('accuracy')}>Accuracy <Icon as={sortField === 'accuracy' ? (sortDirection === 'desc' ? FaArrowDown : FaArrowUp) : undefined} /></Th>
                                  <Th cursor="pointer" onClick={() => handleSort('f1_score')}>F1 Score <Icon as={sortField === 'f1_score' ? (sortDirection === 'desc' ? FaArrowDown : FaArrowUp) : undefined} /></Th>
                                  <Th cursor="pointer" onClick={() => handleSort('auc')}>AUC <Icon as={sortField === 'auc' ? (sortDirection === 'desc' ? FaArrowDown : FaArrowUp) : undefined} /></Th>
                                </>
                              ) : (
                                <>
                                  <Th cursor="pointer" onClick={() => handleSort('rmse')}>RMSE <Icon as={sortField === 'rmse' ? (sortDirection === 'asc' ? FaArrowUp : FaArrowDown) : undefined} /></Th>
                                  <Th cursor="pointer" onClick={() => handleSort('r2_score')}>R² Score <Icon as={sortField === 'r2_score' ? (sortDirection === 'desc' ? FaArrowDown : FaArrowUp) : undefined} /></Th>
                                </>
                              )}
                              <Th cursor="pointer" onClick={() => handleSort('upload_time')}>Uploaded</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {sortedModels.map(model => (
                              <Tr key={model.id}>
                                <Td>{model.name}</Td>
                                <Td><Badge>{model.version}</Badge></Td>
                                {activeTaskType === 'classification' ? (
                                  <>
                                    <Td>{model.latest_metrics?.accuracy?.toFixed(3) ?? 'N/A'}</Td>
                                    <Td>{model.latest_metrics?.f1_score?.toFixed(3) ?? 'N/A'}</Td>
                                    <Td>{model.latest_metrics?.auc?.toFixed(3) ?? 'N/A'}</Td>
                                  </>
                                ) : (
                                  <>
                                    <Td>{model.latest_metrics?.rmse?.toFixed(4) ?? 'N/A'}</Td>
                                    <Td>{model.latest_metrics?.r2_score?.toFixed(4) ?? 'N/A'}</Td>
                                  </>
                                )}
                                <Td>{new Date(model.upload_time).toLocaleDateString()}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </MotionBox>
                    ) : (
                      <MotionGrid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6} width="100%">
                        {taskFilteredModels.map((model) => (
                          <ModelCard key={model.id} model={model} refreshModels={fetchModels} />
                        ))}
                      </MotionGrid>
                    )}
                  </AnimatePresence>
                )}
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}