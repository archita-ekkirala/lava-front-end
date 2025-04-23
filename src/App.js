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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const App = () => {
  const [tab, setTab] = useState(0);
  const [metricsData, setMetricsData] = useState(null);

  const handleTabChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/calculate_metrics");
        const data = await response.json();

        const formatted = {
          summary_metrics: {
            overall_accuracy: data.Accuracy,
            alert_reliability: data.Precision,
            need_detection_rate: data.Recall,
            balanced_score: data["F1 Score"]
          },
          confusion_matrix: {
            true_positive: data["True Positive"],
            false_negative: data["False Negative"],
            false_positive: data["False Positive"],
            true_negative: data["True Negative"]
          },
          detailed_metrics: {
            accuracy: data.Accuracy,
            precision: data.Precision,
            recall: data.Recall,
            f1_score: data["F1 Score"],
            brier_score: data["Brier Score"]
          },
          accuracy_over_time: {
            months: ['Jan 2024', 'Apr 2024', 'Jul 2024', 'Oct 2024', 'Jan 2025'],
            claimed: [90, 90, 90, 90, 90],
            measured: [80, 75, 95, 85, 78]
          },
          roc_curve: {
            fpr: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            tpr: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            auc: 0.5
          }
        };

        setMetricsData(formatted);
      } catch (err) {
        console.error("API fetch failed", err);
      }
    };

    fetchMetrics();
  }, []);

  const metrics = metricsData ? [
    { label: 'Overall Accuracy', value: `${(metricsData.summary_metrics.overall_accuracy * 100).toFixed(1)}%` },
    { label: 'Admission Alert Reliability', value: `${(metricsData.summary_metrics.alert_reliability * 100).toFixed(1)}%` },
    { label: 'Admission Need Detection Rate', value: `${(metricsData.summary_metrics.need_detection_rate * 100).toFixed(1)}%` },
    { label: 'Balanced Admission Prediction Score', value: metricsData.summary_metrics.balanced_score.toFixed(2) }
  ] : [];

  const accuracyChart = {
    labels: metricsData?.accuracy_over_time.months || [],
    datasets: [
      {
        label: 'Claimed Accuracy',
        data: metricsData?.accuracy_over_time.claimed || [],
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Measured Accuracy',
        data: metricsData?.accuracy_over_time.measured || [],
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
        data: metricsData ? [
          metricsData.detailed_metrics.accuracy,
          metricsData.detailed_metrics.precision,
          metricsData.detailed_metrics.recall,
          metricsData.detailed_metrics.f1_score,
          metricsData.detailed_metrics.brier_score
        ] : [],
        backgroundColor: ['#d0e7f9', '#a5cbe2', '#7fb0cc', '#5894b6', '#3379a0']
      }
    ]
  };

  const rocChart = {
    labels: metricsData?.roc_curve.fpr || [],
    datasets: [
      {
        label: `ROC curve (area = ${metricsData?.roc_curve.auc.toFixed(2)})`,
        data: metricsData?.roc_curve.tpr || [],
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

      {metricsData && (
        <>
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

          <Box mt={4}>
            <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
              <Tab label="Performance Metrics" />
              <Tab label="Bias Analysis" />
              <Tab label="Data Distribution" />
            </Tabs>

            {tab === 0 && (
              <Box mt={4}>
                <Grid container spacing={4} maxWidth="xl">
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Admission Decision Breakdown</Typography>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
                      <Box bgcolor="#e0f2f1" p={2} borderRadius={2} textAlign="center">
                        <Typography variant="h6">{metricsData.confusion_matrix.true_positive}</Typography>
                        <Typography variant="body2">Correctly Predicted Admission</Typography>
                      </Box>
                      <Box bgcolor="#ffebee" p={2} borderRadius={2} textAlign="center">
                        <Typography variant="h6">{metricsData.confusion_matrix.false_negative}</Typography>
                        <Typography variant="body2">Missed Admission Needs</Typography>
                      </Box>
                      <Box bgcolor="#ffebee" p={2} borderRadius={2} textAlign="center">
                        <Typography variant="h6">{metricsData.confusion_matrix.false_positive}</Typography>
                        <Typography variant="body2">Unnecessary Admission</Typography>
                      </Box>
                      <Box bgcolor="#e0f2f1" p={2} borderRadius={2} textAlign="center">
                        <Typography variant="h6">{metricsData.confusion_matrix.true_negative}</Typography>
                        <Typography variant="body2">Correctly Predicted Non-Admission</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">Accuracy Over Time</Typography>
                    <Line data={accuracyChart} />
                  </Grid>
                </Grid>

                <Box mt={4}>
                  <Grid container spacing={4} maxWidth="xl">
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">Accuracy Metrics</Typography>
                      <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 1 } } }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">ROC Curve</Typography>
                      <Line data={rocChart} options={{ responsive: true, scales: { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } } }} />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default App;
