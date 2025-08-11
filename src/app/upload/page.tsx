// modelwhiz-frontend/src/app/upload/page.tsx
'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Button, Heading, Input, VStack, useToast, Text, Container, Card, CardBody, Icon, Flex, useColorModeValue, Divider, SimpleGrid, FormLabel
} from '@chakra-ui/react'
import { FiUploadCloud, FiCheck } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { startEvaluation } from '@/lib/apiClient'

export default function UploadPage() {
  const [modelPackage, setModelPackage] = useState<File | null>(null)
  const [datasetFile, setDatasetFile] = useState<File | null>(null)
  const [modelName, setModelName] = useState('')
  const [targetColumn, setTargetColumn] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  
  const toast = useToast()
  const router = useRouter()
  const auth = useAuth() 

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'model' | 'dataset') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'model') setModelPackage(file)
      else setDatasetFile(file)
    }
  }

  const handleUpload = async () => {
    if (!auth?.user_id) {
      toast({ title: 'Authentication Error', status: 'error', duration: 3000, isClosable: true })
      return
    }
    // This check is good, but the disabled button provides better UX
    if (!modelPackage || !datasetFile || !modelName.trim() || !targetColumn.trim()) {
      toast({ title: 'All fields are required', status: 'warning', duration: 3000, isClosable: true })
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('model_package', modelPackage)
    formData.append('dataset', datasetFile)
    formData.append('model_name', modelName.trim())
    formData.append('target_column', targetColumn.trim())
    formData.append('user_id', auth.user_id)

    try {
      const response = await startEvaluation(formData);
      toast({ title: '🚀 Evaluation Started!', description: 'You will be redirected to the results page.', status: 'success' })
      router.push(`/evaluations/${response.job_id}`)
    } catch (error: any) {
      // The global error handler will now show the toast, but we still need to stop the spinner
      setIsUploading(false)
    }
  }

  // --- vvv NEW: Logic to check if the form is valid vvv ---
  const isFormValid = modelPackage && datasetFile && modelName.trim() && targetColumn.trim();
  // --- ^^^ END OF NEW LOGIC ^^^ ---

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="4xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Icon as={FiUploadCloud} w={16} h={16} color="purple.500" mb={4} />
            <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Create New Evaluation
            </Heading>
            <Text fontSize="lg" color="gray.500" mt={2}>
              Upload your model and data to get instant insights
            </Text>
          </Box>

          <Card bg={useColorModeValue('white', 'gray.800')} shadow="2xl" borderRadius="2xl">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <FormLabel>Model Name</FormLabel>
                  <Input placeholder="e.g., 'Sales Predictor v1.0'" value={modelName} onChange={(e) => setModelName(e.target.value)} size="lg" />
                </Box>
                 <Box>
                  <FormLabel>Target Column Name</FormLabel>
                  <Input placeholder="The exact name of the column you want to predict" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} size="lg" />
                </Box>
                
                <Divider />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <FormLabel>Model Package (.zip)</FormLabel>
                     <Input type="file" accept=".zip" onChange={(e) => handleFileChange(e, 'model')} p={2} border="1px dashed gray"/>
                     {modelPackage && <Text mt={2} color="green.500"><Icon as={FiCheck} /> {modelPackage.name}</Text>}
                  </Box>
                   <Box>
                    <FormLabel>Test Dataset (.csv)</FormLabel>
                     <Input type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'dataset')} p={2} border="1px dashed gray"/>
                     {datasetFile && <Text mt={2} color="green.500"><Icon as={FiCheck} /> {datasetFile.name}</Text>}
                  </Box>
                </SimpleGrid>

                <Divider />

                <Flex justify="center">
                  <Button
                    size="lg" colorScheme="purple" onClick={handleUpload} isLoading={isUploading}
                    loadingText="Starting..." leftIcon={<FiUploadCloud />}
                    // --- vvv THIS IS THE CHANGE vvv ---
                    isDisabled={!isFormValid || isUploading}
                    // --- ^^^ THIS IS THE CHANGE ^^^ ---
                  >
                    Start Evaluation
                  </Button>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}