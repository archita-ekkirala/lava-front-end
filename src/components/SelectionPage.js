import React, { useState } from 'react';
import { Box, Typography, MenuItem, FormControl, Select, Button } from '@mui/material';
import LavaLogo from './LavaLogo';

const SelectionPage = ({ onSubmit }) => {
  const [vendor, setVendor] = useState('');
  const [topic, setTopic] = useState('');

  const handleSubmit = () => {
    if (vendor && topic) {
      onSubmit({ vendor, topic });
    }
  };

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={3}>
      <LavaLogo />
      <FormControl fullWidth>
        <Typography variant="body1" gutterBottom>Pick a DSI Application</Typography>
        <Select value={vendor} onChange={(e) => setVendor(e.target.value)} displayEmpty>
          <MenuItem value="">Select a vendor</MenuItem>
          <MenuItem value="Vendor1">DSI Vendor1</MenuItem>
          <MenuItem value="Vendor2">DSI Vendor2</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <Typography variant="body1" gutterBottom>Pick a Topic</Typography>
        <Select value={topic} onChange={(e) => setTopic(e.target.value)} displayEmpty>
          <MenuItem value="">Select a topic</MenuItem>
          <MenuItem value="CKD">Chronic Kidney Disease (CKD) Predictor – Accuracy Evaluation</MenuItem>
          <MenuItem value="CardioVascularPrediction">CardioVascular Predictor Evaluation</MenuItem>
          <MenuItem value="HospitalizationRisk">30 Day Hospitalization risk due to progression of CKD</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleSubmit}>→</Button>
    </Box>
  );
};

export default SelectionPage;
