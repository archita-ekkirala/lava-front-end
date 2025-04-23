import React, { useState } from 'react';
import SelectionPage from './SelectionPage';
import CKDPrediction from './topics/CKDPrediction';
import HeartFailurePrediction from './topics/HeartFailurePrediction';
import HospitalizationRiskPrediction from './topics/HospitalizationRiskPrediction';


const Lava = () => {
  const [selection, setSelection] = useState(null);
  const goBack = () => setSelection(null);

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