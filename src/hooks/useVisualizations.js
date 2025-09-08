/*
 useVisualizations.js - Visualization Management Hook
 
 This hook manages the visualization system across dashboard types by creating and
 maintaining visualization component registry, determining available visualizations
 based on data availability, managing visualization selection and ordering, and
 supporting both patient and physician dashboard configurations.
 
 Architecture:
 - Uses React hooks for state management and memoization
 - Implements component registry pattern for dynamic rendering
 - Provides data-driven visualization availability
 - Supports multiple dashboard configurations
 
 Visualization Types:
 - glucose: Blood glucose monitoring charts
 - bloodPressure: Blood pressure tracking charts
 - exercise: Physical activity visualization
 - mood: Mood calendar and tracking
 - pain: Pain reporting with body mapping
 - mealContents: Nutritional intake tracking
 - sleep: Sleep pattern analysis
 
 Component Registry:
 - Maps visualization types to React components
 - Provides configuration for each visualization type
 - Handles component imports and lazy loading
 - Maintains consistent component interfaces
 
 Data Availability:
 - Checks data availability for each visualization type
 - Filters visualizations based on actual data presence
 - Provides fallback for missing data scenarios
 - Ensures only relevant visualizations are shown
 */

import React, { useState, useMemo } from 'react';
import { VISUALIZATION_CONFIG, DASHBOARD_CONFIG } from '../constants';

// Import all chart components
import GlucoseChart from '../components/patient_charts/GlucoseChart';
import BloodPressureChart from '../components/patient_charts/BloodPressureChart';
import ExerciseChart from '../components/patient_charts/ExerciseChart';
import MoodCalendar from '../components/patient_charts/MoodCalendar';
import PainChart from '../components/patient_charts/PainChart';
import MealContentsChart from '../components/patient_charts/MealContentsChart';
import SleepChart from '../components/patient_charts/SleepChart';

/*
 Shared hook for managing visualizations across different dashboard types
 
 @param {string} viewMode - 'patient' or 'physician'
 @param {Object} data - Patient data object
 @returns {Object} Visualization state and utilities
 */
const useVisualizations = (viewMode, data) => {
  const config = DASHBOARD_CONFIG[viewMode];
  
  // Create visualization registry with components
  const allVisualizations = useMemo(() => ({
    pain: { ...VISUALIZATION_CONFIG.pain, component: PainChart },
    bloodPressure: { ...VISUALIZATION_CONFIG.bloodPressure, component: BloodPressureChart },
    glucose: { ...VISUALIZATION_CONFIG.glucose, component: GlucoseChart },
    exercise: { ...VISUALIZATION_CONFIG.exercise, component: ExerciseChart },
    mealContents: { ...VISUALIZATION_CONFIG.mealContents, component: MealContentsChart },
    mood: { ...VISUALIZATION_CONFIG.mood, component: MoodCalendar },
    sleep: { ...VISUALIZATION_CONFIG.sleep, component: SleepChart },
  }), []);

  // Determine available visualizations based on data
  const availableVisualizations = useMemo(() => {
    if (!data) return {};

    return Object.entries(allVisualizations).reduce((acc, [key, viz]) => {
      const dataKey = `${key}Data`;
      // Special case for meal contents
      if (key === 'mealContents' && data['mealData'] && data['mealData'].length > 0) {
        acc[key] = viz;
      } else if (data[dataKey] && data[dataKey].length > 0) {
        acc[key] = viz;
      }
      return acc;
    }, {});
  }, [data, allVisualizations]);

  // Create dynamic selected visualizations based on available ones
  const selectedVisualizations = useMemo(() => {
    const availableKeys = Object.keys(availableVisualizations);
    
    // Create chart IDs for all available visualizations in the same order as they appear
    const chartIds = availableKeys.map((_, index) => `${viewMode}-chart-${index}`);
    
    return chartIds.reduce((acc, chartId, index) => {
      acc[chartId] = availableKeys[index];
      return acc;
    }, {});
  }, [availableVisualizations, viewMode]);

  const handleVisualizationChange = (chartId, visualizationType) => {
    // This function is kept for compatibility but may not be needed
    // since we're now showing all available visualizations
  };

  return {
    allVisualizations,
    availableVisualizations,
    selectedVisualizations,
    handleVisualizationChange,
    config
  };
};

export default useVisualizations;
