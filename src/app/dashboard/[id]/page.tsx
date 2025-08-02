'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import {
  Box,
  Heading,
  Spinner,
  Text,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
  Icon,
  ModalCloseButton,
  ModalHeader,
  ModalContent,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalFooter,
  List,
  ListItem,
  ListIcon,
  Container,
  HStack,
  Badge,
  Avatar,
  Progress,
  Flex,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  GridItem,
  useToast,
} from '@chakra-ui/react';
import { 
  DownloadIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ArrowBackIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { 
  FaRobot, 
  FaChartLine, 
  FaTrophy, 
  FaStar, 
  FaFire, 
  FaHistory,
  FaBrain,
  FaDownload,
  FaFileAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaLightbulb,
  FaChevronRight,
  FaHome,
  FaDatabase,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';
import MetricsChartInline from '@/components/MetricsChartInline';
import { motion, AnimatePresence } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionGrid = motion(SimpleGrid);
const MotionButton = motion(Button);

type Metric = {
  accuracy: number;
  f1_score: number;
  auc: number;
  timestamp?: string;
};

type Model = {
  id: number;
  name: string;
  filename: string;
  upload_time: string;
  accuracy: number | null;
  f1_score: number | null;
  auc: number | null;
  metrics: Metric[];
};

export default function ModelDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Color mode values
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50, blue.50)',
    'linear(to-br, purple.900, pink.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('purple.50', 'purple.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Calculate performance score
  const getPerformanceScore = (model: Model) => {
    const accuracy = model.accuracy || 0;
    const f1 = model.f1_score || 0;
    const auc = model.auc || 0;
    return ((accuracy + f1 + auc) / 3 * 100).toFixed(1);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'yellow';
    if (score >= 70) return 'orange';
    return 'red';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return FaTrophy;
    if (score >= 80) return FaStar;
    if (score >= 70) return FaFire;
    return FaChartLine;
  };

  const handleInsights = async () => {
    if (!model) return;

    setInsightsLoading(true);
    try {
      const res = await apiClient.get(`/models/${model.id}/insights`);
      setInsights(res.data.insights);
      setIsInsightOpen(true);
    } catch (err) {
      console.error("Failed to load insights:", err);
      toast({
        title: 'Failed to load insights',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await apiClient.get('/models/');
        const found = response.data.find((m: Model) => m.id === Number(id));
        setModel(found);
      } catch (error) {
        console.error('Error fetching model:', error);
        toast({
          title: 'Failed to load model',
          description: 'Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -5,
      boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="purple.600" fontSize="lg" fontWeight="medium">
            Loading model details...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!model) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Icon as={FaExclamationTriangle} boxSize={16} color="orange.500" />
          <Heading color="orange.600">Model Not Found</Heading>
          <Text color="gray.600" textAlign="center">
            The requested model could not be found or may have been deleted.
          </Text>
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="purple"
            onClick={() => router.push('/dashboard')}
            borderRadius="xl"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  const performanceScore = parseFloat(getPerformanceScore(model));
  const performanceColor = getPerformanceColor(performanceScore);
  const PerformanceIcon = getPerformanceIcon(performanceScore);

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="1200px" py={8}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Breadcrumb Navigation */}
          <MotionBox variants={itemVariants} mb={6}>
            <Breadcrumb 
              spacing="8px" 
              separator={<FaChevronRight color="gray.500" size="12px" />}
              fontSize="sm"
              color="gray.600"
            >
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => router.push('/dashboard')}>
                  <HStack spacing={1}>
                    <FaHome />
                    <Text>Dashboard</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Text color="purple.600" fontWeight="medium">
                  {model.name}
                </Text>
              </BreadcrumbItem>
            </Breadcrumb>
          </MotionBox>

          {/* Header Section */}
          <MotionCard
            variants={cardVariants}
            whileHover="hover"
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            border="1px"
            borderColor="purple.100"
            mb={8}
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgGradient: 'linear(to-r, purple.500, pink.500)',
            }}
          >
            <CardBody p={8}>
              <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} gap={6}>
                <Avatar
                  size="2xl"
                  name={model.name}
                  bg="purple.500"
                  color="white"
                  icon={<FaRobot size="3em" />}
                >
                  <Badge
                    position="absolute"
                    bottom={2}
                    right={2}
                    bg={`${performanceColor}.500`}
                    color="white"
                    borderRadius="full"
                    p={2}
                  >
                    <PerformanceIcon size="16px" />
                  </Badge>
                </Avatar>

                <VStack align="start" spacing={3} flex={1}>
                  <HStack spacing={4} wrap="wrap">
                    <Heading size="2xl" color={textColor} fontWeight="bold">
                      {model.name}
                    </Heading>
                    <Badge
                      colorScheme={performanceColor}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {getPerformanceScore(model)}% Score
                    </Badge>
                  </HStack>

                  <HStack spacing={6} wrap="wrap" color="gray.500">
                    <HStack spacing={2}>
                      <FaCalendarAlt />
                      <Text fontSize="sm">
                        Uploaded {new Date(model.upload_time).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <FaFileAlt />
                      <Text fontSize="sm">{model.filename}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <FaDatabase />
                      <Text fontSize="sm">ID: {model.id}</Text>
                    </HStack>
                  </HStack>

                  {/* Performance Progress */}
                  <Box w="full" maxW="400px">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Overall Performance
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color={`${performanceColor}.600`}>
                        {getPerformanceScore(model)}%
                      </Text>
                    </Flex>
                    <Progress
                      value={performanceScore}
                      colorScheme={performanceColor}
                      borderRadius="full"
                      size="md"
                      bg="gray.100"
                    />
                  </Box>
                </VStack>

                <VStack spacing={3}>
                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    leftIcon={<FaArrowLeft />}
                    colorScheme="gray"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    borderRadius="xl"
                    size="lg"
                  >
                    Back
                  </MotionButton>
                </VStack>
              </Flex>
            </CardBody>
          </MotionCard>

          {/* Metrics Cards */}
          <MotionBox variants={itemVariants} mb={8}>
            <Heading size="lg" mb={6} color={textColor} display="flex" alignItems="center">
              <Icon as={FaChartLine} mr={3} color="purple.500" />
              Performance Metrics
            </Heading>

            <MotionGrid
              columns={{ base: 1, md: 3 }}
              spacing={6}
              variants={containerVariants}
            >
              <MotionCard
                variants={cardVariants}
                whileHover="hover"
                bg={cardBg}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="purple.100"
                overflow="hidden"
              >
                <CardHeader bg="purple.50" py={4}>
                  <HStack>
                    <Icon as={FaCheckCircle} color="purple.500" />
                    <Text fontWeight="bold" color="purple.700">Accuracy</Text>
                  </HStack>
                </CardHeader>
                <CardBody textAlign="center" py={6}>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.600" mb={2}>
                    {model.accuracy?.toFixed(3) ?? 'N/A'}
                  </Text>
                  <Badge
                    colorScheme={model.accuracy && model.accuracy > 0.8 ? 'green' : 'orange'}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {model.accuracy && model.accuracy > 0.9 ? 'Excellent' : 
                     model.accuracy && model.accuracy > 0.8 ? 'Good' : 
                     model.accuracy && model.accuracy > 0.7 ? 'Fair' : 'Needs Improvement'}
                  </Badge>
                </CardBody>
              </MotionCard>

              <MotionCard
                variants={cardVariants}
                whileHover="hover"
                bg={cardBg}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="blue.100"
                overflow="hidden"
              >
                <CardHeader bg="blue.50" py={4}>
                  <HStack>
                    <Icon as={FaStar} color="blue.500" />
                    <Text fontWeight="bold" color="blue.700">F1 Score</Text>
                  </HStack>
                </CardHeader>
                <CardBody textAlign="center" py={6}>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600" mb={2}>
                    {model.f1_score?.toFixed(3) ?? 'N/A'}
                  </Text>
                  <Badge
                    colorScheme={model.f1_score && model.f1_score > 0.8 ? 'green' : 'orange'}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {model.f1_score && model.f1_score > 0.9 ? 'Excellent' : 
                     model.f1_score && model.f1_score > 0.8 ? 'Good' : 
                     model.f1_score && model.f1_score > 0.7 ? 'Fair' : 'Needs Improvement'}
                  </Badge>
                </CardBody>
              </MotionCard>

              <MotionCard
                variants={cardVariants}
                whileHover="hover"
                bg={cardBg}
                borderRadius="xl"
                boxShadow="lg"
                border="1px"
                borderColor="green.100"
                overflow="hidden"
              >
                <CardHeader bg="green.50" py={4}>
                  <HStack>
                    <Icon as={FaTrophy} color="green.500" />
                    <Text fontWeight="bold" color="green.700">AUC</Text>
                  </HStack>
                </CardHeader>
                <CardBody textAlign="center" py={6}>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600" mb={2}>
                    {model.auc?.toFixed(3) ?? 'N/A'}
                  </Text>
                  <Badge
                    colorScheme={model.auc && model.auc > 0.8 ? 'green' : 'orange'}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {model.auc && model.auc > 0.9 ? 'Excellent' : 
                     model.auc && model.auc > 0.8 ? 'Good' : 
                     model.auc && model.auc > 0.7 ? 'Fair' : 'Needs Improvement'}
                  </Badge>
                </CardBody>
              </MotionCard>
            </MotionGrid>
          </MotionBox>

          {/* Evaluation History */}
          <MotionBox variants={itemVariants} mb={8}>
            <Heading size="lg" mb={6} color={textColor} display="flex" alignItems="center">
              <Icon as={FaHistory} mr={3} color="purple.500" />
              Evaluation History
            </Heading>

            <MotionCard
              variants={cardVariants}
              whileHover="hover"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor="purple.100"
            >
              <CardBody p={6}>
                {model.metrics?.length > 0 ? (
                  <Box>
                    <HStack justify="space-between" mb={4}>
                      <Text fontWeight="medium" color={textColor}>
                        Performance Over Time
                      </Text>
                      <Badge colorScheme="purple" borderRadius="full">
                        {model.metrics.length} evaluations
                      </Badge>
                    </HStack>
                    <MetricsChartInline metrics={model.metrics} />
                  </Box>
                ) : (
                  <VStack spacing={4} py={8}>
                    <Icon as={FaClock} boxSize={12} color="gray.300" />
                    <Text color="gray.500" fontSize="lg">
                      No evaluation history available
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      Upload test data to generate performance metrics and track your model's progress over time.
                    </Text>
                  </VStack>
                )}
              </CardBody>
            </MotionCard>
          </MotionBox>

          {/* Action Buttons */}
          <MotionBox variants={itemVariants}>
            <HStack spacing={4} justify="center" wrap="wrap">
              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                leftIcon={<FaLightbulb />}
                colorScheme="orange"
                size="lg"
                borderRadius="xl"
                onClick={handleInsights}
                isLoading={insightsLoading}
                loadingText="Generating..."
                boxShadow="lg"
              >
                Generate Insights
              </MotionButton>

              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                leftIcon={<FaDownload />}
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                onClick={() =>
                  window.open(`http://localhost:8000/uploads/${model.filename}`, '_blank')
                }
                boxShadow="lg"
              >
                Download Model
              </MotionButton>
            </HStack>
          </MotionBox>
        </MotionBox>

        {/* Insights Modal */}
        <Modal isOpen={isInsightOpen} onClose={() => setIsInsightOpen(false)} size="xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          {/*
            Replace MotionContent with motion.div and wrap ModalContent inside
          */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ borderRadius: '1rem', marginLeft: '1rem', marginRight: '1rem' }}
          >
            <ModalContent borderRadius="2xl" mx={4}>
              <ModalHeader
                bgGradient="linear(to-r, orange.500, yellow.500)"
                color="white"
                borderTopRadius="2xl"
                py={6}
              >
                <HStack spacing={3}>
                  <FaBrain size="24px" />
                  <Text fontSize="xl" fontWeight="bold">AI-Generated Insights</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton color="white" />
              
              <ModalBody p={6}>
                {insights.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="xl">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Analysis Complete!</AlertTitle>
                        <AlertDescription>
                          Here are AI-powered insights based on your model's performance metrics.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <List spacing={4}>
                      {insights.map((item, idx) => (
                        <ListItem
                          key={idx}
                          p={4}
                          bg="orange.50"
                          borderRadius="xl"
                          border="1px"
                          borderColor="orange.100"
                        >
                          <HStack align="start" spacing={3}>
                            <ListIcon as={CheckCircleIcon} color="orange.500" mt={1} />
                            <Text color="gray.700" lineHeight="tall">
                              {item}
                            </Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </VStack>
                ) : (
                  <VStack spacing={4} py={8}>
                    <Spinner size="lg" color="orange.500" />
                    <Text color="gray.500">Generating insights...</Text>
                  </VStack>
                )}
              </ModalBody>
              
              <ModalFooter borderTop="1px" borderColor="gray.100">
                <Button 
                  onClick={() => setIsInsightOpen(false)} 
                  colorScheme="orange"
                  borderRadius="xl"
                  size="lg"
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </motion.div>
        </Modal>
      </Container>
    </Box>
  );
}