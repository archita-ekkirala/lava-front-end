import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box, Grid, Paper, Typography } from '@mui/material';
import DistributionPieChart from './DistributionPieChart';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const DistributionCharts = ({ ageGroups, genderCounts, raceCounts }) => {
  const ageData = {
    labels: Object.keys(ageGroups),
    datasets: [{
      label: 'Patients',
      data: Object.values(ageGroups),
      backgroundColor: '#42a5f5'
    }]
  };

  const genderData = {
    labels: Object.keys(genderCounts),
    datasets: [{
      label: 'Gender Distribution',
      data: Object.values(genderCounts),
      backgroundColor: ['#66bb6a', '#ef5350']
    }]
  };

  const raceData = {
    labels: Object.keys(raceCounts),
    datasets: [{
      label: 'Patients',
      data: Object.values(raceCounts),
      backgroundColor: '#ab47bc'
    }]
  };

  return (
    <Box mt={4}>
    <Grid container spacing={4} width="100%">
      <Grid item xs={12} md={6} width="30%">
        <Paper sx={{ p: 2, height: '300px' }}> {/* Set a consistent height */}
          <Typography variant="h6" gutterBottom align="left">
            Age Distribution
          </Typography>
          <Bar data={ageData} options={{ 
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Age Group', // X-axis label for Age Distribution
                    font: { size: 14 }
                  }
                }
              }
            }} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} width="30%">
        <DistributionPieChart title="Gender Distribution" data={genderCounts}/>
      </Grid>
      <Grid item xs={12} width="30%">
        <Paper sx={{ p: 2, height: '300px' }}> {/* Set the same height */}
          <Typography variant="h6" gutterBottom align="left">
            Race/Ethnicity Distribution
          </Typography>
          <Bar data={raceData} options={{ responsive: true,
             scales: {
              x: {
                title: {
                  display: true,
                  text: 'Race/Ethnicity Group', // X-axis label for Age Distribution
                  font: { size: 14 }
                }
              }
            }
           }} />
        </Paper>
      </Grid>
    </Grid>
  </Box>
  );
};

export default DistributionCharts;
