'use client'

import { Box, Button, Heading, Text } from '@chakra-ui/react'

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDir="column" alignItems="center" justifyContent="center">
      <Heading size="2xl" color="teal.500">🚀 ModelWhiz Dashboard</Heading>
      <Text mt={4} fontSize="lg">Chakra UI is working perfectly.</Text>
      <Button mt={6} colorScheme="teal">Get Started</Button>
    </Box>
  )
}
