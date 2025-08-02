'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Button,
  Checkbox,
  HStack,
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  useColorModeValue,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Tooltip,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Dot,
} from 'recharts'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaChartLine,
  FaHistory,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaTrophy,
  FaStar,
  FaFire,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from 'react-icons/fa'

// Motion components
const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionCard = motion(Card)

// Custom Dot Component for chart points
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props
  if (!payload || cx === undefined || cy === undefined) return null
  
  const colors = {
    accuracy: '#3182ce',
    f1_score: '#38a169',
    auc: '#d69e2e'
  }
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={colors[dataKey as keyof typeof colors]}
      stroke="white"
      strokeWidth={2}
      style={{
        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
        cursor: 'pointer'
      }}
    />
  )
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="white"
        p={4}
        borderRadius="xl"
        boxShadow="2xl"
        border="1px"
        borderColor="gray.200"
        backdropFilter="blur(10px)"
      >
        <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
          {new Date(label).toLocaleDateString()}
        </Text>
        <VStack spacing={2} align="start">
          {payload.map((entry: any, index: number) => (
            <HStack key={index} spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg={entry.color} />
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {entry.name === 'accuracy' ? 'Accuracy' :
                 entry.name === 'f1_score' ? 'F1 Score' : 'AUC'}:
              </Text>
              <Text fontSize="sm" fontWeight="bold" color={entry.color}>
                {entry.value.toFixed(3)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    )
  }
  return null
}

export default function MetricsChart({ metrics }: { metrics: any[] }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showAccuracy, setShowAccuracy] = useState(true)
  const [showF1, setShowF1] = useState(true)
  const [showAUC, setShowAUC] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'area'>('line')

  // Color mode values
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50, blue.50)',
    'linear(to-br, purple.900, pink.900, blue.900)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')
  const modalBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.700', 'gray.200')

  const sorted = [...metrics].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Calculate trends and statistics
  const stats = useMemo(() => {
    if (sorted.length < 2) return null

    const latest = sorted[sorted.length - 1]
    const previous = sorted[sorted.length - 2]

    const calculateTrend = (current: number, prev: number) => {
      const change = ((current - prev) / prev) * 100
      return {
        change: change.toFixed(1),
        isPositive: change > 0,
        isNeutral: Math.abs(change) < 0.1
      }
    }

    return {
      accuracy: latest.accuracy ? calculateTrend(latest.accuracy, previous.accuracy) : null,
      f1_score: latest.f1_score ? calculateTrend(latest.f1_score, previous.f1_score) : null,
      auc: latest.auc ? calculateTrend(latest.auc, previous.auc) : null,
      totalEvaluations: sorted.length,
      latestDate: new Date(latest.timestamp).toLocaleDateString(),
      bestAccuracy: Math.max(...sorted.map(m => m.accuracy || 0)),
      bestF1: Math.max(...sorted.map(m => m.f1_score || 0)),
      bestAUC: Math.max(...sorted.map(m => m.auc || 0)),
    }
  }, [sorted])

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 25px rgba(139, 92, 246, 0.3)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  }

  const StatCard = ({ title, value, trend, color, icon }: any) => (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      bg={cardBg}
      borderRadius="xl"
      boxShadow="lg"
      border="1px"
      borderColor={`${color}.100`}
      overflow="hidden"
      whileHover={{
        y: -2,
        boxShadow: `0px 8px 25px rgba(139, 92, 246, 0.2)`,
        transition: { duration: 0.2 }
      }}
    >
      <CardHeader bg={`${color}.50`} py={3}>
        <HStack spacing={2}>
          <Icon as={icon} color={`${color}.500`} />
          <Text fontSize="sm" fontWeight="bold" color={`${color}.700`}>
            {title}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody py={4}>
        <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`} mb={1}>
          {value}
        </Text>
        {trend && (
          <HStack spacing={1} fontSize="sm">
            <Icon
              as={trend.isNeutral ? FaMinus : trend.isPositive ? FaArrowUp : FaArrowDown}
              color={trend.isNeutral ? 'gray.500' : trend.isPositive ? 'green.500' : 'red.500'}
            />
            <Text
              color={trend.isNeutral ? 'gray.500' : trend.isPositive ? 'green.500' : 'red.500'}
              fontWeight="medium"
            >
              {trend.change}%
            </Text>
          </HStack>
        )}
      </CardBody>
    </MotionCard>
  )

  const ChartToggle = ({ label, checked, onChange, color }: any) => (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <HStack
        spacing={3}
        p={3}
        borderRadius="xl"
        bg={checked ? `${color}.50` : 'gray.50'}
        border="2px"
        borderColor={checked ? `${color}.200` : 'gray.200'}
        cursor="pointer"
        onClick={() => onChange(!checked)}
        transition="all 0.2s"
        _hover={{
          borderColor: `${color}.300`,
          bg: `${color}.50`
        }}
      >
        <Icon
          as={checked ? FaToggleOn : FaToggleOff}
          color={checked ? `${color}.500` : 'gray.400'}
          boxSize={5}
        />
        <Text
          fontWeight="medium"
          color={checked ? `${color}.700` : 'gray.500'}
        >
          {label}
        </Text>
        {checked && (
          <Badge colorScheme={color} borderRadius="full" fontSize="xs">
            ON
          </Badge>
        )}
      </HStack>
    </MotionBox>
  )

  return (
    <>
      <MotionButton
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        mt={2}
        colorScheme="purple"
        onClick={onOpen}
        leftIcon={<FaHistory />}
        borderRadius="xl"
        boxShadow="md"
        fontWeight="semibold"
        size="md"
      >
        View History
      </MotionButton>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          style={{ margin: '2rem' }}
        >
          <ModalContent
            borderRadius="2xl"
            bg={modalBg}
            maxH="90vh"
            overflow="hidden"
          >
            <ModalHeader
              bgGradient="linear(to-r, purple.500, pink.500, blue.500)"
              color="white"
              borderTopRadius="2xl"
              py={6}
            >
              <HStack spacing={3}>
                <FaChartLine size="24px" />
                <Text fontSize="xl" fontWeight="bold">
                  Model Performance Analytics
                </Text>
                <Badge colorScheme="whiteAlpha" borderRadius="full">
                  {sorted.length} evaluations
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />

            <ModalBody p={6} maxH="calc(90vh - 100px)" overflowY="auto">
              <VStack spacing={6} align="stretch">
                {/* Statistics Cards */}
                {stats && (
                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                    <StatCard
                      title="Accuracy"
                      value={stats.bestAccuracy.toFixed(3)}
                      trend={stats.accuracy}
                      color="purple"
                      icon={FaTrophy}
                    />
                    <StatCard
                      title="F1 Score"
                      value={stats.bestF1.toFixed(3)}
                      trend={stats.f1_score}
                      color="blue"
                      icon={FaStar}
                    />
                    <StatCard
                      title="AUC"
                      value={stats.bestAUC.toFixed(3)}
                      trend={stats.auc}
                      color="green"
                      icon={FaFire}
                    />
                  </Grid>
                )}

                <Divider />

                {/* Chart Controls */}
                <Box>
                  <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={4}>
                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                      Performance Trends
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant={chartType === 'line' ? 'solid' : 'outline'}
                        colorScheme="purple"
                        onClick={() => setChartType('line')}
                        borderRadius="lg"
                      >
                        Line Chart
                      </Button>
                      <Button
                        size="sm"
                        variant={chartType === 'area' ? 'solid' : 'outline'}
                        colorScheme="purple"
                        onClick={() => setChartType('area')}
                        borderRadius="lg"
                      >
                        Area Chart
                      </Button>
                    </HStack>
                  </Flex>

                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
                    <ChartToggle
                      label="Accuracy"
                      checked={showAccuracy}
                      onChange={setShowAccuracy}
                      color="purple"
                    />
                    <ChartToggle
                      label="F1 Score"
                      checked={showF1}
                      onChange={setShowF1}
                      color="blue"
                    />
                    <ChartToggle
                      label="AUC"
                      checked={showAUC}
                      onChange={setShowAUC}
                      color="green"
                    />
                  </Grid>
                </Box>

                {/* Enhanced Chart */}
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor="purple.100"
                >
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' ? (
                      <LineChart data={sorted} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="url(#gridGradient)"
                          strokeWidth={1}
                        />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          stroke="#64748b"
                          fontSize={12}
                          fontWeight={500}
                        />
                        <YAxis
                          domain={[0, 1]}
                          stroke="#64748b"
                          fontSize={12}
                          fontWeight={500}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        />
                        {showAccuracy && (
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={<CustomDot dataKey="accuracy" />}
                            activeDot={{
                              r: 6,
                              stroke: '#8B5CF6',
                              strokeWidth: 2,
                              fill: 'white'
                            }}
                            name="Accuracy"
                          />
                        )}
                        {showF1 && (
                          <Line
                            type="monotone"
                            dataKey="f1_score"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={<CustomDot dataKey="f1_score" />}
                            activeDot={{
                              r: 6,
                              stroke: '#3B82F6',
                              strokeWidth: 2,
                              fill: 'white'
                            }}
                            name="F1 Score"
                          />
                        )}
                        {showAUC && (
                          <Line
                            type="monotone"
                            dataKey="auc"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={<CustomDot dataKey="auc" />}
                            activeDot={{
                              r: 6,
                              stroke: '#10B981',
                              strokeWidth: 2,
                              fill: 'white'
                            }}
                            name="AUC"
                          />
                        )}
                        <ReferenceLine y={0.8} stroke="#F59E0B" strokeDasharray="5 5" />
                        <ReferenceLine y={0.9} stroke="#EF4444" strokeDasharray="5 5" />
                      </LineChart>
                    ) : (
                      <AreaChart data={sorted} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="f1Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="aucGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis domain={[0, 1]} stroke="#64748b" fontSize={12} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        {showAccuracy && (
                          <Area
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            fill="url(#accuracyGradient)"
                            name="Accuracy"
                          />
                        )}
                        {showF1 && (
                          <Area
                            type="monotone"
                            dataKey="f1_score"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            fill="url(#f1Gradient)"
                            name="F1 Score"
                          />
                        )}
                        {showAUC && (
                          <Area
                            type="monotone"
                            dataKey="auc"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#aucGradient)"
                            name="AUC"
                          />
                        )}
                      </AreaChart>
                    )}
                  </ResponsiveContainer>

                  {/* Chart Footer */}
                  <HStack justify="center" mt={4} spacing={6} fontSize="sm" color="gray.500">
                    <HStack>
                      <Box w={3} h={0.5} bg="#F59E0B" />
                      <Text>Good Performance (0.8+)</Text>
                    </HStack>
                    <HStack>
                      <Box w={3} h={0.5} bg="#EF4444" />
                      <Text>Excellent Performance (0.9+)</Text>
                    </HStack>
                  </HStack>
                </MotionBox>

                {/* Summary Stats */}
                {stats && (
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    bg={cardBg}
                    p={4}
                    borderRadius="xl"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <HStack justify="space-around" wrap="wrap" spacing={4}>
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.500">Total Evaluations</Text>
                        <Text fontSize="lg" fontWeight="bold" color="purple.600">
                          {stats.totalEvaluations}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.500">Latest Update</Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                          {stats.latestDate}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.500">Best Overall</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {Math.max(stats.bestAccuracy, stats.bestF1, stats.bestAUC).toFixed(3)}
                        </Text>
                      </VStack>
                    </HStack>
                  </MotionBox>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </motion.div>
      </Modal>
    </>
  )
}