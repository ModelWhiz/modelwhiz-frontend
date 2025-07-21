'use client'

import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  useToast,
  Text
} from '@chakra-ui/react'
import { ChangeEvent, useState } from 'react'
import apiClient from '@/lib/apiClient'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const toast = useToast()
  const router = useRouter()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'model' | 'csv') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'model') setModelFile(file)
      else setCsvFile(file)
    }
  }

  const handleUpload = async () => {
    if (!modelFile || !name.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please provide a model name and model file.',
        status: 'warning'
      })
      return
    }

    const formData = new FormData()
    formData.append('file', modelFile)
    formData.append('name', name.trim())
    if (csvFile) formData.append('test_file', csvFile)

    try {
      await apiClient.post('/models/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast({
        title: '✅ Model uploaded successfully!',
        status: 'success'
      })

      router.push('/dashboard')
    } catch (error: any) {
      const message =
        typeof error === 'string'
          ? error
          : error?.response?.data?.detail ||
            error?.message ||
            'Something went wrong'

      toast({
        title: '❌ Upload failed',
        description: typeof message === 'string' ? message : JSON.stringify(message),
        status: 'error',
        isClosable: true
      })

      console.error('Upload error:', error)
    }
  }

  return (
    <Box p={10}>
      <Heading mb={6}>Upload New Model</Heading>
      <VStack spacing={4} align="stretch">
        <Input
          placeholder="Model Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          type="file"
          accept=".pkl,.joblib"
          onChange={(e) => handleFileChange(e, 'model')}
        />
        <Text fontSize="sm" color="gray.500">
          Optional: Upload test CSV file (for predictions)
        </Text>
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileChange(e, 'csv')}
        />

        <Button colorScheme="teal" onClick={handleUpload}>
          Upload
        </Button>
      </VStack>
    </Box>
  )
}
