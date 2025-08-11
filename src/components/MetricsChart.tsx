// modelwhiz-frontend/src/components/MetricsChart.tsx
'use client'

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Button, HStack,
  VStack, Box, Text, Badge, Flex, useColorModeValue, Grid, Icon, Card, CardBody, CardHeader, Divider,
} from '@chakra-ui/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area,
  AreaChart,
} from 'recharts'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FaChartLine, FaHistory, FaToggleOn, FaToggleOff, FaTrophy, FaStar, FaFire, FaArrowDown, FaArrowUp,
} from 'react-icons/fa'

// Motion components
const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionCard = motion(Card)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formatName = (name: string) => {
      if (name === 'accuracy') return 'Accuracy';
      if (name === 'f1_score') return 'F1 Score';
      if (name === 'auc') return 'AUC';
      if (name === 'rmse') return 'RMSE';
      if (name === 'r2_score') return 'R² Score';
      return name;
    };
    const isRegression = payload.some((p: any) => p.name === 'rmse');

    return (
      <Box bg="white" p={4} borderRadius="xl" boxShadow="xl" border="1px" borderColor="gray.200">
        <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>{label}</Text>
        <VStack spacing={2} align="start">
          {payload.map((entry: any, index: number) => (
            <HStack key={index} spacing={2}>
              <Box w={3} h={3} borderRadius="full" bg={entry.color} />
              <Text fontSize="sm" fontWeight="medium" color="gray.700">{formatName(entry.name)}:</Text>
              <Text fontSize="sm" fontWeight="bold" color={entry.color}>
                {entry.value.toFixed(isRegression ? 4 : 3)}
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showAccuracy, setShowAccuracy] = useState(true);
  const [showF1, setShowF1] = useState(true);
  const [showAUC, setShowAUC] = useState(true);
  const [showRmse, setShowRmse] = useState(true);
  const [showR2, setShowR2] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  const cardBg = useColorModeValue('white', 'gray.800');
  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // const sorted = [...metrics].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  // const formatted = sorted.map(m => ({...m, timestamp: new Date(m.timestamp).toLocaleDateString()}));

  // const isRegression = sorted.length > 0 && sorted[0].hasOwnProperty('rmse');
  
  // --- vvv THIS IS THE FIX vvv ---
  // The historical data is nested. We must flatten it.
  const formattedData = useMemo(() => metrics.map(m => ({
      timestamp: m.timestamp,
      ...(m.values || {})
  })), [metrics]);

  const sorted = useMemo(() => formattedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [formattedData]);

  // Check for the property on the flattened data object.
  const isRegression = sorted.length > 0 && sorted[0].hasOwnProperty('rmse');
  // --- ^^^ END OF FIX ^^^ ---

  const stats = useMemo(() => {
    if (sorted.length < 1) return null;
    const latest = sorted[sorted.length - 1];
    
    const baseStats = {
        totalEvaluations: sorted.length,
        latestDate: new Date(latest.timestamp).toLocaleDateString(),
    };

    if (isRegression) {
      return {
        ...baseStats,
        type: 'regression' as const, // <-- Discriminated union type
        bestRmse: Math.min(...sorted.map(m => m.rmse || Infinity)),
        bestR2: Math.max(...sorted.map(m => m.r2_score || -Infinity)),
      }
    } else {
      return {
        ...baseStats,
        type: 'classification' as const, // <-- Discriminated union type
        bestAccuracy: Math.max(...sorted.map(m => m.accuracy || 0)),
        bestF1: Math.max(...sorted.map(m => m.f1_score || 0)),
        bestAUC: Math.max(...sorted.map(m => m.auc || 0)),
      }
    }
  }, [sorted, isRegression]);

  const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };

  const StatCard = ({ title, value, color, icon }: any) => (
    <MotionCard bg={cardBg} borderRadius="xl" boxShadow="lg" border="1px" borderColor={`${color}.100`} overflow="hidden">
      <CardHeader bg={`${color}.50`} py={3}><HStack><Icon as={icon} color={`${color}.500`} /><Text fontSize="sm" fontWeight="bold">{title}</Text></HStack></CardHeader>
      <CardBody py={4}><Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>{value}</Text></CardBody>
    </MotionCard>
  );

  const ChartToggle = ({ label, checked, onChange, color }: any) => (
    <MotionBox whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <HStack spacing={3} p={3} borderRadius="xl" bg={checked ? `${color}.50` : 'gray.50'} border="2px" borderColor={checked ? `${color}.200` : 'gray.200'} cursor="pointer" onClick={() => onChange(!checked)}>
        <Icon as={checked ? FaToggleOn : FaToggleOff} color={checked ? `${color}.500` : 'gray.400'} boxSize={5} />
        <Text fontWeight="medium" color={checked ? `${color}.700` : 'gray.500'}>{label}</Text>
        {checked && <Badge colorScheme={color} borderRadius="full">ON</Badge>}
      </HStack>
    </MotionBox>
  );

  return (
    <>
      <MotionButton variants={buttonVariants} mt={2} colorScheme="purple" onClick={onOpen} leftIcon={<FaHistory />}>View History</MotionButton>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <motion.div variants={modalVariants} initial="hidden" animate="visible" style={{ margin: '2rem' }}>
          <ModalContent borderRadius="2xl" bg={modalBg}>
            <ModalHeader bgGradient="linear(to-r, purple.500, pink.500)" color="white"><HStack><FaChartLine /> <Text>Model Performance Analytics</Text></HStack></ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody p={6} overflowY="auto">
              <VStack spacing={6} align="stretch">
                {/* --- vvv THIS IS THE FIX vvv --- */}
                {stats && (
                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                    {stats.type === 'regression' && (
                      <>
                        <StatCard title="Best RMSE" value={stats.bestRmse?.toFixed(4)} color="teal" icon={FaArrowDown} />
                        <StatCard title="Best R² Score" value={stats.bestR2?.toFixed(4)} color="cyan" icon={FaArrowUp} />
                      </>
                    )}
                    {stats.type === 'classification' && (
                      <>
                        <StatCard title="Best Accuracy" value={stats.bestAccuracy?.toFixed(4)} color="purple" icon={FaTrophy} />
                        <StatCard title="Best F1 Score" value={stats.bestF1?.toFixed(4)} color="blue" icon={FaStar} />
                        <StatCard title="Best AUC" value={stats.bestAUC?.toFixed(4)} color="green" icon={FaFire} />
                      </>
                    )}
                  </Grid>
                )}
                {/* --- ^^^ END OF FIX ^^^ --- */}
                <Divider />
                <Box>
                  <Flex justify="space-between" align="center" mb={4}><Text fontWeight="bold" color={textColor}>Performance Trends</Text><HStack><Button size="sm" variant={chartType === 'line' ? 'solid' : 'outline'} colorScheme="purple" onClick={() => setChartType('line')}>Line</Button><Button size="sm" variant={chartType === 'area' ? 'solid' : 'outline'} colorScheme="purple" onClick={() => setChartType('area')}>Area</Button></HStack></Flex>
                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
                    {isRegression ? (
                      <><ChartToggle label="RMSE" checked={showRmse} onChange={setShowRmse} color="teal" /><ChartToggle label="R² Score" checked={showR2} onChange={setShowR2} color="cyan" /></>
                    ) : (
                      <><ChartToggle label="Accuracy" checked={showAccuracy} onChange={setShowAccuracy} color="purple" /><ChartToggle label="F1 Score" checked={showF1} onChange={setShowF1} color="blue" /><ChartToggle label="AUC" checked={showAUC} onChange={setShowAUC} color="green" /></>
                    )}
                  </Grid>
                </Box>
                <MotionBox bg={cardBg} p={6} borderRadius="2xl" boxShadow="xl">
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'line' ? (
                      <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        {isRegression ? (<><YAxis allowDecimals={false} /><Line type="monotone" name="RMSE" dataKey="rmse" stroke="#319795" activeDot={{ r: 8 }} display={showRmse ? 'block' : 'none'} /><Line type="monotone" name="R² Score" dataKey="r2_score" stroke="#00B5D8" activeDot={{ r: 8 }} display={showR2 ? 'block' : 'none'} /></>) 
                                      : (<><YAxis domain={[0, 1]} /><Line type="monotone" name="Accuracy" dataKey="accuracy" stroke="#8B5CF6" activeDot={{ r: 8 }} display={showAccuracy ? 'block' : 'none'} /><Line type="monotone" name="F1 Score" dataKey="f1_score" stroke="#3B82F6" activeDot={{ r: 8 }} display={showF1 ? 'block' : 'none'} /><Line type="monotone" name="AUC" dataKey="auc" stroke="#10B981" activeDot={{ r: 8 }} display={showAUC ? 'block' : 'none'} /></>)}
                      </LineChart>
                    ) : (
                      <AreaChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        {isRegression ? (<><YAxis allowDecimals={false} /><Area type="monotone" name="RMSE" dataKey="rmse" stroke="#319795" fill="#319795" fillOpacity={0.2} display={showRmse ? 'block' : 'none'} /><Area type="monotone" name="R² Score" dataKey="r2_score" stroke="#00B5D8" fill="#00B5D8" fillOpacity={0.2} display={showR2 ? 'block' : 'none'} /></>) 
                                      : (<><YAxis domain={[0, 1]} /><Area type="monotone" name="Accuracy" dataKey="accuracy" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} display={showAccuracy ? 'block' : 'none'}/><Area type="monotone" name="F1 Score" dataKey="f1_score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} display={showF1 ? 'block' : 'none'} /><Area type="monotone" name="AUC" dataKey="auc" stroke="#10B981" fill="#10B981" fillOpacity={0.2} display={showAUC ? 'block' : 'none'} /></>)}
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </MotionBox>
                {stats && (
                  <MotionBox bg={cardBg} p={4} borderRadius="xl" border="1px" borderColor="gray.200">
                    <HStack justify="space-around">
                      <VStack><Text fontSize="sm" color="gray.500">Total Evaluations</Text><Text fontWeight="bold">{stats.totalEvaluations}</Text></VStack>
                      <VStack><Text fontSize="sm" color="gray.500">Latest Update</Text><Text fontWeight="bold">{stats.latestDate}</Text></VStack>
                      {/* --- vvv THIS IS THE FIX vvv --- */}
                      <VStack>
                        <Text fontSize="sm" color="gray.500">Best Overall</Text>
                        <Text fontWeight="bold">
                          {stats.type === 'regression' && stats.bestR2?.toFixed(4)}
                          {stats.type === 'classification' && stats.bestAccuracy?.toFixed(4)}
                        </Text>
                      </VStack>
                      {/* --- ^^^ END OF FIX ^^^ --- */}
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