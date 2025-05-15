import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Tabs, Tab, Button, Paper } from '@mui/material';
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
import ASCVDPredictionCsvFromFhir from '../ASCVDPredictionCsvFromFhir';
import { CalculateSubgroupMetrics } from '../metrics/CalculateSubgroupMetrics';
import SubgroupBarChart from '../charts/SubgroupBarChart';
import MetricsSection from '../charts/MetricsSection';
import DistributionCharts from '../charts/DistributionCharts';
import { CalculateMetricsForScore } from '../metrics/CalculateMetricsForScore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);



const CardioVascularPrediction = (props) => {
  const [tab, setTab] = useState(0);
  const [metricsData, setMetricsData] = useState(null);
  const [subGroupMetricsData, setSubGroupMetricsData] = useState(null);
  const [genderMetrics, setGenderMetrics] = useState(null);
  const [raceMetrics, setRaceMetrics] = useState(null);
  const { goBack } = props;
  const [csvData, setCsvData] = useState("");
  const [ageGroupDist, setAgeGroupDist] = useState({});
  const [genderDist, setGenderDist] = useState({});
  const [raceDist, setRaceDist] = useState({});
  const [thresholdDist, setThresholdDist] = useState(20);

  // const PREDICTION_SERVER = "http://54.166.135.219:5000";
  const PREDICTION_SERVER = "http://localhost:5000";

  const handleCsvReady = (csv) => {
    console.log("CSV received in parent:", csv);
    setCsvData(csv);
  };

  const handleTabChange = (event, newValue) => setTab(newValue);

  useEffect(() => {

    const fetchMetrics = async () => {
      console.log("fetching metrics")
      console.log(csvData)

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
          Actual: parseInt(row.ASCVD_Actual_Outcome)
        }));
        console.log("formatted csv data");
        console.log(formattedCsvData);

        // Sort by Prediction_Timestamp and deduplicate by Patient_ID
        const sorted = [...result].sort((a, b) =>
          new Date(a.Prediction_Timestamp) - new Date(b.Prediction_Timestamp)
        );

        const unique = new Map();
        sorted.forEach(row => {
          unique.set(row.Patient_ID, row); // keeps last by timestamp due to sorting
        });

        const finalData = Array.from(unique.values());
        console.log("finalData csv data");
        console.log(finalData);

        const data = await CalculateMetricsForScore(finalData,'TenYearScore',thresholdDist);

        // const y_true = finalData.map(row => row.Actual);
        // const y_pred = finalData.map(row => row.Prediction);
        // console.log(y_true + "--" + y_pred);

        // const data = await CalculateMetrics(y_true, y_pred);

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
    if (csvData && csvData.length > 0 && tab === 0) {
      console.log("csvData found")
      fetchMetrics();
    }
  }, [csvData, tab,thresholdDist]);

  // useEffect(() => {
  //   handleCsvReady(cvd_csv);
  // }, []);

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
        
        let formattedData = formattedCsvData.map(row => ({
          ...row,
          Prediction_Timestamp: new Date(row.Prediction_Timestamp),
          Actual: parseInt(row.ASCVD_Actual_Outcome)
        }));
        console.log("formatted csv data");
        console.log(formattedData);

        const subgroupGenderResult = await CalculateSubgroupMetrics(
          formattedData,
          'Gender',
          true,
          thresholdDist
        );

        console.log('Subgroup Gender Metrics:', subgroupGenderResult);
        const subgroupRaceResult = await CalculateSubgroupMetrics(
          formattedData,
          'Race',
          true,
          thresholdDist
        );
        console.log('Subgroup Race Metrics:', subgroupRaceResult);
        setGenderMetrics(subgroupGenderResult);
        setRaceMetrics(subgroupRaceResult);
      }
    };

    runSubgroup();
  }, [csvData, tab,thresholdDist]);

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
        console.log(formattedCsvData)
        const {ageGroups,genderCounts,raceCounts} = calculateDistributions(formattedCsvData);
        console.log(ageGroups);
        setAgeGroupDist(ageGroups);
        console.log(genderCounts);  
        setGenderDist(genderCounts);      
        console.log(raceCounts);
        setRaceDist(raceCounts);
      }
    }
    runDistributions()
  }, [csvData, tab,thresholdDist]);

  const calculateDistributions = (data) => {
    const ageGroups = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };
    const genderCounts = {};
    const raceCounts = {};

    const deduplicatedMap = new Map();

    data.forEach(row => {
      const patientId = row.Patient_ID;
      const currentTimestamp = new Date(row.Prediction_Timestamp);
  
      if (!deduplicatedMap.has(patientId)) {
        deduplicatedMap.set(patientId, row);
      } else {
        const existing = deduplicatedMap.get(patientId);
        const existingTimestamp = new Date(existing.Prediction_Timestamp);
        if (currentTimestamp > existingTimestamp) {
          deduplicatedMap.set(patientId, row);
        }
      }
    });
  
    const latestData = Array.from(deduplicatedMap.values());
  
    latestData.forEach((row) => {
      // Age calculation
      const birthDate = new Date(row.Birthdate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 60) ageGroups['36-60']++;
      else ageGroups['60+']++;
  
      // Gender
      const gender = row.Gender?.trim() || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
  
      // Race
      const race = row.Race?.trim() || 'Unknown';
      raceCounts[race] = (raceCounts[race] || 0) + 1;
    });
  
    return { ageGroups, genderCounts, raceCounts };
  };

  const metrics = metricsData ? [
    { label: 'Overall Accuracy', value: `${(metricsData.summary_metrics.overall_accuracy * 100).toFixed(1)}%` },
    { label: 'CVD Prediction Reliability', value: `${(metricsData.summary_metrics.alert_reliability * 100).toFixed(1)}%` },
    { label: 'CVD Prediction detection Rate', value: `${(metricsData.summary_metrics.need_detection_rate * 100).toFixed(1)}%` },
    { label: 'Balanced CVD Prediction score', value: metricsData.summary_metrics.balanced_score.toFixed(2) }
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


  const recalculateMetrics = (threshold) =>{
    setThresholdDist(threshold);
  }
  return (
    <div>
      <ASCVDPredictionCsvFromFhir onCsvReady={handleCsvReady} />
      <Box p={4} m={2} width="calc(100%-32px)" margin="20px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Box width="100%" mb={2} display="flex" justifyContent="flex-start">
          <Button variant="outlined" onClick={goBack}>
            ← Back
          </Button>
        </Box>
        <Typography variant="h5" gutterBottom>
          Accuracy Metrics: CVD Prediction (Ten Year Score)
        </Typography>

        {metricsData && (
          <>
            <Grid container spacing={2} justifyContent="flex-start" width="100%">
              {metrics.map((metric, i) => (
                <Grid item key={i} width="20%">
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
              <Box display="flex" justifyContent="left">
                <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                  <Tab label="Performance Metrics" />
                  <Tab label="Subgroup Analysis" />
                  <Tab label="Data Distribution" />
                </Tabs>
              </Box>
              {tab === 0 && (
                <MetricsSection topic="CVD" metricsData={metricsData} accuracyChart={accuracyChart} barChartData={barChartData} rocChart={rocChart} recalculateMetrics={recalculateMetrics}/>
              )}
              {tab === 1 && (
                <Box mt={4}>
                  <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={8} width="45%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        <SubgroupBarChart title="Gender-wise Visualization" rawData={genderMetrics} selectedFeature="Gender" />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8} width="45%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        <SubgroupBarChart title="Race-wise Precision" rawData={raceMetrics} selectedFeature="Race" />
                      </Paper>
                    </Grid>
                  </Grid>
                  {/* <SubgroupBarChart title="Age Group Recall" data={ageGroupMetrics} metricKey="Recall" /> */}
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

export default CardioVascularPrediction;
