import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Box, Paper, Typography, Switch, FormControlLabel, Tooltip as MUITooltip } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/**
 * CalibrationCurve Component
 * 
 * Displays model calibration using binning strategy with perfect calibration reference line.
 * 
 * @param {Array} predictions - Array of predicted probabilities (0-1)
 * @param {Array} actual - Array of actual outcomes (0 or 1)
 * @param {Object} processedData - Pre-calculated calibration data (optional)
 * @param {number} nBins - Number of bins for grouping predictions (default: 10)
 * @param {string} title - Chart title
 */
const CalibrationCurve = ({ predictions, actual, processedData, nBins = 10, title = "Calibration Plot" }) => {
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(false);
  
  const calibrationData = useMemo(() => {
    // Use fixed nBins for calculation
    // Only fall back to processedData if no predictions/actual data available
    if (predictions && actual && predictions.length > 0) {
      return calculateCalibrationData(predictions, actual, nBins);
    }
    return processedData || { meanPredicted: [], fractionPositive: [], counts: [] };
  }, [predictions, actual, nBins, processedData]);

  const confidenceIntervals = useMemo(() => {
    return showConfidenceInterval ? calculateConfidenceIntervals(calibrationData) : null;
  }, [calibrationData, showConfidenceInterval]);

  const chartData = {
    datasets: [
      {
        label: 'Calibration Curve',
        data: calibrationData.meanPredicted.map((x, i) => ({ x, y: calibrationData.fractionPositive[i] })),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: true,
        tension: 0.1
      },
      {
        label: 'Perfect Calibration',
        data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        borderColor: 'red',
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true
      },
      ...(confidenceIntervals ? [
        {
          label: 'Confidence Interval (Upper)',
          data: calibrationData.meanPredicted.map((x, i) => ({ x, y: confidenceIntervals.upperBounds[i] })),
          borderColor: 'rgba(0, 123, 255, 0.3)',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          pointRadius: 2,
          showLine: true,
          fill: '+1'
        },
        {
          label: 'Confidence Interval (Lower)',
          data: calibrationData.meanPredicted.map((x, i) => ({ x, y: confidenceIntervals.lowerBounds[i] })),
          borderColor: 'rgba(0, 123, 255, 0.3)',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          pointRadius: 2,
          showLine: true,
          fill: false
        }
      ] : [])
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataIndex = context.dataIndex;
            if (context.dataset.label === 'Calibration Curve' && calibrationData.counts[dataIndex]) {
              return [
                `Mean Predicted: ${context.parsed.x.toFixed(3)}`,
                `Fraction Positive: ${context.parsed.y.toFixed(3)}`,
                `Count: ${calibrationData.counts[dataIndex]}`
              ];
            }
            return `${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Mean Predicted Probability',
          font: { size: 14 }
        },
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Fraction of Positives',
          font: { size: 14 }
        },
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1
        }
      }
    }
  };

  const calibrationError = useMemo(() => {
    return calculateExpectedCalibrationError(
      calibrationData.meanPredicted, 
      calibrationData.fractionPositive, 
      calibrationData.counts, 
      predictions?.length || 0
    );
  }, [calibrationData, predictions]);

  const calibrationMetrics = useMemo(() => {
    return calculateCalibrationMetrics(predictions, actual, calibrationData);
  }, [predictions, actual, calibrationData]);

  const calibrationAssessment = useMemo(() => {
    return getCalibrationAssessment(calibrationError, calibrationData);
  }, [calibrationError, calibrationData]);

  return (
    <Paper elevation={2} style={{ padding: 16, height: '650px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box mb={1}>
        <Typography variant="subtitle1" align="left" gutterBottom>
          {title}
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Box flex={1} display="flex" gap={2} minHeight={0}>
        {/* Left Side: Chart */}
        <Box flex={1} minHeight={0} minWidth={0}>
          <Line data={chartData} options={options} />
        </Box>
        
        {/* Right Side: Metrics and Controls */}
        <Box width="160px" display="flex" flexDirection="column" gap={1.5}>
          {/* Confidence Intervals Toggle */}
          <Box 
            px={0.5} 
            py={0.2}
            bgcolor="#e3f2fd" 
            borderRadius={1} 
            textAlign="left"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showConfidenceInterval}
                  onChange={(e) => setShowConfidenceInterval(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                  Confidence Intervals
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>
          
          {/* Calibration Metrics */}
          {calibrationError !== null && (
            <MUITooltip 
              title={
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Expected Calibration Error: Lower values (≤0.05) indicate excellent calibration
                </Typography>
              }
              arrow
              placement="right"
            >
              <Box 
                px={0.5} 
                py={1}
                bgcolor="#f8f9fa" 
                borderRadius={1} 
                textAlign="center"
                minHeight="60px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                sx={{ cursor: 'help' }}
              >
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                  Expected Calibration Error
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {calibrationError.toFixed(3)}
                </Typography>
              </Box>
            </MUITooltip>
          )}
          
          {calibrationMetrics.brierScore !== null && (
            <MUITooltip 
              title={
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Brier Score: Lower is better. Values closer to 0 indicate better calibration and accuracy
                </Typography>
              }
              arrow
              placement="right"
            >
              <Box 
                px={0.5} 
                py={1}
                bgcolor="#f8f9fa" 
                borderRadius={1} 
                textAlign="center"
                minHeight="60px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                sx={{ cursor: 'help' }}
              >
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                  Brier Score
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {calibrationMetrics.brierScore.toFixed(3)}
                </Typography>
              </Box>
            </MUITooltip>
          )}
          
          {calibrationMetrics.meanCalibrationError !== null && (
            <MUITooltip 
              title={
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Mean Calibration Error: Lower is better. Represents the maximum calibration error across all bins
                </Typography>
              }
              arrow
              placement="right"
            >
              <Box 
                px={0.5} 
                py={1}
                bgcolor="#f8f9fa" 
                borderRadius={1} 
                textAlign="center"
                minHeight="60px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                sx={{ cursor: 'help' }}
              >
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                  Mean Calibration Error
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {calibrationMetrics.meanCalibrationError.toFixed(3)}
                </Typography>
              </Box>
            </MUITooltip>
          )}
          
          {calibrationMetrics.reliability !== null && (
            <MUITooltip 
              title={
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Reliability: Lower is better. Measures how much predictions deviate from actual outcomes within bins
                </Typography>
              }
              arrow
              placement="right"
            >
              <Box 
                px={0.5} 
                py={1}
                bgcolor="#f8f9fa" 
                borderRadius={1} 
                textAlign="center"
                minHeight="60px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                sx={{ cursor: 'help' }}
              >
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                  Reliability
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {calibrationMetrics.reliability.toFixed(3)}
                </Typography>
              </Box>
            </MUITooltip>
          )}
          
          {calibrationMetrics.resolution !== null && (
            <MUITooltip 
              title={
                <Typography sx={{ fontSize: '0.9rem' }}>
                  Resolution: Higher is better. Measures the model's ability to distinguish between different outcome rates
                </Typography>
              }
              arrow
              placement="right"
            >
              <Box 
                px={0.5} 
                py={1}
                bgcolor="#f8f9fa" 
                borderRadius={1} 
                textAlign="center"
                minHeight="60px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                sx={{ cursor: 'help' }}
              >
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                  Resolution
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {calibrationMetrics.resolution.toFixed(3)}
                </Typography>
              </Box>
            </MUITooltip>
          )}
        </Box>
      </Box>

      {/* Bottom: Assessment Only */}
      <Box mt={1}>
        {calibrationAssessment && (
          <Box 
            p={1} 
            borderRadius={1} 
            bgcolor="#f5f5f5"
            border={`2px solid ${calibrationAssessment.color}`}
            sx={{ boxShadow: 1 }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} flexWrap="wrap">
              <span style={{ fontSize: '14px' }}>{calibrationAssessment.icon}</span>
              <Typography 
                variant="body2" 
                style={{ 
                  color: calibrationAssessment.color, 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                {calibrationAssessment.level}:
              </Typography>
              <Typography 
                variant="body2" 
                style={{ color: '#666', fontSize: '0.85rem' }}
              >
                {calibrationAssessment.message}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CalibrationCurve;

/**
 * Calculate calibration data using uniform binning strategy
 * 
 * @param {Array<number>} predictions - Array of predicted probabilities (0-1)
 * @param {Array<number>} actual - Array of actual outcomes (0 or 1)
 * @param {number} nBins - Number of bins for grouping predictions (default: 10)
 * @returns {Object} Object containing meanPredicted, fractionPositive, and counts arrays
 */
export function calculateCalibrationData(predictions, actual, nBins = 10) {
  if (!predictions || !actual || predictions.length === 0 || predictions.length !== actual.length) {
    return { meanPredicted: [], fractionPositive: [], counts: [] };
  }

  const binWidth = 1.0 / nBins;
  const bins = Array(nBins).fill(null).map(() => ({
    predictions: [],
    sum: 0,
    count: 0
  }));

  // Assign predictions to bins
  predictions.forEach((pred, idx) => {
    const binIndex = Math.min(Math.floor(pred / binWidth), nBins - 1);
    bins[binIndex].predictions.push(pred);
    bins[binIndex].sum += actual[idx];
    bins[binIndex].count += 1;
  });

  // Calculate metrics for each bin - only include non-empty bins
  const meanPredicted = [];
  const fractionPositive = [];
  const counts = [];

  bins.forEach((bin) => {
    if (bin.count > 0) {
      const meanPred = bin.predictions.reduce((a, b) => a + b, 0) / bin.count;
      const fracPos = bin.sum / bin.count;
      
      meanPredicted.push(meanPred);
      fractionPositive.push(fracPos);
      counts.push(bin.count);
    }
  });

  return { meanPredicted, fractionPositive, counts };
}

/**
 * Calculate Expected Calibration Error (ECE)
 * 
 * @param {Array<number>} meanPredicted - Mean predicted probabilities per bin
 * @param {Array<number>} fractionPositive - Fraction of positives per bin
 * @param {Array<number>} counts - Number of samples per bin
 * @param {number} totalSamples - Total number of samples
 * @returns {number} Expected Calibration Error
 */
export function calculateExpectedCalibrationError(meanPredicted, fractionPositive, counts, totalSamples) {
  if (meanPredicted.length === 0 || totalSamples === 0) {
    return null;
  }

  const ece = meanPredicted.reduce((sum, pred, i) => {
    const diff = Math.abs(pred - fractionPositive[i]);
    const weight = counts[i] / totalSamples;
    return sum + (weight * diff);
  }, 0);

  return ece;
}

/**
 * Calculate comprehensive calibration metrics
 * 
 * @param {Array<number>} predictions - Original predicted probabilities
 * @param {Array<number>} actual - Original actual outcomes
 * @param {Object} calibrationData - Binned calibration data
 * @returns {Object} Object containing Brier score, MCE, reliability, and resolution
 */
export function calculateCalibrationMetrics(predictions, actual, calibrationData) {
  if (!predictions || !actual || predictions.length === 0) {
    return { brierScore: null, meanCalibrationError: null, reliability: null, resolution: null };
  }

  const n = predictions.length;
  
  // Brier Score: Mean squared difference between predictions and outcomes
  const brierScore = predictions.reduce((sum, pred, i) => {
    return sum + Math.pow(pred - actual[i], 2);
  }, 0) / n;

  // Mean Calibration Error (MCE): Maximum calibration error across bins
  const meanCalibrationError = calibrationData.meanPredicted.length > 0 
    ? Math.max(...calibrationData.meanPredicted.map((pred, i) => 
        Math.abs(pred - calibrationData.fractionPositive[i])
      ))
    : null;

  // Base rate (overall positive rate)
  const baseRate = actual.reduce((sum, outcome) => sum + outcome, 0) / n;

  // Reliability: Expected squared deviation of bin accuracy from bin confidence
  const reliability = calibrationData.meanPredicted.reduce((sum, pred, i) => {
    const weight = calibrationData.counts[i] / n;
    const diff = Math.pow(pred - calibrationData.fractionPositive[i], 2);
    return sum + (weight * diff);
  }, 0);

  // Resolution: Expected squared deviation of bin accuracy from base rate
  const resolution = calibrationData.fractionPositive.reduce((sum, fracPos, i) => {
    const weight = calibrationData.counts[i] / n;
    const diff = Math.pow(fracPos - baseRate, 2);
    return sum + (weight * diff);
  }, 0);

  return { brierScore, meanCalibrationError, reliability, resolution };
}

/**
 * Calculate confidence intervals for calibration bins
 * 
 * @param {Object} calibrationData - Binned calibration data
 * @param {number} confidenceLevel - Confidence level (default: 0.95)
 * @returns {Object} Object containing lower and upper confidence bounds
 */
export function calculateConfidenceIntervals(calibrationData, confidenceLevel = 0.95) {
  if (!calibrationData || !calibrationData.fractionPositive || calibrationData.fractionPositive.length === 0) {
    return { lowerBounds: [], upperBounds: [] };
  }

  const z = confidenceLevel === 0.95 ? 1.96 : (confidenceLevel === 0.99 ? 2.576 : 1.645);
  
  const lowerBounds = [];
  const upperBounds = [];
  
  calibrationData.fractionPositive.forEach((fracPos, i) => {
    const count = calibrationData.counts[i];
    if (count > 1) { // Need at least 2 samples for meaningful confidence intervals
      const standardError = Math.sqrt((fracPos * (1 - fracPos)) / count);
      const margin = z * standardError;
      
      lowerBounds.push(Math.max(0, fracPos - margin));
      upperBounds.push(Math.min(1, fracPos + margin));
    } else {
      // For bins with 0 or 1 sample, use the fraction itself as bounds
      lowerBounds.push(fracPos);
      upperBounds.push(fracPos);
    }
  });
  
  return { lowerBounds, upperBounds };
}

/**
 * Determine calibration quality assessment based on ECE
 * 
 * @param {number} calibrationError - Expected Calibration Error
 * @param {Object} calibrationData - Calibration data object
 * @returns {Object|null} Assessment object with icon, level, message, color
 */
export function getCalibrationAssessment(calibrationError, calibrationData) {
  if (calibrationError === null) return null;
  
  if (calibrationError <= 0.05) {
    return {
      icon: "✅",
      level: "Excellent Calibration",
      message: "Model is very well-calibrated. Predicted probabilities closely match actual outcomes.",
      color: "#4caf50"
    };
  } else if (calibrationError <= 0.10) {
    return {
      icon: "✅",
      level: "Good Calibration",
      message: "Model shows good calibration with minor deviations from perfect calibration.",
      color: "#8bc34a"
    };
  } else if (calibrationError <= 0.15) {
    return {
      icon: "⚠️",
      level: "Fair Calibration",
      message: "Model has moderate calibration issues. Consider recalibration for better reliability.",
      color: "#ff9800"
    };
  } else {
    return {
      icon: "❌",
      level: "Poor Calibration",
      message: "Model has significant calibration problems. Recalibration is strongly recommended.",
      color: "#f44336"
    };
  }
}