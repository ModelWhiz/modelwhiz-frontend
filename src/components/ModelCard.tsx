'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Text,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Input,
  Button,
  useToast,
  Badge,
  HStack,
  IconButton,
  Flex,
  Progress,
  useColorModeValue,
  Tooltip,
  Divider,
  Avatar,
  AvatarBadge,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import MetricsChart from '@/components/MetricsChart';
import { DeleteIcon } from '@chakra-ui/icons';
import { 
  FaRobot, 
  FaChartLine, 
  FaCalendarAlt, 
  FaUpload, 
  FaEye, 
  FaTrash, 
  FaTrophy, 
  FaFileAlt,
  FaStar,
  FaFire,
  FaCheck,
  FaTimes,
  FaCloud
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Motion components
const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionButton = motion(Button);

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.100', 'purple.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const statBg = useColorModeValue('purple.50', 'purple.900');
  const headerGradient = useColorModeValue(
    'linear(to-r, purple.500, pink.500)',
    'linear(to-r, purple.400, pink.400)'
  );

  // Calculate performance score
  const getPerformanceScore = () => {
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

  const performanceScore = parseFloat(getPerformanceScore());
  const performanceColor = getPerformanceColor(performanceScore);
  const PerformanceIcon = getPerformanceIcon(performanceScore);

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
        description: 'Model metrics have been updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      refreshModels();
      setTestFile(null);
      onModalClose();
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

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await apiClient.delete(`/models/${model.id}`);
      toast({
        title: '🗑️ Model Deleted',
        description: `${model.name} (v${model.version}) has been removed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refreshModels();
    } catch (error) {
      console.error('Delete failed', error);
      toast({
        title: '❌ Delete Failed',
        description: 'Something went wrong.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onAlertClose();
    }
  };

  const cardVariants = {
    rest: {
      scale: 1,
      rotateY: 0,
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      scale: 1.02,
      rotateY: 2,
      boxShadow: "0px 8px 30px rgba(139, 92, 246, 0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <MotionCard
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
        bg={cardBg}
        border="2px"
        borderColor={borderColor}
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgGradient: headerGradient,
        }}
      >
        {/* Header */}
        <CardHeader pb={2}>
          <Flex justify="space-between" align="center" mb={2}>
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={model.name}
                bg="purple.500"
                color="white"
                icon={<FaRobot />}
              >
                <AvatarBadge
                  boxSize="1em"
                  bg={`${performanceColor}.500`}
                >
                  <PerformanceIcon size="0.6em" color="white" />
                </AvatarBadge>
              </Avatar>
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={textColor}
                  noOfLines={1}
                >
                  {model.name}
                </Text>
                <HStack spacing={2}>
                  <Badge
                    colorScheme="purple"
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {model.version}
                  </Badge>
                  <Badge
                    colorScheme={performanceColor}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {getPerformanceScore()}% Score
                  </Badge>
                </HStack>
              </Box>
            </HStack>

            <IconButton
              aria-label="Delete model"
              icon={<FaTrash />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={onAlertOpen}
              opacity={isHovered ? 1 : 0}
              transition="opacity 0.2s"
              zIndex={10} // Ensure delete button is above the star
            />
          </Flex>

          <HStack spacing={2} color="gray.500" fontSize="sm">
            <FaCalendarAlt />
            <Text>
              Uploaded {new Date(model.upload_time).toLocaleDateString()}
            </Text>
          </HStack>
        </CardHeader>

        <CardBody pt={0}>
          {/* Performance Metrics */}
          <Box bg={statBg} borderRadius="xl" p={4} mb={4}>
            <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={3} textAlign="center">
              Performance Metrics
            </Text>
            
            <Grid templateColumns="repeat(3, 1fr)" gap={3}>
              <GridItem>
                <VStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    Accuracy
                  </Text>
                  <Badge
                    colorScheme={model.accuracy && model.accuracy > 0.8 ? 'green' : 'orange'}
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                  >
                    {model.accuracy?.toFixed(3) ?? 'N/A'}
                  </Badge>
                </VStack>
              </GridItem>
              
              <GridItem>
                <VStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    F1 Score
                  </Text>
                  <Badge
                    colorScheme={model.f1_score && model.f1_score > 0.8 ? 'green' : 'orange'}
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                  >
                    {model.f1_score?.toFixed(3) ?? 'N/A'}
                  </Badge>
                </VStack>
              </GridItem>
              
              <GridItem>
                <VStack spacing={1}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    AUC
                  </Text>
                  <Badge
                    colorScheme={model.auc && model.auc > 0.8 ? 'green' : 'orange'}
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                  >
                    {model.auc?.toFixed(3) ?? 'N/A'}
                  </Badge>
                </VStack>
              </GridItem>
            </Grid>

            {/* Performance Progress Bar */}
            <Box mt={3}>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="xs" color="gray.500">
                  Overall Score
                </Text>
                <Text fontSize="xs" fontWeight="bold" color={`${performanceColor}.600`}>
                  {getPerformanceScore()}%
                </Text>
              </Flex>
              <Progress
                value={performanceScore}
                colorScheme={performanceColor}
                borderRadius="full"
                size="sm"
              />
            </Box>
          </Box>

          {/* Chart Preview */}
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}
            mb={4}
          >
            <MetricsChart metrics={model.metrics} />
          </MotionBox>

          {/* Action Buttons */}
          <VStack spacing={3}>
            <MotionButton
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              colorScheme="purple"
              leftIcon={<FaCloud />}
              onClick={onModalOpen}
              width="100%"
              borderRadius="xl"
              fontWeight="semibold"
              boxShadow="md"
            >
              Evaluate Model
            </MotionButton>

            <MotionButton
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              colorScheme="teal"
              variant="outline"
              leftIcon={<FaEye />}
              onClick={() => router.push(`/dashboard/${model.id}`)}
              width="100%"
              borderRadius="xl"
              fontWeight="semibold"
            >
              View Details
            </MotionButton>
          </VStack>

          {/* Model Info Footer */}
          <Divider my={4} />
          <HStack justify="space-between" fontSize="xs" color="gray.500">
            <HStack>
              <FaFileAlt />
              <Text>{model.filename}</Text>
            </HStack>
            <Text>ID: {model.id}</Text>
          </HStack>
        </CardBody>

        {/* Animated Corner Accent - Moved to bottom-right to avoid overlap */}
        <AnimatePresence>
          {isHovered && (
            <MotionBox
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              position="absolute"
              bottom={4}
              right={4}
              w={8}
              h={8}
              bg="purple.500"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={5} // Lower z-index than delete button
            >
              <FaStar color="white" size="16px" />
            </MotionBox>
          )}
        </AnimatePresence>
      </MotionCard>

      {/* Evaluation Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader
            bgGradient={headerGradient}
            color="white"
            borderTopRadius="2xl"
          >
            <HStack>
              <FaCloud />
              <Text>Evaluate {model.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody p={6}>
            <VStack spacing={6}>
              <Box
                p={6}
                border="2px dashed"
                borderColor="purple.200"
                borderRadius="xl"
                w="100%"
                textAlign="center"
                bg="purple.50"
              >
                <FaUpload size="2em" color="purple" style={{ margin: '0 auto 16px' }} />
                <Text mb={4} fontWeight="medium">
                  Upload CSV file for model evaluation
                </Text>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  border="none"
                  p={0}
                  _focus={{ outline: 'none' }}
                />
                {testFile && (
                  <HStack mt={3} justify="center" color="green.600">
                    <FaCheck />
                    <Text fontSize="sm">{testFile.name}</Text>
                  </HStack>
                )}
              </Box>

              <HStack spacing={3} w="100%">
                <Button
                  colorScheme="gray"
                  variant="outline"
                  onClick={onModalClose}
                  borderRadius="xl"
                  flex={1}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="purple"
                  isLoading={isEvaluating}
                  loadingText="Evaluating..."
                  onClick={handleEvaluation}
                  borderRadius="xl"
                  flex={2}
                  disabled={!testFile}
                >
                  Start Evaluation
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay backdropFilter="blur(10px)">
          <AlertDialogContent borderRadius="2xl" mx={4}>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              bgGradient="linear(to-r, red.500, pink.500)"
              color="white"
              borderTopRadius="2xl"
            >
              <HStack>
                <FaTrash />
                <Text>Delete Model</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody p={6}>
              <VStack spacing={4}>
                <Text textAlign="center">
                  Are you sure you want to delete <strong>{model.name} (v{model.version})</strong>?
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  This action cannot be undone. All associated metrics and data will be permanently removed.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack spacing={3}>
                <Button
                  ref={cancelRef}
                  onClick={onAlertClose}
                  borderRadius="xl"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  borderRadius="xl"
                >
                  Delete Model
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}