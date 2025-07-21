'use client'

import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const session = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Flex
      bg="teal.500"
      color="white"
      px={6}
      py={4}
      justify="space-between"
      align="center"
    >
      <Heading size="md">ModelWhiz</Heading>

      <Menu>
        <MenuButton>
          <Avatar name={session?.user.email || 'U'} size="sm" />
        </MenuButton>
        <MenuList>
          <MenuItem isDisabled>{session?.user.email}</MenuItem>
          <MenuItem onClick={() => router.push('/upload')}>Upload Model</MenuItem>
          <MenuItem onClick={() => router.push('/dashboard')}>Dashboard</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  )
}
