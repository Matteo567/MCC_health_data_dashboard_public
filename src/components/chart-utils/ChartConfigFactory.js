/*
 Factory for creating chart configurations
 Eliminates duplicate getChartConfig functions across chart components
 Now provides universal dimensions for consistent aspect ratios
 */
export const createChartConfig = (type, isExpanded, containerWidth = 400) => {
  const baseConfig = {
    expanded: isExpanded,
    containerWidth
  };

  // Universal dimensions for consistent aspect ratios
  const universalConfig = {
    // Dashboard view dimensions
    dashboard: {
      width: 450,
      height: 350,
      padding: { top: 60, right: 40, bottom: 80, left: 60 },
      dayWidth: 50,
      fontSize: {
        yAxis: 14,
        yAxisTitle: 16,
        timeLabel: 12,
        dayLabel: 12,
        dateLabel: 12,
      },
      barWidth: 8,
    },
    // Expanded view dimensions
    expanded: {
      width: 700,
      height: 550,
      padding: { top: 80, right: 60, bottom: 100, left: 80 },
      dayWidth: 80,
      fontSize: {
        yAxis: 16,
        yAxisTitle: 18,
        timeLabel: 14,
        dayLabel: 14,
        dateLabel: 14,
      },
      barWidth: 12,
    }
  };

  const config = isExpanded ? universalConfig.expanded : universalConfig.dashboard;

  switch (type) {
    case 'glucose':
      return {
        ...config,
        yAxisLabels: [0, 4, 8, 12],
        yAxisRange: 12,
      };

    case 'bloodPressure':
      return {
        ...config,
        yAxisRange: { systolic: 200, diastolic: 120 },
        yAxisOffset: { systolic: 0, diastolic: 0 },
        yAxisLabels: {
          systolic: isExpanded ? [0, 40, 80, 120, 160, 200] : [0, 100, 200],
          diastolic: isExpanded ? [0, 20, 40, 60, 80, 100, 120] : [0, 60, 120],
        },
        dayPadding: isExpanded ? 10 : 6,
      };

    case 'exercise':
      return {
        ...config,
        fontSize: {
          ...config.fontSize,
          emoji: isExpanded ? 12 : 10,
        },
      };

    case 'mealContents':
      // Special handling for meal contents due to complex SVG structure
      const mealMaxWidth = Math.min(containerWidth - 40, isExpanded ? 800 : 600);
      const mealAvailableWidth = mealMaxWidth - 180;
      
      let mealDayWidth, mealTotalWidth, mealPadding;
      
      if (mealAvailableWidth < 500) {
        const adjustedPadding = Math.max(140, mealAvailableWidth * 0.25);
        const adjustedAvailableWidth = mealAvailableWidth - (180 - adjustedPadding);
        mealDayWidth = Math.max(60, adjustedAvailableWidth / 7);
        mealTotalWidth = adjustedPadding + (mealDayWidth * 7);
        mealPadding = { top: 50, right: 30, bottom: 100, left: adjustedPadding };
      } else {
        mealDayWidth = Math.max(70, Math.min(100, mealAvailableWidth / 7));
        mealTotalWidth = 180 + (mealDayWidth * 7);
        mealPadding = { top: 50, right: 40, bottom: 100, left: 140 };
      }
      
      const mealHeight = isExpanded ? 90 : 70;
      const totalMealHeight = 4 * mealHeight;
      const totalPadding = mealPadding.top + mealPadding.bottom;
      const mealMaxHeight = totalMealHeight + totalPadding;
      
      return {
        width: mealTotalWidth,
        height: mealMaxHeight,
        padding: mealPadding,
        dayWidth: mealDayWidth,
        mealHeight: mealHeight,
        fontSize: {
          dayLabel: isExpanded ? 12 : 10,
          dateLabel: isExpanded ? 10 : 8,
          mealLabel: isExpanded ? 10 : 8,
          timeLabel: isExpanded ? 8 : 6,
        },
      };

    case 'pain':
      // Special handling for pain visualization due to multiple containers
      return {
        ...config,
        // Pain charts may need additional space for body mapping
        height: isExpanded ? 600 : 450,
      };

    case 'sleep':
      return {
        ...config,
        yAxisLabels: [0, 2, 4, 6, 8, 10, 12],
        yAxisRange: 12,
      };

    case 'mood':
      return {
        ...config,
        yAxisLabels: [0, 25, 50, 75, 100],
        yAxisRange: 100,
      };

    default:
      return {
        ...config,
        yAxisLabels: [0, 25, 50, 75, 100],
        yAxisRange: 100,
      };
  }
};
