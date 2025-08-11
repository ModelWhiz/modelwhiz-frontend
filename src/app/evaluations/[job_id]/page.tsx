// modelwhiz-frontend/src/app/evaluations/[job_id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  Box, Heading, Text, Spinner, VStack, useColorModeValue, Container, Card, CardBody, Alert, 
  AlertIcon, SimpleGrid, Stat, StatLabel, StatNumber, Image, List, ListItem, ListIcon
} from '@chakra-ui/react'
import { getJobStatus, getJobResults } from '@/lib/apiClient'
import { FaLightbulb } from 'react-icons/fa'

interface Job {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  model_name: string;
  results: { [key: string]: any } | null; // Using 'any' to accommodate mixed types (number, string[])
  artifacts: { [key: string]: string | null } | null;
  error_message: string | null;
  created_at: string;
}

export default function EvaluationResultPage() {
  const params = useParams()
  const jobId = Number(params.job_id)
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!jobId || isNaN(jobId)) {
      setIsLoading(false);
      return;
    }

    const pollStatus = async () => {
      try {
        const statusRes = await getJobStatus(jobId);
        if (statusRes.status === 'COMPLETED' || statusRes.status === 'FAILED') {
          const finalResults = await getJobResults(jobId);
          setJob(finalResults);
          setIsLoading(false);
        } else {
          setJob(prev => ({ ...prev, status: 'PROCESSING' } as Job));
          setTimeout(pollStatus, 3000);
        }
      } catch (error) {
        console.error("Error fetching job status:", error);
        setJob({ status: 'FAILED', error_message: 'Could not connect to the server to get job status.' } as any);
        setIsLoading(false);
      }
    };

    pollStatus();

  }, [jobId])

  const renderContent = () => {
    if (isLoading || (job && job.status === 'PROCESSING')) {
      return (
        <VStack spacing={4} py={20}>
          <Spinner size="xl" color="purple.500" thickness="4px" speed="0.65s"/>
          <Heading size="lg">Evaluation in Progress</Heading>
          <Text color="gray.500">We're analyzing your model. This may take a moment...</Text>
        </VStack>
      )
    }

    if (job?.status === 'FAILED') {
      return (
        <Alert status="error" borderRadius="lg" p={6}>
          <AlertIcon boxSize="40px" mr={4} />
          <VStack align="start">
            <Heading size="md">Evaluation Failed</Heading>
            <Text>{job.error_message || 'An unknown error occurred.'}</Text>
          </VStack>
        </Alert>
      )
    }

    if (job?.status === 'COMPLETED') {
      const isRegression = job.results?.hasOwnProperty('rmse');
      const metricsToDisplay = job.results ? Object.entries(job.results).filter(([key]) => key !== 'insights') : [];

      return (
        <VStack spacing={6} align="stretch">
          <Heading>Evaluation Results: {job.model_name}</Heading>
          
          <Card variant="outline">
            <CardBody>
                <Heading size="md" mb={6}>Performance Metrics</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, md: 10 }}>
                    {metricsToDisplay.map(([key, value]) => (
                        <Stat
                            key={key}
                            p={4}
                            border="1px solid"
                            borderColor={useColorModeValue('gray.100', 'gray.700')}
                            borderRadius="lg"
                            textAlign="center"
                            boxShadow="sm"
                        >
                            <StatLabel color="gray.500" fontSize="sm">{key.replace(/_/g, ' ').toUpperCase()}</StatLabel>
                            <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
                                {value as number}
                            </StatNumber>
                        </Stat>
                    ))}
                </SimpleGrid>
            </CardBody>
          </Card>

          {job.artifacts?.plot_url && (
            <Card variant="outline">
                <CardBody>
                    <Heading size="md" mb={4}>{isRegression ? 'Predicted vs. Actual Plot' : 'Confusion Matrix'}</Heading>
                    <Box p={4} display="flex" justifyContent="center" bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="md">
                      <Image 
                          src={`http://localhost:8000${job.artifacts.plot_url}`} 
                          alt="Evaluation Plot"
                          borderRadius="md"
                          boxShadow="md"
                          maxW="100%"
                          h="auto"
                      />
                    </Box>
                </CardBody>
            </Card>
          )}

          {job.results?.insights && Array.isArray(job.results.insights) && (
            <Card variant="outline">
              <CardBody>
                <Heading size="md" mb={4}>Automated Insights</Heading>
                <List spacing={3}>
                  {(job.results.insights as string[]).map((insight, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                      <ListIcon as={FaLightbulb} color="yellow.500" />
                      <Text>{insight}</Text>
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          )}
        </VStack>
      )
    }

    return <Text>Could not load evaluation results. Please check the job ID and try again.</Text>
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="5xl" py={12}>
        {renderContent()}
      </Container>
    </Box>
  )
}