import React, { useState } from 'react';
import { Grid, Paper, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';

const MetricsSection = ({ topic, metricsData, accuracyChart, barChartData, rocChart, recalculateMetrics }) => {
    const [threshold, setThreshold] = useState(20); 

    const total = metricsData.confusion_matrix.true_positive +
        metricsData.confusion_matrix.false_negative +   
            metricsData.confusion_matrix.false_positive +   
                metricsData.confusion_matrix.true_negative;

    const percent = (value) => {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(1) + '%';
    };


    const getTitle = () => {
        console.log("topic---" + topic)
        if (topic.includes("CKD")) {
            return "CKD Risk Breakdown";
        } else if (topic.includes("CardioVascularDisease")) {
            return "Cardiovascular Risk Breakdown";
        } else {
            return "Metrics Breakdown";
        }
    };

    const handleThresholdChange = (event) => {
        const newThreshold = event.target.value;
        setThreshold(newThreshold);
        recalculateMetrics(newThreshold); 
    };

    return (
        <Box mt={4} width="100%">
            <Grid container spacing={4} justifyContent="center">
                {/* Chart 1 */}
                <Grid item xs={12} md={8} width="45%">
                    <Paper elevation={2} style={{ padding: 16, height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" align="left" gutterBottom>
                                {getTitle()} 
                            </Typography>
                        </Box>
                        <Box
                            display="grid"
                            gridTemplateColumns="repeat(2, 1fr)" 
                            gap={2}
                        >
                            <Box
                                bgcolor="#e0f2f1"
                                p={2}
                                borderRadius={2}
                                textAlign="center"
                                style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <div>
                                    <Typography variant="h6">
                                        {metricsData.confusion_matrix.true_positive} 
                                        ({percent(metricsData.confusion_matrix.true_positive)})
                                    </Typography>
                                    <Typography variant="body2">Correctly predicted</Typography>
                                </div>
                            </Box>
                            <Box
                                bgcolor="#ffebee"
                                p={2}
                                borderRadius={2}
                                textAlign="center"
                                style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <div>
                                    <Typography variant="h6">
                                        {metricsData.confusion_matrix.false_negative} 
                                        ({percent(metricsData.confusion_matrix.false_negative)})
                                    </Typography>
                                    <Typography variant="body2">Missed Predictions</Typography>
                                </div>
                            </Box>
                            <Box
                                bgcolor="#ffebee"
                                p={2}
                                borderRadius={2}
                                textAlign="center"
                                style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <div>
                                    <Typography variant="h6">
                                        {metricsData.confusion_matrix.false_positive} 
                                        ({percent(metricsData.confusion_matrix.false_positive)})
                                    </Typography>
                                    <Typography variant="body2">Wrongly predicted positive</Typography>
                                </div>
                            </Box>
                            <Box
                                bgcolor="#e0f2f1"
                                p={2}
                                borderRadius={2}
                                textAlign="center"
                                style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <div>
                                    <Typography variant="h6">
                                        {metricsData.confusion_matrix.true_negative} 
                                        ({percent(metricsData.confusion_matrix.true_negative)})
                                    </Typography>
                                    <Typography variant="body2">Correctly predicted negative</Typography>
                                </div>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Chart 2 */}
                <Grid item xs={12} md={8} width="45%">
                    <Paper elevation={2} style={{ padding: 16, height: '100%' }}>
                        <Typography variant="subtitle1" align="left" sx={{ marginBottom: '10%',bottom: '20px' }}gutterBottom>Accuracy Over Time</Typography>
                        <Line  data={accuracyChart} options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom', 
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Time', 
                                        font: { size: 14 }
                                      }
                                },
                                y: {
                                    min: 0, 
                                    ticks: {
                                        stepSize: 25, 
                                    },
                                    title: {
                                        display: true,
                                        text: 'Observed Frequency', 
                                        font: { size: 14 }
                                      }
                                },
                            },
                        }} />
                    </Paper>
                </Grid>

                {/* Chart 3 */}
                <Grid item xs={12} md={8} width="45%" paddingTop={2}>
                    <Paper elevation={2} style={{ padding: 16, height: '100%' }}>
                        <Typography variant="subtitle1" align="left" gutterBottom>Accuracy Metrics</Typography>
                        <Bar
                            data={barChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    y: {
                                        min: 0,
                                        max: 1.2,
                                        ticks: { stepSize: 0.2 },
                                    },
                                },
                            }}
                        />
                    </Paper>
                </Grid>

                {/* Chart 4 */}
                <Grid item xs={12} md={8} width="45%" paddingTop={2}>
                    <Paper elevation={2} style={{ padding: 16, height: '100%' }}>
                        <Typography variant="subtitle1" gutterBottom align="left">ROC Curve</Typography>
                        <Line
                            data={rocChart}
                            options={{
                                responsive: true,
                                scales: {
                                    x: { type:'linear',title : {display:true,text:'False Positive Rate'}, min: 0, max: 1 },
                                    y: { type:'linear',title : {display:true,text:'True Positive Rate'}, min: 0, max: 1 },
                                },
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MetricsSection;
