// modelwhiz-frontend/src/app/dashboard/evaluations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import Navbar from '@/components/Navbar';
import {
  Box, Container, Heading, Text, Spinner, VStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button,
  useColorModeValue, Icon
} from '@chakra-ui/react';
import { FaEye, FaHistory } from 'react-icons/fa';

interface Job {
  id: number;
  model_name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

const StatusBadge = ({ status }: { status: Job['status'] }) => {
  const colorScheme = {
    COMPLETED: 'green',
    PROCESSING: 'blue',
    PENDING: 'yellow',
    FAILED: 'red',
  }[status];

  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

export default function EvaluationsHistoryPage() {
  const router = useRouter();
  const auth = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!auth?.user_id) return;
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/evaluations/?user_id=${auth.user_id}`);
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch evaluation jobs", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [auth?.user_id]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <VStack spacing={4} py={20}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading evaluation history...</Text>
        </VStack>
      );
    }
    if (jobs.length === 0) {
      return (
        <VStack spacing={4} py={20}>
          <Icon as={FaHistory} boxSize="40px" color="gray.400" />
          <Heading size="lg">No Evaluations Found</Heading>
          <Text color="gray.500">Run your first evaluation from the upload page to see its history here.</Text>
          <Button colorScheme="purple" onClick={() => router.push('/upload')}>
            Upload a Model
          </Button>
        </VStack>
      );
    }
    return (
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg={useColorModeValue('white', 'gray.800')}>
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
            <Tr>
              <Th>Model Name</Th>
              <Th>Status</Th>
              <Th>Date Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {jobs.map((job) => (
              <Tr key={job.id}>
                <Td fontWeight="medium">{job.model_name}</Td>
                <Td><StatusBadge status={job.status} /></Td>
                <Td>{new Date(job.created_at).toLocaleString()}</Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    leftIcon={<FaEye />}
                    onClick={() => router.push(`/evaluations/${job.id}`)}
                  >
                    View Results
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="6xl" py={10}>
          <VStack spacing={6} align="stretch">
            <Heading>Evaluation History</Heading>
            {renderContent()}
          </VStack>
        </Container>
      </Box>
    </>
  );
}