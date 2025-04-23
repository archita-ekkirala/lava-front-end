import React from 'react';
import { Box, Typography } from '@mui/material';

const LavaLogo = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={2} mb={4}>
      <Box
        sx={{
          backgroundColor: '#2C65EB',
          color: 'white',
          fontWeight: 600,
          fontSize: '18px',
          padding: '6px 16px',
          borderRadius: '6px',
          letterSpacing: '1px'
        }}
      >
        LAVA
      </Box>
      <Typography variant="h5" mt={2} fontWeight="bold" textAlign="center">
        Local AI Evaluator (LAVA)
      </Typography>
      <Typography variant="body2" color="textSecondary" textAlign="center">
        Securely evaluate your clinical decision support systems
      </Typography>
    </Box>
  );
};

export default LavaLogo;
