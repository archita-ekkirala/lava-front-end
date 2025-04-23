import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Tabs, Tab } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [tab, setTab] = useState(0);

  const mockApiData = {
    summary_metrics: {
      overall_accuracy: 0.857,
      alert_reliability: 0.738,
      need_detection_rate: 0.847,
      balanced_score: 0.82
    },
    confusion_matrix: {
      true_positive: 1000,
      false_negative: 250,
      false_positive: 250,
      true_negative: 500
    },
    accuracy_over_time: {
      months: ['Jan 2024', 'Apr 2024', 'Jul 2024', 'Oct 2024', 'Jan 2025'],
      claimed: [90, 90, 90, 90, 90],
      measured: [80, 75, 95, 85, 78]
    },
    detailed_metrics: {
      accuracy: 0.49,
      precision: 0.50,
      recall: 0.49,
      f1_score: 0.50,
      brier_score: 0.51
    },
    roc_curve: {
      fpr: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
      tpr: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
      auc: 0.50
    }
  };

  const handleTabChange = (event, newValue) => setTab(newValue);

  const metrics = [
    { label: 'Overall Accuracy', value: `${(mockApiData.summary_metrics.overall_accuracy * 100).toFixed(1)}%` },
    { label: 'Admission Alert Reliability', value: `${(mockApiData.summary_metrics.alert_reliability * 100).toFixed(1)}%` },
    { label: 'Admission Need Detection Rate', value: `${(mockApiData.summary_metrics.need_detection_rate * 100).toFixed(1)}%` },
    { label: 'Balanced Admission Prediction Score', value: mockApiData.summary_metrics.balanced_score.toFixed(2) }
  ];

  const accuracyChart = {
    labels: mockApiData.accuracy_over_time.months,
    datasets: [
      {
        label: 'Claimed Accuracy',
        data: mockApiData.accuracy_over_time.claimed,
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Measured Accuracy',
        data: mockApiData.accuracy_over_time.measured,
        borderColor: 'red',
        fill: false
      }
    ]
  };

  const barChartData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'Brier Score'],
    datasets: [
      {
        label: 'Score',
        data: [
          mockApiData.detailed_metrics.accuracy,
          mockApiData.detailed_metrics.precision,
          mockApiData.detailed_metrics.recall,
          mockApiData.detailed_metrics.f1_score,
          mockApiData.detailed_metrics.brier_score
        ],
        backgroundColor: ['#d0e7f9', '#a5cbe2', '#7fb0cc', '#5894b6', '#3379a0']
      }
    ]
  };

  const rocChart = {
    labels: mockApiData.roc_curve.fpr,
    datasets: [
      {
        label: `ROC curve (area = ${mockApiData.roc_curve.auc})`,
        data: mockApiData.roc_curve.tpr,
        borderColor: 'blue',
        fill: false
      }
    ]
  };

  return (
    <Box p={4} width="100%">
      <Typography variant="h5" gutterBottom>
        Accuracy Metrics: Hospitalization Risk Prediction
      </Typography>
      <Typography variant="h6" gutterBottom>
        Patients with poor control of HbA1C ≥ 7.5%
      </Typography>

      <Grid container spacing={2} maxWidth="xl">
        {metrics.map((metric, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {metric.label}
                </Typography>
                <Typography variant="h6">{metric.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} width="100%">
        <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Performance Metrics" />
          <Tab label="Bias Analysis" />
          <Tab label="Data Distribution" />
        </Tabs>

        {tab === 0 && (
          <Box mt={2} width="100%">
            <Box mt={4} width="100%">
              <Grid container spacing={4} maxWidth="xl">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Admission Decision Breakdown</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2} width="100%">
                    <Box bgcolor="#e0f2f1" p={2} borderRadius={2} textAlign="center" width="100%">
                      <Typography variant="h6">{mockApiData.confusion_matrix.true_positive}</Typography>
                      <Typography variant="body2">Correctly Predicted Admission</Typography>
                    </Box>
                    <Box bgcolor="#ffebee" p={2} borderRadius={2} textAlign="center" width="100%">
                      <Typography variant="h6">{mockApiData.confusion_matrix.false_negative}</Typography>
                      <Typography variant="body2">Missed Admission Needs</Typography>
                    </Box>
                    <Box bgcolor="#ffebee" p={2} borderRadius={2} textAlign="center" width="100%">
                      <Typography variant="h6">{mockApiData.confusion_matrix.false_positive}</Typography>
                      <Typography variant="body2">Unnecessary Admission</Typography>
                    </Box>
                    <Box bgcolor="#e0f2f1" p={2} borderRadius={2} textAlign="center" width="100%">
                      <Typography variant="h6">{mockApiData.confusion_matrix.true_negative}</Typography>
                      <Typography variant="body2">Correctly Predicted Non-Admission</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Accuracy Over Time</Typography>
                  <Line data={accuracyChart} />
                </Grid>
              </Grid>
            </Box>

            <Box mt={4}>
              <Grid container spacing={4} maxWidth="xl">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">Accuracy Metrics</Typography>
                  <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 1, title: { display: true, text: 'Score' } } } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">ROC Curve</Typography>
                  <Line data={rocChart} options={{ responsive: true, scales: { x: { title: { display: true, text: 'False Positive Rate' }, min: 0, max: 1 }, y: { title: { display: true, text: 'True Positive Rate' }, min: 0, max: 1 } } }} />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default App;
