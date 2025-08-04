'use client'

import { Box, Button, Heading, Input, VStack, useToast, Container, Card, CardBody, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
      })
    } else {
      toast({
        title: 'Login successful!',
        status: 'success',
      })
      router.push('/dashboard') // or wherever you want to redirect after login
    }
  }

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #4FD1C7 0%, #B794F6 100%)" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      p={4}
    >
      <Container maxW="md">
        <Card 
          bg="white" 
          shadow="2xl" 
          borderRadius="2xl"
          border="none"
        >
          <CardBody p={10}>
            <VStack spacing={8}>
              {/* Header */}
              <VStack spacing={2}>
                <Heading 
                  size="xl" 
                  color="gray.800" 
                  textAlign="center"
                  fontWeight="bold"
                >
                  Login
                </Heading>
                <Text 
                  color="gray.600" 
                  textAlign="center" 
                  fontSize="lg"
                >
                  Welcome back to ModelWhiz
                </Text>
              </VStack>

              {/* Form */}
              <VStack spacing={6} w="full">
                <Input 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ 
                    borderColor: "teal.500", 
                    boxShadow: "0 0 0 1px #4FD1C7"
                  }}
                />
                <Input 
                  placeholder="Password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{ 
                    borderColor: "teal.500", 
                    boxShadow: "0 0 0 1px #4FD1C7"
                  }}
                />
                <Button 
                  colorScheme="teal" 
                  onClick={handleLogin}
                  size="lg"
                  w="full"
                  borderRadius="lg"
                  bg="teal.500"
                  _hover={{ bg: "teal.600", transform: "translateY(-2px)" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  fontWeight="semibold"
                >
                  Login
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}