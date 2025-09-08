/*
 App.js - Main Health Dashboard Application Component
 
 This is the root component that provides the main application structure.
 It manages the role toggle between Patient and Physician views, patient selection,
 and provides the main routing structure for the dashboard.
 
 Features:
 - Role toggle between Patient and Physician views
 - Patient selection from 100 synthetic patients
 - Unified dashboard routing with lazy loading
 - Error boundary and loading state management
 - Header with application title and controls
 
 Component Structure:
 - Header: Contains title, role toggle, and patient selector
 - Main: Contains the dashboard with error boundary and loading states
 - Dashboard: Renders either PatientDashboard or PhysicianDashboard based on role
 
 State Management:
 - selectedPatient: Currently selected patient ID
 - currentRole: Current view mode ('patient' or 'physician')
 */

import React, { useState, Suspense } from 'react';
import PatientSelector from './PatientSelector';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Switch from './components/ui/Switch';
import { PATIENTS } from './constants/index';
import './App.css';

  // Lazy load the unified dashboard component for better performance
  const Dashboard = React.lazy(() => import('./components/Dashboard'));

  /*
   Main Health Dashboard Application
   Features both Patient and Physician views with role toggle
   */
function App() {
  const [selectedPatient, setSelectedPatient] = useState('Patient_001');
  const [currentRole, setCurrentRole] = useState('patient'); // 'patient' or 'physician'

  const toggleRole = () => {
    setCurrentRole(prev => prev === 'patient' ? 'physician' : 'patient');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Health Dashboard</h1>
          
          {/* Role Toggle */}
          <div className="role-toggle">
            <Switch
              checked={currentRole === 'physician'}
              onChange={toggleRole}
              leftLabel="Patient View"
              rightLabel="Physician View"
            />
          </div>

          {/* Patient Selector */}
          <div className="patient-selector">
            <label htmlFor="patient-select">Select Patient:</label>
            <PatientSelector
              id="patient-select"
              patients={PATIENTS}
              value={selectedPatient}
              onChange={setSelectedPatient}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
            <Dashboard 
              patientId={selectedPatient} 
              viewMode={currentRole}
            />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;