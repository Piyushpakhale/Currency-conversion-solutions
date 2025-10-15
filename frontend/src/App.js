import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BlockchainProvider } from './context/BlockchainContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BankDashboard from './components/BankDashboard';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BlockchainProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bank" element={<BankDashboard />} />
          </Routes>
        </Router>
      </BlockchainProvider>
    </ThemeProvider>
  );
}

export default App;
