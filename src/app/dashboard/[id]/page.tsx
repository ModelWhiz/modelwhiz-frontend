'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  Divider,
} from '@chakra-ui/react'

type Metric = {
  accuracy: number
  f1_score: number
  auc: number
  timestamp?: string
}

type Model = {
  id: number
  name: string
  filename: string
  upload_time: string
  accuracy: number | null
  f1_score: number | null
  auc: number | null
  metrics: Metric[]
}

export default function ModelDetailsPage() {
  const { id } = useParams()
  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await apiClient.get(`/models/`)
        const found = response.data.find((m: Model) => m.id === Number(id))
        setModel(found)
      } catch (error) {
        console.error('Error fetching model:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModel()
  }, [id])

  if (loading) return <Spinner size="xl" />
  if (!model) return <Text>Model not found</Text>

  return (
    <Box p={8}>
      <Heading mb={4}>{model.name}</Heading>
      <Text>Uploaded: {new Date(model.upload_time).toLocaleString()}</Text>
      <Text>Filename: {model.filename}</Text>

      <Divider my={4} />

      <Heading size="md" mb={2}>Evaluation Metrics</Heading>
      <VStack align="start" spacing={2}>
        <Text>Accuracy: {model.accuracy ?? 'N/A'}</Text>
        <Text>F1 Score: {model.f1_score ?? 'N/A'}</Text>
        <Text>AUC: {model.auc ?? 'N/A'}</Text>
      </VStack>

      <Divider my={4} />

      <Button
        colorScheme="blue"
        onClick={() =>
          window.open(`http://localhost:8000/uploads/${model.filename}`, '_blank')
        }
      >
        Download Model
      </Button>
    </Box>
  )
}
