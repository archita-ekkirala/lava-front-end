import React, { useState } from 'react';
import { Box, Typography, MenuItem, FormControl, Select, Button } from '@mui/material';
import LavaLogo from './LavaLogo';

const SelectionPage = ({ onSubmit }) => {
  const [vendor, setVendor] = useState('');
  const [topic, setTopic] = useState('');

  const handleVendorChange = (e) => {
    const selectedVendor = e.target.value;
    setVendor(selectedVendor);
    setTopic(''); // Reset topic when vendor changes
  };

  const handleSubmit = () => {
    if (vendor && topic) {
      onSubmit({ vendor, topic });
    }
  };

  // Define available topics based on vendor
  const getTopicsForVendor = () => {
    if (vendor === 'Vendor1') {
      return [
        { value: 'CardioVascularPrediction', label: 'CardioVascular Predictor Evaluation' },
      ];
    } else if (vendor === 'Vendor2') {
      return [
        { value: 'CKD', label: 'Kidney Failure Estimator' },
        { value: 'ProstateCancerPrediction', label: 'ProstateCancer Predictor Evaluation' },
      ];
    }
    return [];
  };

  const availableTopics = getTopicsForVendor();

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center" gap={3}>
      <LavaLogo />

      <FormControl fullWidth>
        <Typography variant="body1" gutterBottom>Pick a DSI Application</Typography>
        <Select value={vendor} onChange={handleVendorChange} displayEmpty>
          <MenuItem value="">Select a vendor</MenuItem>
          <MenuItem value="Vendor1">Cerner</MenuItem>
          <MenuItem value="Vendor2">DSI Vendor2</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!vendor}>
        <Typography variant="body1" gutterBottom>Pick a Topic</Typography>
        <Select value={topic} onChange={(e) => setTopic(e.target.value)} displayEmpty>
          <MenuItem value="">Select a topic</MenuItem>
          {availableTopics.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleSubmit} disabled={!vendor || !topic}>
        →
      </Button>
    </Box>
  );
};

export default SelectionPage;