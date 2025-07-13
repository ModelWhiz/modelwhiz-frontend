'use client'

import { Box, Button, Heading, Input, VStack, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const router = useRouter()

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password })

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
    <Box p={10}>
      <Heading mb={6}>Sign Up</Heading>
      <VStack spacing={4}>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="teal" onClick={handleSignup}>Sign Up</Button>
      </VStack>
    </Box>
  )
}
