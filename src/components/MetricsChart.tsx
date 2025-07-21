'use client'

import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, useDisclosure, Button, Checkbox, HStack
} from '@chakra-ui/react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { useState } from 'react'

export default function MetricsChart({ metrics }: { metrics: any[] }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showAccuracy, setShowAccuracy] = useState(true)
  const [showF1, setShowF1] = useState(true)
  const [showAUC, setShowAUC] = useState(true)

  const sorted = [...metrics].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <>
      <Button mt={2} colorScheme="purple" onClick={onOpen}>📊 View History</Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Model Metrics History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack spacing={4} mb={4}>
              <Checkbox isChecked={showAccuracy} onChange={(e) => setShowAccuracy(e.target.checked)}>
                Accuracy
              </Checkbox>
              <Checkbox isChecked={showF1} onChange={(e) => setShowF1(e.target.checked)}>
                F1 Score
              </Checkbox>
              <Checkbox isChecked={showAUC} onChange={(e) => setShowAUC(e.target.checked)}>
                AUC
              </Checkbox>
            </HStack>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sorted}>
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                {showAccuracy && <Line type="monotone" dataKey="accuracy" stroke="#3182ce" />}
                {showF1 && <Line type="monotone" dataKey="f1_score" stroke="#38a169" />}
                {showAUC && <Line type="monotone" dataKey="auc" stroke="#d69e2e" />}
              </LineChart>
            </ResponsiveContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
