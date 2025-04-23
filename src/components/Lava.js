import React, { useState } from 'react';
import SelectionPage from './SelectionPage';
import Dashboard from './Dashboard';

const Lava = () => {
  const [selection, setSelection] = useState(null);

  return (
    <div>
      {!selection ? (
        <SelectionPage onSubmit={setSelection} />
      ) : (
        <Dashboard selection={selection} />
      )}
    </div>
  );
};

export default Lava;