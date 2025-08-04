'use client'

import { Box, Button, Heading, Input, VStack, useToast, Container, Card, CardBody, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'



export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleSignup = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setIsLoading(false)

    if (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        status: 'error',
      })
    } else {
      toast({
        title: 'Check your email to confirm your account.',
        status: 'success',
      })
      router.push('/login') // Redirect to login after successful signup
    }
  }

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #B794F6 0%, #4FD1C7 100%)" 
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
                  Sign Up
                </Heading>
                <Text 
                  color="gray.600" 
                  textAlign="center" 
                  fontSize="lg"
                >
                  Join ModelWhiz today
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
                    borderColor: "purple.500", 
                    boxShadow: "0 0 0 1px #B794F6"
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
                    borderColor: "purple.500", 
                    boxShadow: "0 0 0 1px #B794F6"
                  }}
                />
                <Button 
                  colorScheme="purple" 
                  onClick={handleSignup}
                  size="lg"
                  w="full"
                  borderRadius="lg"
                  bg="purple.500"
                  _hover={{ bg: "purple.600", transform: "translateY(-2px)" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  fontWeight="semibold"
                >
                  Sign Up
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}