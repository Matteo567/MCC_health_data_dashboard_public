/*
 SleepChart.js - Sleep Pattern Monitoring Visualization
 
 This component provides comprehensive sleep tracking:
 - Sleep duration and quality rating visualization
 - Weekly sleep pattern analysis
 - Color-coded sleep quality indicators
 - Interactive tooltips with sleep details
 - Navigation controls for time periods
 - Integration with patient data and chart navigation
 
 Architecture:
 - Uses custom SVG for bar chart visualization
 - Implements sleep quality categorization system
 - Provides color-coded quality indicators for easy interpretation
 - Supports expandable views
 - Implements time-based navigation and data filtering
 
 Visualizatoin Features:
 - Bar chart showing daily sleep duration
 - Color-coded quality indicators (Very good, Fairly good, Fairly bad, Very bad)
 - Interactive tooltips with detailed sleep information
 - Design adapting to container size
 - Dynamic Y-axis scaling based on sleep duration range
 
 Sleep Quality Categories:
 - Very good: Optimal sleep quality (green)
 - Fairly good: Good sleep quality (blue)
 - Fairly bad: Poor sleep quality (light green)
 - Very bad: Very poor sleep quality (dark green)
 
 Clinical Features:
 - Sleep duration tracking with recommended ranges
 - Quality assessment based on subjective ratings
 - Sleep consistency analysis
 - Summary statistics for physician view
 - Trend analysis over time periods
 
 Component Structure:
 - Chart Container: Main SVG container with sizing
 - Y-Axis: Duration scale with hour-based labeling
 - X-Axis: Day-of-week labels with date information
 - Data Bars: Sleep duration bars with quality color coding
 - Legend: Sleep quality explanations
 - Tooltip: Detailed sleep information on hover
 
 Essential for sleep hygiene monitoring and sleep disorder assessment.
 */

import React, { useState, useMemo, useRef } from 'react';

import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import './SleepChart.css';


const SleepChart = ({ patientId, isExpanded, onExpand, viewMode = 'patient', navigation }) => {
  const { sleepData, loading, error } = usePatientData(patientId, 'sleep');
  
  // Use navigation from parent or fallback to internal navigation
  const useInternalNavigation = !navigation;
  const internalNavigation = useChartNavigation('sleep');
  const nav = navigation || internalNavigation;

  const { start: startOfWeek, end: endOfWeek } = nav.getDateRange();
  const weekData = sleepData.filter(d => d.date >= startOfWeek && d.date <= endOfWeek);

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = sleepData.filter(d => d.date >= startOfThreeMonths && d.date <= endOfThreeMonths);

  const formatDateRange = (data) => {
    if (!data || data.length === 0) return '';
    const startDate = new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startDate} to ${endDate}`;
  };

  const qualityLevels = {
    'Very good': 'var(--chart-color-sleep-very-good)',
    'Fairly good': 'var(--chart-color-sleep-fairly-good)',
    'Fairly bad': 'var(--chart-color-sleep-fairly-bad)',
    'Very bad': 'var(--chart-color-sleep-very-bad)',
  };

  const getQualityColor = (quality) => qualityLevels[quality] || '#D3D3D3';

  const legendItems = Object.entries(qualityLevels).map(([label, color]) => ({
    label,
    color,
  }));

  // Calculate summary statistics for physician view
  const weekSummary = useMemo(() => {
    if (!weekData || weekData.length === 0) return null;

    const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);
    const avgHours = (totalHours / weekData.length).toFixed(1);

    // Count quality levels
    const qualityCounts = {};
    Object.keys(qualityLevels).forEach(quality => {
      qualityCounts[quality] = 0;
    });

    weekData.forEach(day => {
      if (qualityCounts[day.quality] !== undefined) {
        qualityCounts[day.quality]++;
      }
    });

    // Find most common quality
    const mostCommonQuality = Object.entries(qualityCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate sleep consistency (how much variation in sleep hours)
    const hourVariations = weekData.map(day => Math.abs(day.hours - parseFloat(avgHours)));
    const avgVariation = (hourVariations.reduce((sum, v) => sum + v, 0) / hourVariations.length).toFixed(1);

    // Sleep quality score (Very good=4, Fairly good=3, Fairly bad=2, Very bad=1)
    const qualityScores = {
      'Very good': 4,
      'Fairly good': 3,
      'Fairly bad': 2,
      'Very bad': 1
    };
    const avgQualityScore = weekData.reduce((sum, day) => sum + (qualityScores[day.quality] || 0), 0) / weekData.length;
    const qualityAssessment = avgQualityScore >= 3.5 ? 'Good' : avgQualityScore >= 2.5 ? 'Fair' : 'Poor';

    // Count nights with adequate sleep (7+ hours)
    const adequateSleepNights = weekData.filter(day => day.hours >= 7).length;

    return {
      totalHours: totalHours.toFixed(1),
      avgHours,
      mostCommonQuality: mostCommonQuality[0],
      mostCommonQualityCount: mostCommonQuality[1],
      avgVariation,
      qualityAssessment,
      adequateSleepNights,
      daysTracked: weekData.length
    };
  }, [weekData]);

  // Calculate 3-month summary statistics for physician view
  const threeMonthSummary = useMemo(() => {
    if (!threeMonthData || threeMonthData.length === 0) return null;

    const totalHours = threeMonthData.reduce((sum, day) => sum + day.hours, 0);
    const avgHours = (totalHours / threeMonthData.length).toFixed(1);

    // Count quality levels
    const qualityCounts = {};
    Object.keys(qualityLevels).forEach(quality => {
      qualityCounts[quality] = 0;
    });

    threeMonthData.forEach(day => {
      if (qualityCounts[day.quality] !== undefined) {
        qualityCounts[day.quality]++;
      }
    });

    // Find most common quality
    const mostCommonQuality = Object.entries(qualityCounts)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate sleep consistency (how much variation in sleep hours)
    const hourVariations = threeMonthData.map(day => Math.abs(day.hours - parseFloat(avgHours)));
    const avgVariation = (hourVariations.reduce((sum, v) => sum + v, 0) / hourVariations.length).toFixed(1);

    return {
      totalHours: totalHours.toFixed(1),
      avgHours,
      mostCommonQuality: mostCommonQuality[0],
      mostCommonQualityCount: mostCommonQuality[1],
      avgVariation,
      daysTracked: threeMonthData.length
    };
  }, [threeMonthData]);

  return (
      <div className="sleep-chart-content">
        <h3 className="chart-title">Sleep Quality & Duration</h3>
        <h4 className="chart-subtitle">{nav.getCurrentMonthYear()}</h4>
        <div className="sleep-chart">
          {/* Sleep Quality Indicators Row */}
          <div className="sleep-quality-row">
            {weekData.map((day, index) => (
              <div key={`quality-${index}`} className="sleep-quality-item">
                <div 
                  className="sleep-quality-indicator"
                  style={{ backgroundColor: getQualityColor(day.quality) }}
                ></div>
              </div>
            ))}
          </div>
          
          {/* Bed Icons Row */}
          <div className="bed-icons-row">
            {weekData.map((day, index) => (
              <div key={`bed-${index}`} className="bed-item">
                <div className="bed-icon-wrapper">
                  <svg viewBox="0 0 486.5 225.1" className="bed-icon">
                    <path d="M471.9,68.9c-8,0-14.5,6.5-14.5,14.5v68.6H26.1l-.6-139.3c0-7-5.8-12.7-12.8-12.7h0C5.7,0,0,5.7,0,12.8v199.6c0,7,5.7,12.8,12.7,12.8s12.8-5.7,12.8-12.8v-37h431.9v35.2c0,8,6.5,14.5,14.5,14.5s14.5-6.5,14.5-14.5v-127.1c0-8-6.5-14.5-14.5-14.5ZM483.7,210.6c0,6.5-5.3,11.8-11.8,11.8s-11.8-5.3-11.8-11.8v-38H22.7v39.7c0,5.5-4.5,10-10,10s-10-4.5-10-10V12.8C2.8,7.3,7.3,2.8,12.7,2.8h0c5.5,0,9.9,4.5,10,9.9l.6,142.1h436.8v-71.4c0-6.5,5.3-11.7,11.8-11.7s11.8,5.3,11.8,11.7v127.1Z" fill="#D2B48C"/>
                    <path d="M29.9,94.2v54.5h425.4v-54.5H29.9ZM452.5,145.9H32.7v-48.9h419.8v48.9Z" fill="#e0e0e0"/>
                    <rect x="32.7" y="97" width={`${(day.hours / 10) * 419.8}`} height="48.9" fill="#FF4500" className="sleep-fill-rect" />
                    <path d="M112.8,46.3h-55.4c-12.1,0-22,9.9-22,22s9.9,22,22,22h55.4c12.1,0,22-9.9,22-22s-9.9-22-22-22ZM112.8,87.5h-55.4c-10.6,0-19.2-8.6-19.2-19.2s8.6-19.2,19.2-19.2h55.4c10.6,0,19.2,8.6,19.2,19.2s-8.6,19.2-19.2,19.2Z" fill="#FFFFFF" stroke="#AAAAAA" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sleep Information Row */}
          <div className="sleep-info-row">
            {weekData.map((day, index) => (
              <div key={`info-${index}`} className="sleep-info-item">
                <div className="sleep-hours">{day.hours.toFixed(1)}h</div>
                <div className="day-label">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(day.date).getDay()]}</div>
                <div className="date-label">{new Date(day.date).getDate()}</div>
              </div>
            ))}
          </div>
        </div>
        
        <Legend title="Sleep Quality" items={legendItems} />

        {/* Show summary for physician view only */}
        {viewMode === 'physician' && weekSummary && (
          <div className="summary-container">
            <div className="chart-summary">
              <h4>Week Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Average Sleep:</span>
                  <span className="stat-value">
                    {weekSummary.avgHours} hours/night
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Sleep:</span>
                  <span className="stat-value">
                    {weekSummary.totalHours} hours
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sleep Consistency:</span>
                  <span className="stat-value">
                    ±{weekSummary.avgVariation} hours variation
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Common Quality:</span>
                  <span className="stat-value">
                    {weekSummary.mostCommonQuality} ({weekSummary.mostCommonQualityCount}x)
                  </span>
                </div>

              </div>
            </div>
            
            {threeMonthSummary && (
              <div className="chart-summary">
                <h4>3-Month Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Average Sleep:</span>
                    <span className="stat-value">
                      {threeMonthSummary.avgHours} hours/night
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Sleep:</span>
                    <span className="stat-value">
                      {threeMonthSummary.totalHours} hours
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Sleep Consistency:</span>
                    <span className="stat-value">
                      ±{threeMonthSummary.avgVariation} hours variation
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Common Quality:</span>
                    <span className="stat-value">
                      {threeMonthSummary.mostCommonQuality} ({threeMonthSummary.mostCommonQualityCount}x)
                    </span>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
};

export default SleepChart;
