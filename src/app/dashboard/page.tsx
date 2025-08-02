'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import Navbar from '@/components/Navbar';
import ModelCard from "@/components/ModelCard";

import {
  Box,
  Button,
  Grid,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  useColorModeValue,
  Divider,
  HStack,
  Tooltip,
  Icon,
  Container,
  Text,
  VStack,
  Badge,
  Flex,
  Skeleton,
  SkeletonText,
  useBreakpointValue,
  ScaleFade,
  Fade,
  SlideFade,
} from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown, FaRocket, FaTrophy, FaChartLine, FaEye, FaLayerGroup } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionButton = motion(Button);
const MotionTr = motion(Tr);

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

export default function DashboardPage() {
  const auth = useAuth();
  const userId = auth?.user_id;
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [showLatestOnly, setShowLatestOnly] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [sortField, setSortField] = useState<'accuracy' | 'f1_score' | 'auc' | 'upload_time' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Responsive values
  const headingSize = useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  // Color mode values
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50, blue.50)',
    'linear(to-br, purple.900, pink.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const tableBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('purple.50', 'purple.900');

  const fetchModels = async () => {
    if (!auth || !auth.user_id) {
      console.warn("Auth or user_id is missing");
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.get(`/models?user_id=${auth.user_id}`);
      setModels(res.data);
    } catch (err) {
      console.error('Error fetching models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!auth) {
      router.push('/login');
    } else {
      fetchModels();
    }
  }, [auth?.user_id]);

  const filteredModels = showLatestOnly
    ? Array.from(
        models.reduce((map, model) => {
          const current = map.get(model.name);
          const versionNum = parseInt(model.version.replace("v", "")) || 1;
          const currentVersion = current ? parseInt(current.version.replace("v", "")) || 1 : 0;
          if (!current || versionNum > currentVersion) {
            map.set(model.name, model);
          }
          return map;
        }, new Map<string, Model>())
      ).map(([, value]) => value)
    : models;

  const bestModels = Array.from(
    models.reduce((map, model) => {
      const current = map.get(model.name);
      const isBetter =
        !current ||
        (model.f1_score ?? -1) > (current.f1_score ?? -1) ||
        ((model.f1_score ?? -1) === (current.f1_score ?? -1) && (model.accuracy ?? -1) > (current.accuracy ?? -1));
      if (isBetter) {
        map.set(model.name, model);
      }
      return map;
    }, new Map<string, Model>())
  ).map(([, model]) => model);

  const handleSort = (field: 'accuracy' | 'f1_score' | 'auc' | 'upload_time') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedModels = [...bestModels].sort((a, b) => {
    if (!sortField) return 0;
    const valA = sortField === 'upload_time'
      ? new Date(a[sortField]!).getTime()
      : Number(a[sortField] ?? 0);
    const valB = sortField === 'upload_time'
      ? new Date(b[sortField]!).getTime()
      : Number(b[sortField] ?? 0);
    return sortDirection === 'asc' ? valA - valB : valB - valA;
  });

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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  if (!auth || !mounted) return null;

  return (
    <>
      <Navbar />
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW="1400px" p={containerPadding}>
          <MotionBox
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hero Section */}
            <MotionBox variants={itemVariants} textAlign="center" py={8}>
              <Heading
                size={headingSize}
                fontWeight="900"
                bgGradient="linear(to-r, purple.600, pink.600, blue.600)"
                bgClip="text"
                mb={4}
                letterSpacing="tight"
              >
                <Icon as={FaRocket} mr={4} />
                ML Model Dashboard
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
                Manage, analyze, and compare your machine learning models with powerful insights and analytics
              </Text>
            </MotionBox>

            {/* Stats Cards */}
            <MotionBox variants={itemVariants} mb={8}>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
                <MotionBox
                  variants={statsVariants}
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor="purple.100"
                  textAlign="center"
                  whileHover={{ y: -5, boxShadow: '2xl' }}
                  transition="0.2s"
                >
                  <Icon as={FaLayerGroup} size="2em" color="purple.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {models.length}
                  </Text>
                  <Text color="gray.500">Total Models</Text>
                </MotionBox>

                <MotionBox
                  variants={statsVariants}
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor="pink.100"
                  textAlign="center"
                  whileHover={{ y: -5, boxShadow: '2xl' }}
                  transition="0.2s"
                >
                  <Icon as={FaTrophy} size="2em" color="pink.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="bold" color="pink.600">
                    {bestModels.length}
                  </Text>
                  <Text color="gray.500">Best Performers</Text>
                </MotionBox>

                <MotionBox
                  variants={statsVariants}
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor="blue.100"
                  textAlign="center"
                  whileHover={{ y: -5, boxShadow: '2xl' }}
                  transition="0.2s"
                >
                  <Icon as={FaChartLine} size="2em" color="blue.500" mb={2} />
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {models.filter(m => m.accuracy && m.accuracy > 0.8).length}
                  </Text>
                  <Text color="gray.500">High Accuracy</Text>
                </MotionBox>
              </Grid>
            </MotionBox>

            {/* Control Buttons */}
            <MotionBox variants={itemVariants} mb={8}>
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={4} 
                justify="center" 
                align="center"
                wrap="wrap"
              >
                <MotionButton
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowLatestOnly((prev) => !prev)}
                  colorScheme="teal"
                  size="lg"
                  borderRadius="full"
                  px={8}
                  boxShadow="lg"
                  leftIcon={<Icon as={showLatestOnly ? FaEye : FaLayerGroup} />}
                >
                  {showLatestOnly ? "Latest Versions Only" : "All Versions"}
                  <Badge ml={2} colorScheme="white" color="teal.600">
                    {filteredModels.length}
                  </Badge>
                </MotionButton>

                <MotionButton
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowLeaderboard((prev) => !prev)}
                  colorScheme="orange"
                  variant={showLeaderboard ? "solid" : "outline"}
                  size="lg"
                  borderRadius="full"
                  px={8}
                  boxShadow="lg"
                  leftIcon={<Icon as={showLeaderboard ? FaTrophy : FaLayerGroup} />}
                >
                  {showLeaderboard ? "Leaderboard View" : "Cards View"}
                </MotionButton>

                <MotionButton
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => router.push('/compare')}
                  colorScheme="purple"
                  variant="ghost"
                  size="lg"
                  borderRadius="full"
                  px={8}
                  fontWeight="bold"
                  leftIcon={<Icon as={FaChartLine} />}
                >
                  Compare Models
                </MotionButton>
              </Flex>
            </MotionBox>

            <Divider mb={8} borderColor="purple.200" />

            {/* Loading State */}
            {isLoading ? (
              <VStack spacing={6}>
                <Skeleton height="60px" borderRadius="xl" />
                <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6} w="full">
                  {[1, 2, 3, 4].map((i) => (
                    <Box key={i} bg={cardBg} p={6} borderRadius="xl" boxShadow="lg">
                      <Skeleton height="40px" mb={4} />
                      <SkeletonText noOfLines={4} spacing="4" />
                    </Box>
                  ))}
                </Grid>
              </VStack>
            ) : (
              <AnimatePresence mode="wait">
                {showLeaderboard ? (
                  <MotionBox
                    key="leaderboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      bg={tableBg}
                      borderRadius="2xl"
                      boxShadow="2xl"
                      overflow="hidden"
                      border="1px"
                      borderColor="purple.100"
                    >
                      <Box bg={headerBg} p={6} borderBottom="1px" borderColor="purple.200">
                        <Heading size="lg" color="purple.700" textAlign="center">
                          <Icon as={FaTrophy} mr={3} />
                          Performance Leaderboard
                        </Heading>
                      </Box>
                      
                      <Table variant="simple" size="md">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th fontWeight="bold" color="gray.700">Model</Th>
                            <Th fontWeight="bold" color="gray.700">Version</Th>
                            <Th 
                              onClick={() => handleSort('accuracy')} 
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              transition="0.2s"
                              fontWeight="bold" 
                              color="gray.700"
                            >
                              <Tooltip label="Sort by Accuracy">
                                <Flex align="center">
                                  Accuracy 
                                  {sortField === 'accuracy' && (
                                    <MotionBox
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      ml={2}
                                    >
                                      <Icon as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown} />
                                    </MotionBox>
                                  )}
                                </Flex>
                              </Tooltip>
                            </Th>
                            <Th 
                              onClick={() => handleSort('f1_score')} 
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              transition="0.2s"
                              fontWeight="bold" 
                              color="gray.700"
                            >
                              <Tooltip label="Sort by F1 Score">
                                <Flex align="center">
                                  F1 Score 
                                  {sortField === 'f1_score' && (
                                    <MotionBox
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      ml={2}
                                    >
                                      <Icon as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown} />
                                    </MotionBox>
                                  )}
                                </Flex>
                              </Tooltip>
                            </Th>
                            <Th 
                              onClick={() => handleSort('auc')} 
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              transition="0.2s"
                              fontWeight="bold" 
                              color="gray.700"
                            >
                              <Tooltip label="Sort by AUC">
                                <Flex align="center">
                                  AUC 
                                  {sortField === 'auc' && (
                                    <MotionBox
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      ml={2}
                                    >
                                      <Icon as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown} />
                                    </MotionBox>
                                  )}
                                </Flex>
                              </Tooltip>
                            </Th>
                            <Th 
                              onClick={() => handleSort('upload_time')} 
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              transition="0.2s"
                              fontWeight="bold" 
                              color="gray.700"
                            >
                              <Tooltip label="Sort by Upload Time">
                                <Flex align="center">
                                  Uploaded 
                                  {sortField === 'upload_time' && (
                                    <MotionBox
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      ml={2}
                                    >
                                      <Icon as={sortDirection === 'asc' ? FaArrowUp : FaArrowDown} />
                                    </MotionBox>
                                  )}
                                </Flex>
                              </Tooltip>
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <AnimatePresence>
                            {sortedModels.map((model, index) => (
                              <MotionTr
                                key={model.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                _hover={{ bg: "purple.50", transform: "scale(1.01)" }}
                                cursor="pointer"
                              >
                                <Td fontWeight="semibold" color="purple.700">
                                  <Flex align="center">
                                    {index < 3 && (
                                      <Icon 
                                        as={FaTrophy} 
                                        mr={2} 
                                        color={index === 0 ? "yellow.500" : index === 1 ? "gray.400" : "orange.600"} 
                                      />
                                    )}
                                    {model.name}
                                  </Flex>
                                </Td>
                                <Td>
                                  <Badge colorScheme="blue" borderRadius="full">
                                    {model.version}
                                  </Badge>
                                </Td>
                                <Td fontWeight="medium">
                                  <Badge 
                                    colorScheme={model.accuracy && model.accuracy > 0.9 ? "green" : model.accuracy && model.accuracy > 0.8 ? "yellow" : "red"}
                                    borderRadius="full"
                                  >
                                    {model.accuracy?.toFixed(3) ?? 'N/A'}
                                  </Badge>
                                </Td>
                                <Td fontWeight="medium">
                                  <Badge 
                                    colorScheme={model.f1_score && model.f1_score > 0.9 ? "green" : model.f1_score && model.f1_score > 0.8 ? "yellow" : "red"}
                                    borderRadius="full"
                                  >
                                    {model.f1_score?.toFixed(3) ?? 'N/A'}
                                  </Badge>
                                </Td>
                                <Td fontWeight="medium">
                                  <Badge 
                                    colorScheme={model.auc && model.auc > 0.9 ? "green" : model.auc && model.auc > 0.8 ? "yellow" : "red"}
                                    borderRadius="full"
                                  >
                                    {model.auc?.toFixed(3) ?? 'N/A'}
                                  </Badge>
                                </Td>
                                <Td color="gray.600">
                                  {new Date(model.upload_time).toLocaleDateString()}
                                </Td>
                              </MotionTr>
                            ))}
                          </AnimatePresence>
                        </Tbody>
                      </Table>
                    </Box>
                  </MotionBox>
                ) : (
                  <MotionGrid
                    key="cards"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                    gap={8}
                  >
                    <AnimatePresence>
                      {filteredModels.map((model, index) => (
                        <MotionBox
                          key={model.id}
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                          }}
                          whileHover={{ 
                            y: -8,
                            transition: { type: "spring", stiffness: 300, damping: 20 }
                          }}
                        >
                          <ModelCard
                            model={model}
                            refreshModels={fetchModels}
                          />
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </MotionGrid>
                )}
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && filteredModels.length === 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                textAlign="center"
                py={16}
              >
                <Icon as={FaRocket} size="4em" color="gray.300" mb={4} />
                <Heading size="lg" color="gray.500" mb={4}>
                  No models found
                </Heading>
                <Text color="gray.400" fontSize="lg">
                  Upload your first ML model to get started!
                </Text>
              </MotionBox>
            )}
          </MotionBox>
        </Container>
      </Box>
    </>
  );
}