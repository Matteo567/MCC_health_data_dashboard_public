/*
 BloodPressureChart.js - Blood Pressure Monitoring Visualization
 
 This component provides comprehensive blood pressure tracking:
 - Systolic and diastolic pressure visualization
 - Risk categorization with color coding
 - Daily and weekly trend analysis
 - Multiple daily measurements display
 - Interactive tooltips with BP details
 - Navigation controls for time periods
 
 ARCHITECTURE:
 - Uses custom SVG for precise blood pressure visualization
 - Implements dual-axis system for systolic and diastolic values
 - Provides risk-based color coding for clinical interpretation
 - Supports multiple daily readings with time-based positioning
 - Implements configurable layouts
 
 Visualization Features:
 - Dual-line chart showing systolic and diastolic trends
 - Color-coded risk categories (normal, elevated, high, crisis)
 - Time-based positioning for multiple daily readings
 - Interactive tooltips with detailed BP information
 - Grid system with proper axis scaling
 
 CLlinical Features:
 - Risk categorization based on medical guidelines
 - Summary statistics for physician view
 - Trend analysis over time periods
 - Educational information for patient view
 
 Component Structure:
 - Y-Axis: Dual-axis system for systolic and diastolic values
 - X-Axis: Time-based axis with day and time labels
 - DataPoints: Interactive blood pressure readings
 - Legend: Risk category explanations
 - Tooltip: Detailed reading information
 
 Critical for cardiovascular health monitoring and hypertension management.
 */

import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import usePatientData from '../../hooks/usePatientData';
import useChartNavigation from '../../hooks/useChartNavigation';
import Legend from '../Legend';
import InfoBox from '../InfoBox';
import Tooltip from '../ui/Tooltip';
import './BloodPressureChart.css';
import { createChartConfig } from '../chart-utils/ChartConfigFactory';

// Constants
const TIME_LABELS = ['12a', '12p', '12a'];
const TIME_HOURS = [0, 12, 24];

// Helper Functions
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const formatDayLabel = (date) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
};

const getTimePosition = (date, dayIndex, config) => {
  const hour = date.getHours() + date.getMinutes() / 60;
  const timeRatio = hour / 24;
  const dayContentWidth = config.dayWidth - config.dayPadding * 2;
  return config.padding.left + (dayIndex * config.dayWidth) + config.dayPadding + (timeRatio * dayContentWidth);
};

// Chart Sub-components

const YAxis = ({ config, type }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const yAxisLabels = config.yAxisLabels[type];
  const valueRange = config.yAxisRange[type];
  const yOffset = config.yAxisOffset[type];

  return (
    <g className="y-axis">
      <text
        x={config.padding.left / 3}
        y={config.padding.top + chartHeight / 2}
        fontSize={config.fontSize.yAxisTitle}
        textAnchor="middle"
        className="y-axis-title"
        transform={`rotate(-90, ${config.padding.left / 3}, ${config.padding.top + chartHeight / 2})`}
      >
        mm Hg
      </text>
      {yAxisLabels.map(value => {
        const y = config.height - config.padding.bottom - ((value - yOffset) / valueRange) * chartHeight;
        return (
          <g key={value} className="y-axis-grid-group">
                        <line className="chart-grid-line-horizontal" x1={config.padding.left} y1={y} x2={config.width - config.padding.right} y2={y} />
            <text x={config.padding.left - 10} y={y + 3} fontSize={config.fontSize.yAxis} textAnchor="end" className="chart-tick-label">{value}</text>
          </g>
        );
      })}
    </g>
  );
};

const XAxis = ({ config, weekDays }) => (
  <g className="x-axis">
    {weekDays.map((day, dayIndex) => {
      const dayX = config.padding.left + dayIndex * config.dayWidth;
      const dayCenterX = dayX + config.dayWidth / 2;
      
      // Tick positions
      const startTickX = dayX;
      const middleTickX = dayX + config.dayWidth / 2;

      return (
        <g key={dayIndex} className="x-axis-label-group">
          {/* X-axis tick marks */}
          <line 
            className="x-axis-tick" 
            x1={startTickX} 
            y1={config.height - config.padding.bottom} 
            x2={startTickX} 
            y2={config.height - config.padding.bottom + 5}
            stroke="var(--chart-color-neutral)"
            strokeWidth="1"
          />
          <line 
            className="x-axis-tick" 
            x1={middleTickX} 
            y1={config.height - config.padding.bottom} 
            x2={middleTickX} 
            y2={config.height - config.padding.bottom + 5}
            stroke="var(--chart-color-neutral)"
            strokeWidth="1"
          />
          
          {/* Time labels positioned at tick marks */}
          <text
            className="time-label"
            x={startTickX}
            y={config.height - config.padding.bottom + 15}
            textAnchor="middle"
            fontSize={config.fontSize.timeLabel}
            style={{fontSize: '8px'}}
          >
            12a
          </text>
          <text
            className="time-label"
            x={middleTickX}
            y={config.height - config.padding.bottom + 15}
            textAnchor="middle"
            fontSize={config.fontSize.timeLabel}
            style={{fontSize: '8px'}}
          >
            12p
          </text>

          {/* Day and Date Labels */}
          <text
            x={dayCenterX}
            y={config.height - config.padding.bottom + 35}
            textAnchor="middle"
            className="x-axis-day-label"
            fontSize={config.fontSize.dayLabel}
            style={{fontSize: '8px'}}
          >
            {formatDayLabel(day)}
          </text>
          <text
            x={dayCenterX}
            y={config.height - config.padding.bottom + 52}
            textAnchor="middle"
            className="x-axis-date-label"
            fontSize={config.fontSize.dateLabel}
            style={{fontSize: '8px'}}
          >
            {day.getDate()}
          </text>
        </g>
      );
    })}
    {/* Final tick mark at the end of the last day */}
    <line 
      className="x-axis-tick" 
      x1={config.padding.left + weekDays.length * config.dayWidth} 
      y1={config.height - config.padding.bottom} 
      x2={config.padding.left + weekDays.length * config.dayWidth} 
      y2={config.height - config.padding.bottom + 5}
      stroke="var(--chart-color-neutral)"
      strokeWidth="1"
    />
    <text
      className="time-label"
      x={config.padding.left + weekDays.length * config.dayWidth}
      y={config.height - config.padding.bottom + 15}
      textAnchor="middle"
      fontSize={config.fontSize.timeLabel}
      style={{fontSize: '8px'}}
    >
      12a
    </text>
  </g>
);

const GridLines = ({ config, weekDays }) => (
  <g className="grid-lines">
    {/* Vertical day and time lines */}
    {weekDays.map((_, dayIndex) => {
      const dayX = config.padding.left + dayIndex * config.dayWidth;
      return (
        <g key={dayIndex}>
          <line className="chart-grid-line-vertical" x1={dayX} y1={config.padding.top} x2={dayX} y2={config.height - config.padding.bottom} />
          {/* Time lines at 12am and 12pm within each day */}
          {[0, 12].map(hour => {
            const timeRatio = hour / 24;
            const x = config.padding.left + (dayIndex * config.dayWidth) + (timeRatio * config.dayWidth);
            return <line key={`${dayIndex}-${hour}`} className="chart-grid-line-vertical-time" x1={x} y1={config.padding.top} x2={x} y2={config.height - config.padding.bottom} />;
          })}
        </g>
      );
    })}
    {/* Final grid line at the end of the last day */}
    <line 
      className="chart-grid-line-vertical" 
      x1={config.padding.left + weekDays.length * config.dayWidth} 
      y1={config.padding.top} 
      x2={config.padding.left + weekDays.length * config.dayWidth} 
      y2={config.height - config.padding.bottom} 
    />
  </g>
);

const DataBars = ({ readings, type, config, onBarHover, onBarLeave }) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const valueRange = config.yAxisRange[type];
  const yOffset = config.yAxisOffset[type];
  const getColor = type === 'systolic' ? getSystolicColor : getDiastolicColor;

  return (
    <g className="data-bars">
      {readings.map((reading, index) => {
        const readingDate = new Date(reading.date);
        const dayIndex = readingDate.getDay();
        const x = getTimePosition(readingDate, dayIndex, config);
        const value = reading[type];
        const barHeight = (value / valueRange) * chartHeight;
        const y = config.height - config.padding.bottom - barHeight;

        const handleMouseEnter = (event) => {
          const tooltipData = {
            type: type === 'systolic' ? 'Systolic' : 'Diastolic',
            value: value,
            unit: 'mmHg',
            time: readingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            date: readingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            position: { x: event.clientX, y: event.clientY }
          };
          onBarHover(tooltipData);
        };

        const handleMouseLeave = () => {
          onBarLeave();
        };

        return (
          <rect
            key={index}
            x={x - config.barWidth / 2}
            y={y}
            width={config.barWidth}
            height={Math.max(0, barHeight)}
            fill={getColor(value)}
            style={{ cursor: 'pointer' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </g>
  );
};

const Chart = ({ type, weekData, isExpanded, weekDays, containerWidth, onBarHover, onBarLeave }) => {
  const config = createChartConfig('bloodPressure', isExpanded, containerWidth);
  const readings = weekData.filter(d => d[type] && d[type] > 0);

  return (
    <div className={`chart-section ${isExpanded ? 'expanded' : ''}`}>
      <h4 className="chart-subtitle">{type === 'systolic' ? 'Systolic' : 'Diastolic'}</h4>
      <div className="bp-svg-container">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="chart-svg"
        >
          <GridLines config={config} weekDays={weekDays} />
          <YAxis config={config} type={type} />
          <XAxis config={config} weekDays={weekDays} />
          <DataBars readings={readings} type={type} config={config} onBarHover={onBarHover} onBarLeave={onBarLeave} />
        </svg>
      </div>
    </div>
  );
};

const getSystolicColor = (value) => {
  if (value < 90) return 'var(--chart-color-danger)';
  if (value < 120) return 'var(--chart-color-blue)';
  if (value < 140) return 'var(--chart-color-yellow)';
  return 'var(--chart-color-orange)';
};

const getDiastolicColor = (value) => {
  if (value < 60) return 'var(--chart-color-danger)';
  if (value < 80) return 'var(--chart-color-blue)';
  if (value < 90) return 'var(--chart-color-yellow)';
  return 'var(--chart-color-orange)';
};

const bloodPressureLegendItems = [
  { color: 'var(--chart-color-danger)', label: 'Low', description: 'Blood pressure below normal range' },
  { color: 'var(--chart-color-blue)', label: 'Ideal', description: 'Blood pressure within ideal range' },
  { color: 'var(--chart-color-yellow)', label: 'Pre-high', description: 'Blood pressure elevated but not yet high' },
  { color: 'var(--chart-color-orange)', label: 'High', description: 'Blood pressure high - requires attention' },
];


// --- Main Component ---
const BloodPressureChart = ({ patientId, isExpanded = false, onExpand, viewMode = 'patient', navigation }) => {
  const { bloodPressureData, loading, error } = usePatientData(patientId, 'bloodPressure');
  const [containerWidth, setContainerWidth] = useState(400);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Use navigation from parent or fallback to internal navigation
  const useInternalNavigation = !navigation;
  const internalNavigation = useChartNavigation('bloodPressure');
  const nav = navigation || internalNavigation;



  // Resize observer to track container width changes
  useLayoutEffect(() => {
    const observeContainer = () => {
      if (containerRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            const { width } = entry.contentRect;
            setContainerWidth(width);
          }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
      }
    };

    const cleanup = observeContainer();
    return cleanup;
  }, []);

  const { start: weekStart, end: weekEnd } = nav.getDateRange();

  const weekData = bloodPressureData.filter(d => {
    const readingDate = new Date(d.date);
    return readingDate >= weekStart && readingDate <= weekEnd;
  });

  // Get 3-month data
  const { start: startOfThreeMonths, end: endOfThreeMonths } = nav.getThreeMonthRange();
  const threeMonthData = bloodPressureData.filter(d => {
    const readingDate = new Date(d.date);
    return readingDate >= startOfThreeMonths && readingDate <= endOfThreeMonths;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });



  const formatDateRange = (start, end) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} to ${endStr}`;
  };

  const handleBarHover = (data) => {
    setTooltipData(data);
    setTooltipPosition(data.position);
  };

  const handleBarLeave = () => {
    setTooltipData(null);
  };

  // Calculate summary statistics for physician view
  const weekSummary = useMemo(() => {
    if (!weekData.length) return null;

    const systolicReadings = weekData.filter(d => d.systolic && d.systolic > 0).map(d => d.systolic);
    const diastolicReadings = weekData.filter(d => d.diastolic && d.diastolic > 0).map(d => d.diastolic);

    const avgSystolic = systolicReadings.length > 0 ? 
      (systolicReadings.reduce((sum, val) => sum + val, 0) / systolicReadings.length).toFixed(0) : 0;
    const avgDiastolic = diastolicReadings.length > 0 ? 
      (diastolicReadings.reduce((sum, val) => sum + val, 0) / diastolicReadings.length).toFixed(0) : 0;

    const maxSystolic = systolicReadings.length > 0 ? Math.max(...systolicReadings) : 0;
    const maxDiastolic = diastolicReadings.length > 0 ? Math.max(...diastolicReadings) : 0;

    const getRiskCategory = (systolic, diastolic) => {
      if (systolic >= 135 || diastolic >= 85) return 'High Risk';
      if (systolic >= 121 || diastolic >= 80) return 'Medium Risk';
      return 'Low Risk';
    };

    const avgRisk = getRiskCategory(parseFloat(avgSystolic), parseFloat(avgDiastolic));
    const daysWithReadings = new Set(weekData.map(d => d.date.toDateString())).size;

    return {
      avgSystolic,
      avgDiastolic,
      maxSystolic,
      maxDiastolic,
      avgRisk,
      daysWithReadings,
      totalReadings: weekData.length
    };
  }, [weekData]);

  // Calculate 3-month summary statistics for physician view
  const threeMonthSummary = useMemo(() => {
    if (!threeMonthData.length) return null;

    const systolicReadings = threeMonthData.filter(d => d.systolic && d.systolic > 0).map(d => d.systolic);
    const diastolicReadings = threeMonthData.filter(d => d.diastolic && d.diastolic > 0).map(d => d.diastolic);

    const avgSystolic = systolicReadings.length > 0 ? 
      (systolicReadings.reduce((sum, val) => sum + val, 0) / systolicReadings.length).toFixed(0) : 0;
    const avgDiastolic = diastolicReadings.length > 0 ? 
      (diastolicReadings.reduce((sum, val) => sum + val, 0) / diastolicReadings.length).toFixed(0) : 0;

    const maxSystolic = systolicReadings.length > 0 ? Math.max(...systolicReadings) : 0;
    const maxDiastolic = diastolicReadings.length > 0 ? Math.max(...diastolicReadings) : 0;

    const getRiskCategory = (systolic, diastolic) => {
      if (systolic >= 135 || diastolic >= 85) return 'High Risk';
      if (systolic >= 121 || diastolic >= 80) return 'Medium Risk';
      return 'Low Risk';
    };

    const avgRisk = getRiskCategory(parseFloat(avgSystolic), parseFloat(avgDiastolic));
    const daysWithReadings = new Set(threeMonthData.map(d => d.date.toDateString())).size;

    return {
      avgSystolic,
      avgDiastolic,
      maxSystolic,
      maxDiastolic,
      avgRisk,
      daysWithReadings,
      totalReadings: threeMonthData.length
    };
  }, [threeMonthData]);

  return (
    <>
      <div className={`bp-chart-container ${isExpanded ? 'expanded' : ''}`} ref={containerRef}>
        <h3 className="bp-main-title">Blood Pressure</h3>
        <h4 className="chart-subtitle">{nav.getCurrentMonthYear()}</h4>
        
        <div className="bp-charts-wrapper">
          <Chart 
            type="systolic" 
            weekData={weekData} 
            isExpanded={isExpanded} 
            weekDays={weekDays} 
            containerWidth={containerWidth}
            onBarHover={handleBarHover}
            onBarLeave={handleBarLeave}
          />
          <Chart 
            type="diastolic" 
            weekData={weekData} 
            isExpanded={isExpanded} 
            weekDays={weekDays} 
            containerWidth={containerWidth}
            onBarHover={handleBarHover}
            onBarLeave={handleBarLeave}
          />
        </div>
        
        <Legend title="Blood Pressure Category:" items={bloodPressureLegendItems} />
        
        {/* Show InfoBox for patient view, summary for physician view */}
        {viewMode === 'physician' && weekSummary ? (
          <div className="summary-container">
            <div className="chart-summary">
              <h4>Week Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Average BP:</span>
                  <span className="stat-value">
                    {weekSummary.avgSystolic}/{weekSummary.avgDiastolic} mmHg
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Peak BP:</span>
                  <span className="stat-value">
                    {weekSummary.maxSystolic}/{weekSummary.maxDiastolic} mmHg
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Reading Days:</span>
                  <span className="stat-value">
                    {weekSummary.daysWithReadings}/7 days
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Readings:</span>
                  <span className="stat-value">
                    {weekSummary.totalReadings}
                  </span>
                </div>
              </div>
            </div>
            
            {threeMonthSummary && (
              <div className="chart-summary">
                <h4>3-Month Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Average BP:</span>
                    <span className="stat-value">
                      {threeMonthSummary.avgSystolic}/{threeMonthSummary.avgDiastolic} mmHg
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Peak BP:</span>
                    <span className="stat-value">
                      {threeMonthSummary.maxSystolic}/{threeMonthSummary.maxDiastolic} mmHg
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Readings:</span>
                    <span className="stat-value">
                      {threeMonthSummary.totalReadings}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <InfoBox 
            title="Blood Pressure Information" 
            content="Blood pressure readings help monitor cardiovascular health. Systolic pressure (top number) measures pressure when the heart beats, while diastolic pressure (bottom number) measures pressure when the heart rests between beats."
          />
        )}
      </div>
      
      {/* Custom Tooltip */}
      <Tooltip
        isVisible={!!tooltipData}
        content={tooltipData && (
          <div>
            <div className="tooltip-title">{tooltipData.type} Blood Pressure</div>
            <div className="tooltip-value">{tooltipData.value} {tooltipData.unit}</div>
            <div className="tooltip-time">{tooltipData.time}</div>
            <div className="tooltip-date">{tooltipData.date}</div>
          </div>
        )}
        position={tooltipPosition}
      />
    </>
  );
};

export default BloodPressureChart;
