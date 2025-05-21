import React from 'react';
import { Grid, Card, CardContent, Typography, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const MetricsGrid = ({ metrics }) => {
  const colors = ['#f9f9f9', '#f0f4f8']; 

  return (
    <Grid container spacing={2} justifyContent="flex-start" width="100%">
      {metrics.map((metric, i) => (
        <Grid item key={i} width="20%">
          <Card style={{ backgroundColor: colors[i % 2] }}> 
            <CardContent>
              <Grid container alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary" fontWeight="bold"> 
                  {metric.label}
                </Typography>
                <Tooltip title={metric.tooltip || 'More info'} arrow>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Typography variant="h6" textAlign="left">{metric.value}</Typography>
              <Typography variant="body2"textAlign="left" style={{ fontStyle: 'italic', color: '#757575', marginTop: '8px' }}>{metric.info}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricsGrid;