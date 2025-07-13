'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import {
  Box,
  Grid,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
} from '@chakra-ui/react'

type Model = {
  id: string
  name: string
  accuracy: number
  created_at: string
}

export default function DashboardPage() {
  const session = useAuth()
  const router = useRouter()
  const [models, setModels] = useState<Model[]>([])

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else {
      // 🚧 Replace this with an actual API call
      setModels([
        {
          id: '1',
          name: 'XGBoost Classifier',
          accuracy: 0.92,
          created_at: '2025-07-01',
        },
        {
          id: '2',
          name: 'Random Forest',
          accuracy: 0.89,
          created_at: '2025-06-20',
        },
      ])
    }
  }, [session])

  if (!session) return null

  return (
    <>
      <Navbar />
      <Box p={6}>
        <Heading mb={6}>Your Uploaded Models</Heading>

        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          {models.map((model) => (
            <Card key={model.id}>
              <CardHeader fontWeight="bold">{model.name}</CardHeader>
              <CardBody>
                <Text>Accuracy: {model.accuracy}</Text>
                <Text>Uploaded on: {model.created_at}</Text>
                <Button mt={4} colorScheme="teal">
                  View Metrics
                </Button>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>
    </>
  )
}
