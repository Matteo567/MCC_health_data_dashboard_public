import React from 'react';

//Shared Y-Axis component to eliminate duplicate YAxis implementations across chart components
 
const SharedYAxis = ({ 
  config, 
  type = 'single', 
  title = '', 
  unit = '',
  className = 'y-axis'
}) => {
  const chartHeight = config.height - config.padding.top - config.padding.bottom;
  const chartWidth = config.width - config.padding.left - config.padding.right;

  // Handle different Y-Axis configurations
  const getYAxisLabels = () => {
    if (type === 'bloodPressure') {
      return {
        systolic: config.yAxisLabels.systolic,
        diastolic: config.yAxisLabels.diastolic
      };
    }
    return { single: config.yAxisLabels };
  };

  const getYAxisRange = () => {
    if (type === 'bloodPressure') {
      return config.yAxisRange;
    }
    return { single: config.yAxisRange };
  };

  const yAxisLabels = getYAxisLabels();
  const yAxisRange = getYAxisRange();

  const renderYAxisLabels = (labels, range, offset = 0) => {
    return labels.map(label => {
      const y = config.height - config.padding.bottom - ((label - offset) / range) * chartHeight;
      return (
        <g key={label} className="y-axis-grid-group">
          <line 
            className="chart-grid-line-horizontal" 
            x1={config.padding.left} 
            y1={y} 
            x2={config.width - config.padding.right} 
            y2={y} 
          />
          <text 
            x={config.padding.left - 10} 
            y={y + 3} 
            fontSize={config.fontSize.yAxis} 
            textAnchor="end" 
            fill="var(--chart-color-neutral)"
          >
            {label}
          </text>
        </g>
      );
    });
  };

  return (
    <g className={className}>
      {/* Y-Axis title */}
      {title && (
        <text
          className="y-axis-title"
          x={config.padding.left / 3}
          y={config.padding.top + chartHeight / 2}
          fontSize={config.fontSize.yAxisTitle}
          textAnchor="middle"
          fill="var(--chart-color-neutral)"
          transform={`rotate(-90, ${config.padding.left / 3}, ${config.padding.top + chartHeight / 2})`}
        >
          {title} {unit && `(${unit})`}
        </text>
      )}

      {/* Render Y-axis labels based on type */}
      {type === 'bloodPressure' ? (
        <>
          {renderYAxisLabels(yAxisLabels.systolic, yAxisRange.systolic, config.yAxisOffset?.systolic)}
          {renderYAxisLabels(yAxisLabels.diastolic, yAxisRange.diastolic, config.yAxisOffset?.diastolic)}
        </>
      ) : (
        renderYAxisLabels(yAxisLabels.single, yAxisRange.single)
      )}
    </g>
  );
};

export default SharedYAxis;
