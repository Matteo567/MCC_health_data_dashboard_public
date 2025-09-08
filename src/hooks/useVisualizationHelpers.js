/*
 useVisualizationHelpers.js - Visualization Helper Functions Hook
 
 This hook provides common visualization management functions including managing
 chart expansion and collapse states, handling visualization rendering logic,
 providing shared functionality between dashboard types, and managing expanded
 item state across components.
 
 Reduces code duplication between PatientDashboard and PhysicianDashboard components.
 */

import React from 'react';
import Placeholder from '../components/ui/Placeholder';

/*
 Shared hook for common visualization helper functions
 Extracts duplicate logic from PatientDashboard and PhysicianDashboard
 
 - @param {string} patientId - The patient identifier
 - @param {Object} allVisualizations - All available visualizations
 - @param {Object} selectedVisualizations - Currently selected visualizations
 - @returns {Object} Helper functions and state
 */
const useVisualizationHelpers = (patientId, allVisualizations, selectedVisualizations) => {
  const [expandedItem, setExpandedItem] = React.useState(null);

  const handleExpand = React.useCallback((itemId) => {
    setExpandedItem(prev => (prev === itemId ? null : itemId));
  }, []);

  const renderVisualization = React.useCallback((visualizationType, itemId) => {
    if (!patientId) {
      return <Placeholder message="Please select a patient to view data." type="select-patient" />;
    }
    
    const viz = allVisualizations[visualizationType];
    if (!viz) return <Placeholder message="Invalid visualization" type="error" />;

    const Component = viz.component;
    const isExpanded = expandedItem === itemId;
    return <Component 
      patientId={patientId} 
      isExpanded={isExpanded} 
      onExpand={() => handleExpand(itemId)}
      viewMode="patient" // This will be overridden by the calling component
    />;
  }, [patientId, allVisualizations, expandedItem, handleExpand]);

  return {
    expandedItem,
    handleExpand,
    renderVisualization
  };
};

export default useVisualizationHelpers;
