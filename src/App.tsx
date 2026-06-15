import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { currentConfig } from '@/configs';
import { validateConfig, ValidationReport } from '@/configs/validator';
import { ConfigReport } from '@/components';
import './index.css';

const App: React.FC = () => {
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  useEffect(() => {
    const report = validateConfig(currentConfig);
    setValidationReport(report);
  }, []);

  return (
    <BrowserRouter>
      <AppRouter />
      <ConfigReport report={validationReport} config={currentConfig} />
    </BrowserRouter>
  );
};

export default App;
