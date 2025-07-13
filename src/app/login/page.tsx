'use client'

import { Box, Button, Heading, Input, VStack, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const toast = useToast()
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
    <Box p={10}>
      <Heading mb={6}>Login</Heading>
      <VStack spacing={4}>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button colorScheme="teal" onClick={handleLogin}>Login</Button>
      </VStack>
    </Box>
  )
}
