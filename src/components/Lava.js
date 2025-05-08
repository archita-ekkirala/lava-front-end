import React, { useState,useEffect } from 'react';
import SelectionPage from './SelectionPage';
import CKDPrediction from './topics/CKDPrediction';
import HeartFailurePrediction from './topics/HeartFailurePrediction';
import HospitalizationRiskPrediction from './topics/HospitalizationRiskPrediction';
import * as tf from '@tensorflow/tfjs'
import * as sk from 'scikitjs'

const Lava = () => {
  const [selection, setSelection] = useState(null);
  const goBack = () => setSelection(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initScikit() {
      sk.setBackend(tf); // Set TensorFlow.js as backend
      setReady(true); // Mark scikit.js as ready
    }
    initScikit();
  }, []);

  if (!ready) return <div>Loading ML backend...</div>;

  const renderTopicComponent = () => {
    switch (selection.topic) {
      case 'CKD':
        return <CKDPrediction goBack={goBack}/>;
      case 'HeartFailure':
        return <HeartFailurePrediction goBack={goBack}/>;
      case 'HospitalizationRisk':
        return <HospitalizationRiskPrediction goBack={goBack}/>;
      default:
        return <div>Coming Soon...</div>;
    }
  };

  return (
    <div>
      {!selection ? (
        <SelectionPage onSubmit={setSelection} />
      ) : (
        renderTopicComponent()
      )}
    </div>
  );
};

export default Lava;