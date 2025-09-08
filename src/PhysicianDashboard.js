/*
 PhysicianDashboard.js - Physician View Dashboard Component
 
 This component renders the physician-focused dashboard view with clinical overview
 optimized for healthcare providers, patient information with medical context,
 chart expansion capabilities, and support for clinical notes and observations.
 
 Architecture:
 - Designed for physicians to monitor multiple health metrics simultaneously
 - Provides clinical summaries and statistical analysis
 - Implements professional medical interface design
 - Handles patient selection and data validation
 
 Custom Hooks Used:
 - usePatientData: Manages patient data fetching and caching
 - useVisualizations: Handles visualization configuration and availability
 - useVisualizationHelpers: Provides chart expansion and rendering utilities
 - useChartNavigation: Manages time-based navigation for each chart type
 
 Component Structure:
 - Physician header with clinical context
 - PatientInfoCard: Displays patient demographics and medical information
 - DashboardGrid: Renders the chart grid with clinical summaries
 - Individual chart components with physician-specific features
 
 State Management:
 - Manages selected patient state independently from parent
 - Uses custom hooks for centralized state management
 - Handles chart expansion state through useVisualizationHelpers
 - Manages navigation state for each chart type independently
 
 Clinical Features:
 - Summary statistics for each health metric
 - Trend analysis and pattern recognition
 - Professional medical interface design
 - Comprehensive data visualization for clinical decision making
 */

import React, { useState } from 'react';
import usePatientData from './hooks/usePatientData';
import useVisualizations from './hooks/useVisualizations';
import useVisualizationHelpers from './hooks/useVisualizationHelpers';
import useChartNavigation from './hooks/useChartNavigation';
import PatientInfoCard from './components/PatientInfoCard';
import DashboardGrid from './components/DashboardGrid';
import Placeholder from './components/ui/Placeholder';
import './PhysicianDashboard.css';

const PhysicianDashboard = ({ patientId: initialPatientId }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const { data, loading, error } = usePatientData(selectedPatientId);
  
  // Update selected patient if prop changes
  React.useEffect(() => {
    if (initialPatientId && initialPatientId !== selectedPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId, selectedPatientId]);

  const { 
    allVisualizations, 
    availableVisualizations, 
    selectedVisualizations, 
    handleVisualizationChange 
  } = useVisualizations('physician', data);

  const { expandedItem, handleExpand, renderVisualization } = useVisualizationHelpers(
    selectedPatientId, 
    allVisualizations, 
    selectedVisualizations
  );

  // Create universal navigation for each chart type
  const glucoseNavigation = useChartNavigation('glucose');
  const bloodPressureNavigation = useChartNavigation('bloodPressure');
  const exerciseNavigation = useChartNavigation('exercise');
  const sleepNavigation = useChartNavigation('sleep');
  const painNavigation = useChartNavigation('pain');
  const moodNavigation = useChartNavigation('mood');
  const mealContentsNavigation = useChartNavigation('mealContents');

  const chartNavigation = {
    glucose: glucoseNavigation,
    bloodPressure: bloodPressureNavigation,
    exercise: exerciseNavigation,
    sleep: sleepNavigation,
    pain: painNavigation,
    mood: moodNavigation,
    mealContents: mealContentsNavigation
  };

  // Override renderVisualization to set correct viewMode and handle no patient case
  const renderVisualizationWithMode = (visualizationType, windowId) => {
    if (!selectedPatientId) {
      return <Placeholder message="Please select a patient to view data." type="select-patient" />;
    }
    
    const viz = allVisualizations[visualizationType];
    if (!viz) return <Placeholder message="Invalid visualization" type="error" />;

    const Component = viz.component;
    const isExpanded = expandedItem === windowId;
    const navigation = chartNavigation[visualizationType];
    
    return <Component 
      patientId={selectedPatientId} 
      viewMode="physician"
      isExpanded={isExpanded}
      onExpand={() => handleExpand(windowId)}
      navigation={navigation}
    />;
  };

  const patientInfo = data?.patientInfo;

  return (
    <div className="physician-dashboard">
      <div className="physician-header">
        <h1>Physician Dashboard</h1>
      </div>

      {selectedPatientId && (
        <div className="dashboard-content">
          <PatientInfoCard 
            patientInfo={patientInfo}
            loading={loading}
            error={error}
            variant="physician"
            className="patient-info-card-physician"
          />

          <DashboardGrid
            viewMode="physician"
            selectedVisualizations={selectedVisualizations}
            availableVisualizations={availableVisualizations}
            allVisualizations={allVisualizations}
            onVisualizationChange={handleVisualizationChange}
            onExpand={handleExpand}
            expandedItem={expandedItem}
            renderVisualization={renderVisualizationWithMode}
            chartNavigation={chartNavigation}
            disabled={Object.keys(availableVisualizations).length === 0}
            placeholderText="No data available for this patient."
          />
        </div>
      )}
    </div>
  );
};

export default PhysicianDashboard;
