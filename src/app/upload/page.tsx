// old upload/page.ts code

'use client'

import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  HStack,
  useToast,
  Text,
  Container,
  Card,
  CardBody,
  Icon,
  Progress,
  Badge,
  Flex,
  useColorModeValue,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react'
import { ChangeEvent, useState, useRef } from 'react'
import { FiUploadCloud, FiFile, FiDatabase, FiCheck, FiX } from 'react-icons/fi'
import apiClient from '@/lib/apiClient'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function UploadPage() {
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState<'model' | 'csv' | null>(null)
  
  const modelInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const router = useRouter()
  const auth = useAuth() 

  // Theme colors
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'model' | 'csv') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'model') setModelFile(file)
      else setCsvFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'model' | 'csv') => {
    e.preventDefault()
    setDragOver(null)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (type === 'model') {
        if (file.name.endsWith('.pkl') || file.name.endsWith('.joblib')) {
          setModelFile(file)
        } else {
          toast({
            title: 'Invalid file type',
            description: 'Please upload a .pkl or .joblib file',
            status: 'error',
          })
        }
      } else {
        if (file.name.endsWith('.csv')) {
          setCsvFile(file)
        } else {
          toast({
            title: 'Invalid file type',
            description: 'Please upload a .csv file',
            status: 'error',
          })
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent, type: 'model' | 'csv') => {
    e.preventDefault()
    setDragOver(type)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const handleUpload = async () => {
      if (!auth) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to upload a model.',
          status: 'error',
        });
        return;
      }

      const userId = auth.user_id;
      if (!userId) {
        toast({
          title: 'User ID missing',
          description: 'Unable to get user ID from session.',
          status: 'error',
        });
        return;
      }

      if (!modelFile || !name.trim()) {
        toast({
          title: 'Missing fields',
          description: 'Please provide a model name and model file.',
          status: 'warning',
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('model_file', modelFile);
      formData.append('name', name.trim());
      formData.append('user_id', userId);
      if (csvFile) formData.append('test_file', csvFile);

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 20;
          });
        }, 200);

        await apiClient.post('/models/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        toast({
          title: '🎉 Model Uploaded!',
          description: csvFile
            ? 'Your model and test file were successfully evaluated.'
            : 'Your model is ready to view in the dashboard.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } catch (error: any) {
        setUploadProgress(0);
        const message =
          error?.response?.data?.detail ||
          error?.message ||
          'Something went wrong during upload.';
        toast({
          title: '❌ Upload failed',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
      }
    };


  const removeFile = (type: 'model' | 'csv') => {
    if (type === 'model') {
      setModelFile(null)
      if (modelInputRef.current) modelInputRef.current.value = ''
    } else {
      setCsvFile(null)
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Icon as={FiUploadCloud} w={16} h={16} color={accentColor} mb={4} />
            <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Upload Your Model
            </Heading>
            <Text fontSize="lg" color="gray.500" mt={2}>
              Deploy your machine learning model in seconds
            </Text>
          </Box>

          {/* Upload Progress */}
          {isUploading && (
            <Card bg={cardBg} shadow="xl">
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="semibold">Uploading your model...</Text>
                  <Progress
                    value={uploadProgress}
                    size="lg"
                    colorScheme="blue"
                    w="full"
                    borderRadius="full"
                    bg="gray.100"
                  />
                  <Text fontSize="sm" color="gray.500">
                    {Math.round(uploadProgress)}% complete
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Main Upload Form */}
          <Card bg={cardBg} shadow="2xl" borderRadius="2xl">
            <CardBody p={8}>
              <VStack spacing={8} align="stretch">
                {/* Model Name Input */}
                <Box>
                  <Text fontWeight="semibold" mb={3} fontSize="lg">
                    Model Information
                  </Text>
                  <Input
                    placeholder="Enter your model name (e.g., 'Sales Predictor v1.0')"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    border="2px"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                </Box>

                <Divider />

                {/* File Upload Section */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {/* Model File Upload */}
                  <Box>
                    <Text fontWeight="semibold" mb={3} fontSize="lg">
                      Model File
                      <Badge ml={2} colorScheme="red" variant="subtle">Required</Badge>
                    </Text>
                    
                    <Box
                      border="3px dashed"
                      borderColor={dragOver === 'model' ? accentColor : borderColor}
                      borderRadius="xl"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.3s"
                      bg={dragOver === 'model' ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                      _hover={{
                        borderColor: accentColor,
                        bg: useColorModeValue('blue.50', 'blue.900'),
                      }}
                      onClick={() => modelInputRef.current?.click()}
                      onDrop={(e) => handleDrop(e, 'model')}
                      onDragOver={(e) => handleDragOver(e, 'model')}
                      onDragLeave={handleDragLeave}
                    >
                      <Input
                        ref={modelInputRef}
                        type="file"
                        accept=".pkl,.joblib"
                        onChange={(e) => handleFileChange(e, 'model')}
                        display="none"
                      />
                      
                      {modelFile ? (
                        <VStack spacing={3}>
                          <Icon as={FiCheck} w={8} h={8} color="green.500" />
                          <Text fontWeight="semibold" color="green.500">
                            {modelFile.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {(modelFile.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<FiX />}
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile('model')
                            }}
                          >
                            Remove
                          </Button>
                        </VStack>
                      ) : (
                        <VStack spacing={3}>
                          <Icon as={FiFile} w={12} h={12} color="gray.400" />
                          <VStack spacing={1}>
                            <Text fontWeight="semibold">
                              Drop your model here or click to browse
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Supports .pkl and .joblib files
                            </Text>
                          </VStack>
                        </VStack>
                      )}
                    </Box>
                  </Box>

                  {/* CSV Test File Upload */}
                  <Box>
                    <Text fontWeight="semibold" mb={3} fontSize="lg">
                      Test Data
                      <Badge ml={2} colorScheme="blue" variant="subtle">Optional</Badge>
                    </Text>
                    
                    <Box
                      border="3px dashed"
                      borderColor={dragOver === 'csv' ? accentColor : borderColor}
                      borderRadius="xl"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.3s"
                      bg={dragOver === 'csv' ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                      _hover={{
                        borderColor: accentColor,
                        bg: useColorModeValue('blue.50', 'blue.900'),
                      }}
                      onClick={() => csvInputRef.current?.click()}
                      onDrop={(e) => handleDrop(e, 'csv')}
                      onDragOver={(e) => handleDragOver(e, 'csv')}
                      onDragLeave={handleDragLeave}
                    >
                      <Input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, 'csv')}
                        display="none"
                      />
                      
                      {csvFile ? (
                        <VStack spacing={3}>
                          <Icon as={FiCheck} w={8} h={8} color="green.500" />
                          <Text fontWeight="semibold" color="green.500">
                            {csvFile.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {(csvFile.size / 1024).toFixed(2)} KB
                          </Text>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<FiX />}
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile('csv')
                            }}
                          >
                            Remove
                          </Button>
                        </VStack>
                      ) : (
                        <VStack spacing={3}>
                          <Icon as={FiDatabase} w={12} h={12} color="gray.400" />
                          <VStack spacing={1}>
                            <Text fontWeight="semibold">
                              Upload test CSV (optional)
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              For testing predictions after upload
                            </Text>
                          </VStack>
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </SimpleGrid>

                <Divider />

                {/* Upload Button */}
                <Flex justify="center">
                  <Button
                      size="lg"
                      colorScheme="blue"
                      onClick={handleUpload}
                      isLoading={isUploading}
                      loadingText="Uploading..."
                      leftIcon={<FiUploadCloud />}
                      borderRadius="xl"
                      px={12}
                      py={6}
                      fontSize="lg"
                      fontWeight="bold"
                      bgGradient="linear(to-r, blue.500, purple.500)"
                      _hover={{
                        bgGradient: 'linear(to-r, blue.600, purple.600)',
                        transform: 'translateY(-2px)',
                      }}
                      _active={{ transform: 'translateY(0)' }}
                      transition="all 0.3s"
                      shadow="lg"
                      disabled={!modelFile || !name.trim() || isUploading}
                    >
                      {isUploading ? 'Uploading Model...' : 'Deploy Model'}
                    </Button>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Info Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} shadow="lg">
              <CardBody textAlign="center" py={6}>
                <Icon as={FiFile} w={8} h={8} color="blue.500" mb={3} />
                <Text fontWeight="semibold" mb={2}>Supported Formats</Text>
                <Text fontSize="sm" color="gray.500">
                  .pkl and .joblib model files
                </Text>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} shadow="lg">
              <CardBody textAlign="center" py={6}>
                <Icon as={FiUploadCloud} w={8} h={8} color="green.500" mb={3} />
                <Text fontWeight="semibold" mb={2}>Fast Deployment</Text>
                <Text fontSize="sm" color="gray.500">
                  Models are ready in seconds
                </Text>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} shadow="lg">
              <CardBody textAlign="center" py={6}>
                <Icon as={FiDatabase} w={8} h={8} color="purple.500" mb={3} />
                <Text fontWeight="semibold" mb={2}>Auto Testing</Text>
                <Text fontSize="sm" color="gray.500">
                  Optional CSV for instant validation
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}