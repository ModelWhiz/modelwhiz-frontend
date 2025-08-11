'use client';

import {
  Checkbox,
  HStack,
  Box
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';

export default function MetricsChartInline({ metrics }: { metrics: any[] }) {
   // State for Classification
  const [showAccuracy, setShowAccuracy] = useState(true);
  const [showF1, setShowF1] = useState(true);
  const [showAUC, setShowAUC] = useState(true);

  // State for Regression
  const [showRmse, setShowRmse] = useState(true);
  const [showR2, setShowR2] = useState(true);

  if (!metrics || metrics.length === 0) {
    return <Box>No historical data to display.</Box>;
  }

  // // --- vvv THIS IS THE FIX: DETECT TASK TYPE vvv ---
  // const isRegression = metrics[0]?.hasOwnProperty('rmse');
  // // --- ^^^ END OF FIX ^^^ ---

    const sorted = [...metrics].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // const formatted = sorted.map((m) => ({
  //   ...m,
  //   timestamp: m.timestamp
  //     ? new Date(m.timestamp).toLocaleDateString()
  //     : '',
  // }));

    // --- vvv THIS IS THE FIX vvv ---
  // The historical data is nested. We must flatten it for the chart.
  const formattedData = metrics.map(m => ({
    timestamp: new Date(m.timestamp).toLocaleDateString(),
    ...(m.values || {}) // Use the 'values' object
  }));

  // Check for the property on the flattened data object.
  const isRegression = formattedData[0]?.hasOwnProperty('rmse');
  // --- ^^^ END OF FIX ^^^ ---

  return (
    <Box>
      <HStack spacing={4} mb={4}>
        {/* --- vvv CONDITIONAL CHECKBOXES vvv --- */}
        {isRegression ? (
          <>
            <Checkbox isChecked={showRmse} onChange={(e) => setShowRmse(e.target.checked)} colorScheme="teal">
              RMSE
            </Checkbox>
            <Checkbox isChecked={showR2} onChange={(e) => setShowR2(e.target.checked)} colorScheme="orange">
              R² Score
            </Checkbox>
          </>
        ) : (
          <>
            <Checkbox isChecked={showAccuracy} onChange={(e) => setShowAccuracy(e.target.checked)}>
              Accuracy
            </Checkbox>
            <Checkbox isChecked={showF1} onChange={(e) => setShowF1(e.target.checked)}>
              F1 Score
            </Checkbox>
            <Checkbox isChecked={showAUC} onChange={(e) => setShowAUC(e.target.checked)}>
              AUC
            </Checkbox>
          </>
        )}
        {/* --- ^^^ END OF CONDITIONAL CHECKBOXES ^^^ --- */}
      </HStack>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <XAxis dataKey="timestamp" />
          {/* --- vvv CONDITIONAL Y-AXIS AND LINES vvv --- */}
          {isRegression ? (
            <>
              <YAxis /> {/* No domain for regression */}
              <Tooltip />
              <Legend />
              {showRmse && <Line type="monotone" dataKey="rmse" name="RMSE" stroke="#319795" />}
              {showR2 && <Line type="monotone" dataKey="r2_score" name="R² Score" stroke="#DD6B20" />}
            </>
          ) : (
            <>
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              {showAccuracy && <Line type="monotone" dataKey="accuracy" stroke="#3182ce" />}
              {showF1 && <Line type="monotone" dataKey="f1_score" stroke="#38a169" />}
              {showAUC && <Line type="monotone" dataKey="auc" stroke="#d69e2e" />}
            </>
          )}
          {/* --- ^^^ END OF CONDITIONAL Y-AXIS AND LINES ^^^ --- */}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
