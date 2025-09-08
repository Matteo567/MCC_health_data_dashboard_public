/*
 PatientDashboard.js - Patient View Dashboard Component
 
 This component renders the patient-focused dashboard view with patient information,
 chart navigation controls, expandable chart views, and integration with all health
 metric visualizations.
 
 Architecture:
 - Uses custom hooks for data management, visualization handling, and navigation
 - Implements expandable chart views
 - Provides educational information for patients
 - Handles loading and error states gracefully
 
 Custom Hooks Used:
 - usePatientData: Manages patient data fetching and caching
 - useVisualizations: Handles visualization configuration and availability
 - useVisualizationHelpers: Provides chart expansion and rendering utilities
 - useChartNavigation: Manages time-based navigation for each chart type
 
 Component Structure:
 - PatientInfoCard: Displays patient demographics and medication information
 - DashboardGrid: Renders the chart grid with navigation and expansion controls
 - Individual chart components for each health metric
 
 State Management:
 - Uses custom hooks for centralized state management
 - Handles chart expansion state through useVisualizationHelpers
 - Manages navigation state for each chart type independently
 */

import React from 'react';
import usePatientData from './hooks/usePatientData';
import useVisualizations from './hooks/useVisualizations';
import useVisualizationHelpers from './hooks/useVisualizationHelpers';
import useChartNavigation from './hooks/useChartNavigation';
import PatientInfoCard from './components/PatientInfoCard';
import DashboardGrid from './components/DashboardGrid';
import './PatientDashboard.css';

const PatientDashboard = ({ patientId }) => {
  const { data, loading, error } = usePatientData(patientId);
  const { 
    allVisualizations, 
    availableVisualizations, 
    selectedVisualizations, 
    handleVisualizationChange 
  } = useVisualizations('patient', data);
  
  const { expandedItem, handleExpand, renderVisualization } = useVisualizationHelpers(
    patientId, 
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

  // Override renderVisualization to set correct viewMode
  const renderVisualizationWithMode = (visualizationType, boxId) => {
    const viz = allVisualizations[visualizationType];
    if (!viz) return <div>Invalid visualization</div>;

    const Component = viz.component;
    const isExpanded = expandedItem === boxId;
    const navigation = chartNavigation[visualizationType];
    
    return <Component 
      patientId={patientId} 
      isExpanded={isExpanded} 
      onExpand={() => handleExpand(boxId)}
      viewMode="patient"
      navigation={navigation}
    />;
  };

  const patientInfo = data?.patientInfo;

  if (loading) return <div className="loading-screen">Loading patient data...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div className="patient-dashboard">
      <PatientInfoCard 
        patientInfo={patientInfo}
        loading={loading}
        error={error}
        variant="patient"
      />

      <DashboardGrid
        viewMode="patient"
        selectedVisualizations={selectedVisualizations}
        availableVisualizations={availableVisualizations}
        allVisualizations={allVisualizations}
        onVisualizationChange={handleVisualizationChange}
        onExpand={handleExpand}
        expandedItem={expandedItem}
        renderVisualization={renderVisualizationWithMode}
        chartNavigation={chartNavigation}
      />
    </div>
  );
};

export default PatientDashboard;
