// modelwhiz-frontend/src/components/ModelCard.tsx
'use client';

import { useState, useRef} from 'react';
import {
  Card, CardHeader, CardBody, Text, Box, VStack, Button, useToast, Badge, HStack, IconButton, Flex,
  useColorModeValue, Divider, Avatar, Grid, AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import MetricsChart from '@/components/MetricsChart';
import { 
  FaRobot, FaEye, FaTrash, FaHistory
} from 'react-icons/fa';
import { motion } from 'framer-motion';


const MotionButton = motion(Button);
const MotionCard = motion(Card);

type Model = {
  id: number;
  name: string;
  version: string;
  filename: string;
  upload_time: string;
  metrics: any[];
  latest_metrics: { [key: string]: number } | null;
};

type Props = {
  model: Model;
  refreshModels: () => void;
};

export default function ModelCard({ model, refreshModels }: Props) {
  if (!model) return null;

  const router = useRouter();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cardBg = useColorModeValue('white', 'gray.800');

  const isRegression = model.latest_metrics?.hasOwnProperty('rmse');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/models/${model.id}`);
      toast({ title: '🗑️ Model Deleted', status: 'success', duration: 3000, isClosable: true });
      refreshModels();
    } catch (error) {
      toast({ title: '❌ Delete Failed', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsDeleting(false);
      onAlertClose();
    }
  };

  return (
    <>
      <MotionCard
        whileHover={{ y: -5, boxShadow: '0px 8px 30px rgba(139, 92, 246, 0.2)' }}
        bg={cardBg}
        borderRadius="2xl"
        overflow="hidden"
        border="1px"
        borderColor="purple.100"
      >
        <CardHeader>
            <Flex justify="space-between" align="center">
                 <HStack>
                    <Avatar name={model.name} bg="purple.500" color="white" icon={<FaRobot size="1.5em" />} />
                    <Box>
                        <Text fontWeight="bold">{model.name}</Text>
                        <Text fontSize="sm" color="gray.500">{model.version}</Text>
                    </Box>
                </HStack>
                 <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red" onClick={onAlertOpen} />
            </Flex>
        </CardHeader>
        <CardBody>
             <VStack spacing={4} align="stretch">
                {/* --- vvv THIS IS THE NEW CONDITIONAL LOGIC vvv --- */}
                <Grid templateColumns="repeat(3, 1fr)" gap={4} textAlign="center">
                    {isRegression ? (
                      <>
                        <Box /> {/* Empty box for alignment */}
                        <Box>
                          <Text fontSize="xs" color="gray.500">RMSE</Text>
                          <Text fontWeight="bold" fontSize="lg">{model.latest_metrics?.rmse ?? 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">R2 SCORE</Text>
                          <Text fontWeight="bold" fontSize="lg">{model.latest_metrics?.r2_score ?? 'N/A'}</Text>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box>
                          <Text fontSize="xs" color="gray.500">ACCURACY</Text>
                          <Text fontWeight="bold" fontSize="lg">{model.latest_metrics?.accuracy?.toFixed(3) ?? 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">F1 SCORE</Text>
                          <Text fontWeight="bold" fontSize="lg">{model.latest_metrics?.f1_score?.toFixed(3) ?? 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">AUC</Text>
                          <Text fontWeight="bold" fontSize="lg">{model.latest_metrics?.auc?.toFixed(3) ?? 'N/A'}</Text>
                        </Box>
                      </>
                    )}
                </Grid>
                {/* --- ^^^ END OF NEW LOGIC ^^^ --- */}

                {model.metrics && model.metrics.length > 0 && <MetricsChart metrics={model.metrics} />}
                
                <Divider />

                <VStack spacing={3}>
                    <MotionButton
                        whileHover={{ scale: 1.05 }}
                        colorScheme="purple"
                        leftIcon={<FaEye />}
                        onClick={() => router.push(`/dashboard/${model.id}`)}
                        width="100%"
                        variant="outline"
                    >
                        View Details
                    </MotionButton>
                    <MotionButton
                         whileHover={{ scale: 1.05 }}
                         colorScheme="teal"
                         leftIcon={<FaHistory />}
                         onClick={() => router.push(`/dashboard/${model.id}`)}
                         width="100%"
                    >
                        View History & Insights
                    </MotionButton>
                </VStack>
             </VStack>
        </CardBody>
      </MotionCard>

       <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
            <AlertDialogOverlay><AlertDialogContent>
                <AlertDialogHeader>Delete Model</AlertDialogHeader>
                <AlertDialogBody>Are you sure you want to delete "{model.name} - {model.version}"? This cannot be undone.</AlertDialogBody>
                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onAlertClose}>Cancel</Button>
                    <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isDeleting}>Delete</Button>
                </AlertDialogFooter>
            </AlertDialogContent></AlertDialogOverlay>
        </AlertDialog>
    </>
  );
}