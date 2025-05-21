import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Tabs, Tab, Button, Paper,IconButton,Tooltip as MuiTooltip } from '@mui/material';
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

import { CalculateMetrics } from '../metrics/CalculateMetrics';
import CKDPredictionCsvFromFhir from '../CKDPredictionCsvFromFhir';
import { CalculateSubgroupMetrics } from '../metrics/CalculateSubgroupMetrics';
import {CalculateSubgroupAgeMetrics} from '../metrics/CalculateSubgroupAgeMetrics';
import SubgroupBarChart from '../charts/SubgroupBarChart';
import MetricsSection from '../charts/MetricsSection';
import DistributionCharts from '../charts/DistributionCharts';
import InfoIcon from '@mui/icons-material/Info';
import MetricsGrid from '../views/MetricsGrid';
import AgeGroupLineChart from '../charts/AgeGroupLineChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Prediction = ({csvData,gridLabels,topic,score}) => {
  const [tab, setTab] = useState(0);
  const [metricsData, setMetricsData] = useState(null);
  const [subGroupMetricsData, setSubGroupMetricsData] = useState(null);
  const [genderMetrics, setGenderMetrics] = useState(null);
  const [raceMetrics, setRaceMetrics] = useState(null);
  const [ageMetrics, setAgeMetrics] = useState(null);
  const [ageGroupDist, setAgeGroupDist] = useState({});
  const [genderDist, setGenderDist] = useState({});
  const [raceDist, setRaceDist] = useState({});

  const handleTabChange = (event, newValue) => setTab(newValue);

  function normalizeAndPredict(data, scoreKey, thresholdPercent = 20) {
    console.log(thresholdPercent);
    return data.map(row => {
      const score = parseFloat(row[scoreKey]) / 100; // Convert to 0–1
      return {
        ...row,
        Prediction: score >= (thresholdPercent / 100) ? 1 : 0
      };
    });
  }

  useEffect(() => {

    const fetchMetrics = async () => {

      try {

        const [headers, ...rows] = csvData;
        let formattedCsvData = rows.map(row =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {})
        );

        let result = formattedCsvData.map(row => ({
          ...row,
          Prediction_Timestamp: new Date(row.Prediction_Timestamp),
          Actual: parseInt(row.Actual_Outcome)
        }));


        // Sort by Prediction_Timestamp and deduplicate by Patient_ID
        const sorted = [...result].sort((a, b) =>
          new Date(a.Prediction_Timestamp) - new Date(b.Prediction_Timestamp)
        );

        const unique = new Map();
        sorted.forEach(row => {
          unique.set(row.Patient_ID, row); // keeps last by timestamp due to sorting
        });

        const finalData = Array.from(unique.values());

        if(score !== null && score !== undefined && score !== "") {
          const predictedData = normalizeAndPredict(finalData, score);
          finalData.forEach((row, index) => {
            row.Prediction = predictedData[index].Prediction;
          });
        }else{
            finalData.forEach(row => {
                row.Prediction = parseFloat(row.Predicted_Outcome);
            });
        }

        const y_true = finalData.map(row => row.Actual);
        const y_pred = finalData.map(row => row.Prediction);

        const data = await CalculateMetrics(y_true, y_pred);
       
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
            true_negative: data["True Negative"],
            true_positive_rate: data["True Positive Rate"].toFixed(2),
            true_negative_rate: data["True Negative Rate"].toFixed(2),
            false_positive_rate: data["False Positive Rate"].toFixed(2),
            false_negative_rate: data["False Negative Rate"].toFixed(2)
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
            fpr: data.ROC_CURVE.fpr,
            tpr: data.ROC_CURVE.tpr,
            auc: data.AUROC
          }
        };

        setMetricsData(formatted);
      } catch (err) {
        console.error("API fetch failed", err);
      }
    };
    if (csvData && csvData.length > 0 && tab === 0) {
      fetchMetrics();
    }
  }, [csvData, tab]);

  useEffect(() => {
    const runSubgroup = async () => {
      if (csvData && csvData.length > 0 && tab === 1) {
        const [headers, ...rows] = csvData;
        let formattedCsvData = rows.map(row =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {})
        );
        const formattedData = formattedCsvData.map(row => {
          const birthDate = new Date(row.Birthdate);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();
          const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
          return {
            ...row,
            Age: adjustedAge,
            Actual: parseInt(row.Actual_Outcome)
          }
        });

        if(score !== null && score !== undefined && score !== "") {
            const predictedData = normalizeAndPredict(formattedData, score);
            formattedData.forEach((row, index) => {
              row.Prediction = predictedData[index].Prediction;
            });
          }else{
              formattedData.forEach(row => {
                  row.Prediction = parseFloat(row.Predicted_Outcome);
              });
          }


        const subgroupGenderResult = await CalculateSubgroupMetrics(
          formattedData,
          'Gender',
          score
        );

        const subgroupRaceResult = await CalculateSubgroupMetrics(
          formattedData,
          'Race',
          score
        );

        const ageGroupMetrics = await CalculateSubgroupAgeMetrics(
          formattedData,score
        );
        setGenderMetrics(subgroupGenderResult);
        setRaceMetrics(subgroupRaceResult);
        setAgeMetrics(ageGroupMetrics);
      }
    };

    runSubgroup();
  }, [csvData, tab]);

  useEffect(() => {
    const runDistributions = async () => {
      if (csvData && csvData.length > 0 && tab === 2) {
        const [headers, ...rows] = csvData;
        let formattedCsvData = rows.map(row =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {})
        );
        const {ageGroups,genderCounts,raceCounts} = calculateDistributions(formattedCsvData);
        setAgeGroupDist(ageGroups);
        setGenderDist(genderCounts);      
        setRaceDist(raceCounts);
      }
    }
    runDistributions()
  }, [csvData, tab]);

  const calculateDistributions = (data) => {
    const ageGroups = { '0-10': 0,'11-20': 0, '21-30': 0,'31-40': 0,'41-50': 0, '51-60': 0, '60+': 0 };
    const genderCounts = {};
    const raceCounts = {};
  
    data.forEach((row) => {
      const birthDate = new Date(row.Birthdate);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const ageGroupKey = Object.keys(ageGroups).find((range) => {
        const [start, end] = range.split('-').map((v) => (v === '+' ? Infinity : parseInt(v, 10)));
        return age >= start && age <= end;
      });
  
      if (ageGroupKey) {
        ageGroups[ageGroupKey]++;
      }
  
      // Gender
      const gender = row.Gender?.trim() || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
  
      // Race
      const race = row.Race?.trim() || 'Unknown';
      raceCounts[race] = (raceCounts[race] || 0) + 1;
    });
  
    return { ageGroups, genderCounts, raceCounts };
  };

    const metrics = metricsData
    ? gridLabels.map(({ label, field, format, tooltip,info }) => ({
        label,
        value: format(metricsData.summary_metrics[field]),
        tooltip,info
        }))
    : [];


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
    datasets: [
      {
        label: `ROC curve (area = ${metricsData?.roc_curve.auc.toFixed(2)})`,
        data: metricsData?.roc_curve.fpr.map((fpr, i) => ({
          x: fpr,
          y: metricsData.roc_curve.tpr[i]
        })),
        borderColor: 'blue',
        fill: false,
        tension: 0.1,
      }
    ]
  };

  return (
    <div>
      <Box p={4} m={2} width="calc(100%-32px)" margin="20px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Box display="flex" justifyContent="space-between" width="100%">
        <Typography variant="h5" gutterBottom textAlign="left">
          Accuracy Metrics: Development of {topic} {score && `(Score: ${score})`}
        </Typography>
        </Box>

        {metricsData && (
          <>
            <MetricsGrid metrics={metrics} />
            <Box mt={4} width="100%">
              <Box display="flex" justifyContent="left">
                <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                  <Tab label="Performance Metrics" />
                  <Tab label="Subgroup Analysis" />
                  <Tab label="Data Distribution" />
                </Tabs>
              </Box>
              {tab === 0 && (
                <MetricsSection topic={topic} metricsData={metricsData} accuracyChart={accuracyChart} barChartData={barChartData} rocChart={rocChart} />
              )}
              {tab === 1 && (
                <Box mt={4}>
                  <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={8} width="30%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        <SubgroupBarChart title="Gender-wise Visualization" rawData={genderMetrics} selectedFeature="Gender" />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8} width="30%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        <SubgroupBarChart title="Race-wise Precision" rawData={raceMetrics} selectedFeature="Race" />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8} width="30%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        {/* <SubgroupBarChart title="Age-wise Precision" rawData={ageMetrics} selectedFeature="Age" /> */}
                        {ageMetrics && <AgeGroupLineChart data={ageMetrics}/>}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tab === 2 && (
                <Box mt={4}>
                  <h5 align="left">Patient Demographic Distribution</h5>
                  <DistributionCharts ageGroups={ageGroupDist} genderCounts={genderDist} raceCounts={raceDist} />
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};

export default Prediction;
