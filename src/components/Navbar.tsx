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
  Text,
  MenuDivider,
  useColorModeValue,
  HStack,
  Icon,
  IconProps
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// ...existing code...
import { FaArrowUp, FaArrowDown, FaRocket, FaTrophy, FaChartLine, FaEye, FaLayerGroup, FaHistory } from 'react-icons/fa';
// ...existing code...

// Simple icons as SVG components
const UploadIcon = (props : IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
    />
  </Icon>
)

const DashboardIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"
    />
  </Icon>
)

const LogoutIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
    />
  </Icon>
)

export default function Navbar() {
  const router = useRouter()
  const auth = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Box
      bg="teal.500"
      shadow="lg"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px={6}
        py={4}
        justify="space-between"
        align="center"
      >
        {/* Logo/Brand */}
        <HStack spacing={4}>
          <Box
            bg="white"
            color="teal.500"
            p={2}
            borderRadius="lg"
            fontWeight="bold"
            fontSize="lg"
          >
            MW
          </Box>
          <Heading 
            size="lg" 
            color="white"
            fontWeight="bold"
            letterSpacing="tight"
          >
            ModelWhiz
          </Heading>
        </HStack>

        {/* User Menu */}
        <Menu>
          <MenuButton
            as={Button}
            rounded="full"
            variant="ghost"
            cursor="pointer"
            minW={0}
            _hover={{
              bg: "teal.600"
            }}
            _active={{
              bg: "teal.700"
            }}
            transition="all 0.2s"
          >
            <HStack spacing={2}>
              <Avatar 
                name={auth?.user?.email ?? 'User'} 
                size="sm"
                bg="white"
                color="teal.500"
              />
              <Text 
                color="white" 
                fontSize="sm" 
                fontWeight="medium"
                display={{ base: "none", md: "block" }}
              >
                {auth?.user?.email?.split('@')[0] ?? 'User'}
              </Text>
            </HStack>
          </MenuButton>
          
          <MenuList
            bg="white"
            borderColor="gray.200"
            shadow="xl"
            border="1px"
            borderRadius="xl"
            py={2}
            minW="200px"
          >
            {/* User Info */}
            <Box px={4} py={2} mb={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                Signed in as
              </Text>
              <Text fontSize="sm" color="gray.600" isTruncated>
                {auth?.user?.email ?? 'Loading...'}
              </Text>
            </Box>
            
            <MenuDivider />
            
            {/* Navigation Items */}
            <MenuItem
              onClick={() => router.push('/dashboard')}
              color="gray.700"
              _hover={{ bg: "teal.50", color: "teal.600" }}
              _focus={{ bg: "teal.50", color: "teal.600" }}
              icon={<DashboardIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Dashboard
            </MenuItem>
            
            <MenuItem
                onClick={() => router.push('/dashboard/evaluations')}
                icon={<Icon as={FaHistory} />} // Use an appropriate icon
                fontSize="sm"
                fontWeight="medium"
                _hover={{ bg: "teal.50", color: "teal.600" }}
              >
                Evaluation History
            </MenuItem>

            <MenuItem
              onClick={() => router.push('/upload')}
              color="gray.700"
              _hover={{ bg: "teal.50", color: "teal.600" }}
              _focus={{ bg: "teal.50", color: "teal.600" }}
              icon={<UploadIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Upload Model
            </MenuItem>
            
            <MenuDivider />
            
            <MenuItem
              onClick={handleLogout}
              color="red.600"
              _hover={{ bg: "red.50", color: "red.700" }}
              _focus={{ bg: "red.50", color: "red.700" }}
              icon={<LogoutIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}