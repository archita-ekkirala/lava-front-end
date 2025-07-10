import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import SelectionPage from './SelectionPage';
import CKDPrediction from './topics/CKDPrediction';
import HospitalizationRiskPrediction from './topics/HospitalizationRiskPrediction';
import CardioVascularPrediction from './topics/CardioVascularPrediction';
import * as tf from '@tensorflow/tfjs';
import * as sk from 'scikitjs';
import { useAppContext } from '../context/AppContext';
import ProstateCancerPrediction from './topics/ProstateCancerPrediciton';

const Lava = () => {
  //const [selection, setSelection] = useState(null);
  const {activePage, setActivePage,selection,setSelection} = useAppContext();
  const [ready, setReady] = useState(false);


  useEffect(() => {
    async function initScikit() {
      sk.setBackend(tf); 
      setReady(true); 
    }
    initScikit();
  }, []);

  if (!ready) return <div>Loading ML backend...</div>;

  const renderTopicComponent = () => {
    console.log("renderTopicComponent called");
    console.log(selection);
    setActivePage("ModelAnalysis");
    switch (selection.topic) {
      case 'CKD':
        console.log("CKD Prediction selected");
        return <CKDPrediction />;
      case 'CardioVascularPrediction':
        return <CardioVascularPrediction />;
      case 'ProstateCancerPrediction':
        return <ProstateCancerPrediction />;
      case 'HospitalizationRisk':
        return <HospitalizationRiskPrediction />;
      default:
        return <div>Coming Soon...</div>;
    }
  };

  const renderContent = () => {
    if (activePage === 'Dashboard') {
      return !selection ? (
        <SelectionPage onSubmit={setSelection} />
      ) : (
        renderTopicComponent()
      );
    } else if (activePage === 'ModelAnalysis') {
      return !selection ? (
        <SelectionPage onSubmit={setSelection} />
      ) : (
        renderTopicComponent()
      );
    } else if (activePage === 'Settings') {
      return <div>Settings Page Coming Soon...</div>;
    }
  };

  return (
    <div>
      {/* Top Menu Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#275786' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Lava Application
          </Typography>
          <Button
            color="inherit"
            sx={{
              backgroundColor: activePage === 'Dashboard' ? '#1164ad' : 'inherit', 
              color: activePage === 'Dashboard' ? '#fff' : 'inherit',
            }}
            onClick={() => {
              setSelection(null);
              setActivePage('Dashboard');
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            sx={{
              backgroundColor: activePage === 'ModelAnalysis' ? '#1164ad' : 'inherit', 
              color: activePage === 'ModelAnalysis' ? '#fff' : 'inherit',
            }}
            onClick={() => setActivePage('ModelAnalysis')}
          >
            Topic Dashboard
          </Button>
          <Button
            color="inherit"
            sx={{
              backgroundColor: activePage === 'Settings' ? '#1164ad' : 'inherit', 
              color: activePage === 'Settings' ? '#fff' : 'inherit',
            }}
            onClick={() => setActivePage('Settings')}
          >
            Settings
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box mt={2}>{renderContent()}</Box>
    </div>
  );
};

export default Lava;