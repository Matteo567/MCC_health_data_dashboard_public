/*
 usePatientData.js - Patient Data Management Hook
 
 This custom hook manages all patient data operations including fetching and caching
 patient data from CSV files, providing loading, error, and data states, handling
 data validation and error recovery, and offering convenient access to individual
 health metric datasets.
 
 Architecture:
 - Uses React hooks for state management (useState, useEffect, useCallback)
 - Implements data caching to optimize performance
 - Provides comprehensive error handling and recovery
 - Offers convenient data access patterns for components
 
 State Management:
 - data: The complete patient data object
 - loading: Boolean indicating if data is being fetched
 - error: Error message if data fetching failed
 - lastFetchedId: Tracks the last patient ID to prevent unnecessary re-fetching
 
 Data Structure:
 - patientInfo: Patient demographics and medical information
 - glucoseData: Blood glucose readings with timestamps and ranges
 - bloodPressureData: Blood pressure measurements with systolic/diastolic values
 - exerciseData: Physical activity tracking with duration and type
 - moodData: Daily mood assessments
 - painData: Pain reports with location and intensity
 - sleepData: Sleep duration and quality measurements
 - mealData: Nutritional intake tracking
 
 Utility Functions:
 - refetch: Forces a fresh data fetch for the current patient
 - clearData: Clears all cached data and resets state
 - hasData: Boolean indicating if data is available
 - isEmpty: Boolean indicating if no data is available and not loading
 - isError: Boolean indicating if an error occurred
 */

import { useState, useEffect, useCallback } from 'react';
import DataService from '../services/dataService';

/*
 Enhanced custom hook for loading and managing patient data
 
 - @param {string} patientId - The patient identifier
 - @returns {Object} Object containing data, loading state, error state, and utility functions
 */
const usePatientData = (patientId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchedId, setLastFetchedId] = useState(null);

  const loadData = useCallback(async (id) => {
    // Don't reload if we already have data for this patient
    if (id === lastFetchedId && data && !error) {
      return;
    }

    if (!id || typeof id !== 'string') {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const patientData = await DataService.getPatientData(id);
      
      if (patientData && patientData.patientInfo) {
        setData(patientData);
        setLastFetchedId(id);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(null);
      console.error('Error loading patient data:', err);
    } finally {
      setLoading(false);
    }
  }, [lastFetchedId, data, error]);

  useEffect(() => {
    if (patientId) {
      loadData(patientId);
    } else {
      setData(null);
      setError(null);
      setLastFetchedId(null);
      setLoading(false);
    }
  }, [patientId, loadData]);

  const refetch = useCallback(() => {
    if (patientId) {
      setLastFetchedId(null); // Force reload
      loadData(patientId);
    }
  }, [patientId, loadData]);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetchedId(null);
    setLoading(false);
  }, []);

  return {
    // Core data
    data,
    loading,
    error,
    
    // Patient info
    patientInfo: data?.patientInfo || null,
    
    // Individual data types for convenience
    glucoseData: data?.glucoseData || [],
    bloodPressureData: data?.bloodPressureData || [],
    exerciseData: data?.exerciseData || [],
    moodData: data?.moodData || [],
    painData: data?.painData || [],
    mealData: data?.mealData || [],
    sleepData: data?.sleepData || [],
    
    // Actions
    refetch,
    clearData,
    
    // Helper flags
    hasData: !!data,
    isEmpty: !loading && !error && !data,
    isError: !!error,
    
    // Data availability flags
    hasGlucoseData: (data?.glucoseData || []).length > 0,
    hasBloodPressureData: (data?.bloodPressureData || []).length > 0,
    hasExerciseData: (data?.exerciseData || []).length > 0,
    hasMoodData: (data?.moodData || []).length > 0,
    hasPainData: (data?.painData || []).length > 0,
    hasSleepData: (data?.sleepData || []).length > 0,
    hasMealData: (data?.mealData || []).length > 0
  };
};

export default usePatientData;
