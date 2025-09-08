/*
 useChartNavigation.js - Universal Chart Navigation Hook
 
 This hook provides consistent navigation functionality for all charts including
 week/month navigation based on chart type, date range calculations and formatting,
 navigation state management, previous/next navigation functions, and display
 formatting for current time periods.
 
 Ensures consistent navigation behavior across all health metric visualizations.
 */

import { useState, useCallback } from 'react';

/*
 Universal navigation hook for chart components
 Provides navigation state and functions that can be used by any chart
 
 - @param {string} chartType - The type of chart (glucose, bloodPressure, etc.)
 - @param {Date} initialDate - Initial date for navigation (defaults to May 1, 2025)
 - @returns {Object} Navigation state and functions
 */
const useChartNavigation = (chartType, initialDate = new Date(2025, 4, 1)) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Determine navigation type based on chart type
  const navigationType = chartType === 'mood' ? 'month' : 'week';
  const navigationLabel = chartType === 'mood' ? 'Month' : 'Week';

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (navigationType === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  }, [navigationType]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (navigationType === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  }, [navigationType]);

  // Calculate date range based on navigation type
  const getDateRange = useCallback(() => {
    if (navigationType === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return { start: startOfWeek, end: endOfWeek };
    }
  }, [currentDate, navigationType]);

  // Get current month/year display
  const getCurrentMonthYear = useCallback(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Get current week display
  const getCurrentWeekDisplay = useCallback(() => {
    const { start, end } = getDateRange();
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  }, [getDateRange]);

  // Calculate 3-month date range dynamically based on current date
  const getThreeMonthRange = useCallback(() => {
    // Calculate 3 months back from the current date
    const endOfThreeMonths = new Date(currentDate);
    const startOfThreeMonths = new Date(currentDate);
    startOfThreeMonths.setMonth(startOfThreeMonths.getMonth() - 3);
    
    // Ensure we don't go before the data start date (July 1, 2024)
    const dataStartDate = new Date(2024, 6, 1); // July 1, 2024
    if (startOfThreeMonths < dataStartDate) {
      startOfThreeMonths.setTime(dataStartDate.getTime());
    }
    
    // Ensure we don't go beyond the data end date (July 31, 2025)
    const dataEndDate = new Date(2025, 6, 31); // July 31, 2025
    if (endOfThreeMonths > dataEndDate) {
      endOfThreeMonths.setTime(dataEndDate.getTime());
    }
    
    return { start: startOfThreeMonths, end: endOfThreeMonths };
  }, [currentDate]);

  // Get 3-month display string dynamically
  const getThreeMonthDisplay = useCallback(() => {
    const { start, end } = getThreeMonthRange();
    const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }, [getThreeMonthRange]);

  return {
    currentDate,
    navigationType,
    navigationLabel,
    goToPrevious,
    goToNext,
    getDateRange,
    getThreeMonthRange,
    getCurrentMonthYear,
    getCurrentWeekDisplay,
    getThreeMonthDisplay
  };
};

export default useChartNavigation;
