import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Tabs, Tab, Button, Paper,IconButton,Tooltip as MuiTooltip } from '@mui/material';
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
import CKDPredictionCsvFromFhir from '../CKDPredictionCsvFromFhir';
import Prediction from '../views/Prediction';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const CKDPrediction = (props) => {
  const [csvData, setCsvData] = useState("");

  const handleCsvReady = (csv) => {
    console.log("CSV received in parent:", csv);
    setCsvData(csv);
  };

  const gridLabels = [
    { label: 'Overall Accuracy', field: 'overall_accuracy', 
      format: v => `${(v * 100).toFixed(1)}%`,  
      tooltip: "How often the model's predictions are correct overall",
      info:"Correct predictions"  },
    { label: 'CKD Prediction Reliability', field: 'alert_reliability', format: v => `${(v * 100).toFixed(1)}%`, tooltip: 'When the model says "yes",how often is it actually right?' ,
    info:"% of predictive positives correct"},
    { label: 'CKD Prediction detection Rate', field: 'need_detection_rate', format: v => `${(v * 100).toFixed(1)}%`, tooltip: 'How well the model finds all the actual "yes" cases.' ,
    info:"% of actual positives detected"},
    { label: 'Balanced CKD Prediction score', field: 'balanced_score', format: v => v.toFixed(2), tooltip: "A balance between precision and recall, showing overall model effectiveness.",
      info:"Harmonic means of precision and recall"
     }
  ];
  return (
    <div>
      <CKDPredictionCsvFromFhir onCsvReady={handleCsvReady} />
      { csvData && csvData.length > 0 && (
        <Prediction csvData={csvData} gridLabels={gridLabels} topic="CKD Prediction"/>
      )}
    </div>
  );
};

export default CKDPrediction;
