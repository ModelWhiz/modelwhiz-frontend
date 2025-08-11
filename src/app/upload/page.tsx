// modelwhiz-frontend/src/app/upload/page.tsx
'use client';

import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Heading, Input, VStack, useToast, Text, Container, Card, CardBody, Icon, Flex,
  useColorModeValue, Divider, FormLabel, HStack, Progress,
} from '@chakra-ui/react';
import { FiUploadCloud, FiFile, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { startEvaluation } from '@/lib/apiClient';
import Navbar from '@/components/Navbar';

const FileInput = ({ label, accepted, file, onFileChange }: any) => (
  <VStack w="full" align="start">
    <FormLabel>{label}</FormLabel>
    <Input type="file" accept={accepted} onChange={onFileChange} p={1.5} border="1px dashed" borderColor="gray.300" />
    {file && <Text mt={2} fontSize="sm" color="green.500"><Icon as={FiCheck} mr={1} /> {file.name}</Text>}
  </VStack>
);

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [preprocessorFile, setPreprocessorFile] = useState<File | null>(null);
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [hasPreprocessor, setHasPreprocessor] = useState<boolean | null>(null);
  const [modelName, setModelName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  
  const toast = useToast();
  const router = useRouter();
  const auth = useAuth();

  const handleUpload = async () => {
    if (!auth?.user_id || !modelFile || !datasetFile) return;
    setIsUploading(true);

    const payload = {
      modelFile,
      datasetFile,
      modelName: modelName.trim(),
      targetColumn: targetColumn.trim(),
      userId: auth.user_id,
      preprocessorFile,
      trainingFile, // We can add it directly
    };

    try {
      const response = await startEvaluation({
          modelFile,
          datasetFile,
          modelName: modelName.trim(),
          targetColumn: targetColumn.trim(),
          userId: auth.user_id,
          preprocessorFile,
      });
      toast({ title: '🚀 Evaluation Started!', status: 'success', isClosable: true });
      router.push(`/evaluations/${response.job_id}`);
    } catch (error) {
      setIsUploading(false); // The global toast in apiClient will show the error
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">Step 1: Your Model</Heading>
            <Input placeholder="Enter Model Name (e.g., 'Iris Classifier v1')" value={modelName} onChange={(e) => setModelName(e.target.value)} />
            <FileInput label="Upload Model File (.pkl / .joblib)" accepted=".pkl,.joblib" file={modelFile} onFileChange={(e: ChangeEvent<HTMLInputElement>) => setModelFile(e.target.files?.[0] || null)} />
            <Divider />
            <FormLabel textAlign="center">Did this model require a separate preprocessor file?</FormLabel>
            <HStack justify="center">
              <Button colorScheme="purple" variant={hasPreprocessor === false ? 'solid' : 'outline'} onClick={() => { setHasPreprocessor(false); setPreprocessorFile(null); }}>No, just the model</Button>
              <Button colorScheme="purple" variant={hasPreprocessor === true ? 'solid' : 'outline'} onClick={() => setHasPreprocessor(true)}>Yes, I have one</Button>
            </HStack>
            {hasPreprocessor === true && (
              <FileInput label="Upload Preprocessor File (.pkl)" accepted=".pkl" file={preprocessorFile} onFileChange={(e: ChangeEvent<HTMLInputElement>) => setPreprocessorFile(e.target.files?.[0] || null)} />
            )}
            <Button
              alignSelf="flex-end"
              colorScheme="purple"
              rightIcon={<FiArrowRight />}
              isDisabled={!modelFile || !modelName.trim() || hasPreprocessor === null || (hasPreprocessor === true && !preprocessorFile)}
              onClick={() => setStep(2)}
            >
              Next Step
            </Button>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">Step 2: Evaluation Data</Heading>
            <Input placeholder="Enter Target Column Name (e.g., 'species')" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} />
            <FileInput label="Upload Test Dataset (.csv)" accepted=".csv" file={datasetFile} onFileChange={(e: ChangeEvent<HTMLInputElement>) => setDatasetFile(e.target.files?.[0] || null)} />
            {hasPreprocessor === false && ( // Only show this in "Simple Mode"
              <FileInput 
                label="Training Data Sample (.csv) - Optional, but recommended for accuracy" 
                accepted=".csv" 
                file={trainingFile} 
                onFileChange={(e: ChangeEvent<HTMLInputElement>) => setTrainingFile(e.target.files?.[0] || null)} 
              />
            )}
            <HStack w="full" justify="space-between" mt={4}>
              <Button leftIcon={<FiArrowLeft />} onClick={() => setStep(1)}>Back</Button>
              <Button
                colorScheme="green"
                leftIcon={<FiUploadCloud />}
                isLoading={isUploading}
                isDisabled={!datasetFile || !targetColumn.trim()}
                onClick={handleUpload}
              >
                Start Evaluation
              </Button>
            </HStack>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="2xl" py={12}>
          <VStack spacing={6}>
            <Heading textAlign="center">Create New Evaluation</Heading>
            <Progress value={(step / 2) * 100} colorScheme="purple" size="sm" w="full" borderRadius="full" />
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="2xl" borderRadius="2xl" w="full">
              <CardBody p={8}>
                {renderStep()}
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </>
  );
}