// src/AdminComponents/Layout/WeeklyViewsChart.jsx

// ! React
import React, { useState } from 'react';

// ========================================================================== //
// ! SECTION 1: HELPER FUNCTIONS
// ========================================================================== //

/**
 * ? getNiceUpperBound
 * Calculates a "nice" upper bound for a chart's Y-axis based on the maximum data value.
 * Aims for aesthetically pleasing round numbers (e.g., 10, 15, 20, 30, 50, 75, 100).
 * @param {number} maxValue - The maximum value in the dataset.
 * @returns {number} A calculated nice upper bound.
 */
const getNiceUpperBound = (maxValue) => {
  if (maxValue <= 0) return 10; // * Default if max is 0 or less
  if (maxValue <= 10) return 10;

  const exponent = Math.floor(Math.log10(maxValue));
  const powerOf10 = 10 ** exponent;
  const relativeValue = maxValue / powerOf10;

  let niceValue;
  if (relativeValue < 1.5) niceValue = 1.5;
  else if (relativeValue < 2) niceValue = 2;
  else if (relativeValue < 3) niceValue = 3;
  else if (relativeValue < 5) niceValue = 5;
  else if (relativeValue < 7.5) niceValue = 7.5;
  else niceValue = 10;

  return niceValue * powerOf10;
};

/**
 * ? formatNumber
 * Formats large numbers into compact strings (e.g., 1500 -> 1.5k, 1200000 -> 1.2M).
 * @param {number} num - The number to format.
 * @returns {string|number} The formatted number string or the original number.
 */
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num;
};

/**
 * ? generateSmoothPath
 * Creates an SVG path string for a smooth line chart using cubic Bezier curves.
 * @param {Array<object>} data - The chart data points.
 * @param {Function} getX - Function to calculate the X coordinate for an index.
 * @param {Function} getY - Function to calculate the Y coordinate for a value.
 * @returns {string} The SVG 'd' attribute string for the path.
 */
const generateSmoothPath = (data, getX, getY) => {
  if (data.length < 2) return ''; // * Need at least two points for a line

  let path = `M ${getX(0)},${getY(data[0].views)}`; // * Start path at the first point

  // * Loop through points to create Bezier curve segments
  for (let i = 0; i < data.length - 1; i++) {
    const x = getX(i);
    const y = getY(data[i].views);
    const nextX = getX(i + 1);
    const nextY = getY(data[i + 1].views);

    // * Calculate control points for a smooth curve
    const controlX1 = x + (nextX - x) / 2;
    const controlX2 = nextX - (nextX - x) / 2;

    // * Add cubic Bezier segment to the path string
    path += ` C ${controlX1},${y} ${controlX2},${nextY} ${nextX},${nextY}`;
  }
  return path;
};

/**
 * ? formatDate
 * Formats a date string (YYYY-MM-DD) into a short format (e.g., "23 Oct").
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (dateString) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  // * Create date object respecting UTC timezone implicit in YYYY-MM-DD
  const date = new Date(dateString + 'T00:00:00Z');
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
};

// ========================================================================== //
// ! SECTION 2: MAIN CHART COMPONENT
// ========================================================================== //

/**
 * ? WeeklyViewsChart
 * The main wrapper component. Handles loading and empty states,
 * and renders the actual SVG chart content.
 * @param {Array<object>} data - Array of data points { date: string, views: number }. Defaults to [].
 * @param {boolean} isLoading - Indicates if data is being loaded.
 */
const WeeklyViewsChart = ({ data = [], isLoading }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null); // * Tracks hovered point for tooltip

  return (
    <div className="h-80 w-full"> {/* // * Fixed height container */}
      {isLoading ? (
        // * Loading State
        <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-400">
          Loading chart data...
        </div>
      ) : !data || data.length === 0 ? (
        // * Empty State
        <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-400">
          No data available for the selected period.
        </div>
      ) : (
        // * Render Chart
        <ChartContent
          data={data}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
        />
      )}
    </div>
  );
};

// ========================================================================== //
// ! SECTION 3: SVG CHART CONTENT SUB-COMPONENT
// ========================================================================== //

/**
 * ? ChartContent
 * Renders the actual SVG chart elements (axes, lines, area, tooltips).
 * Includes logic for data sampling to limit the number of points displayed.
 * @param {Array<object>} data - The chart data points.
 * @param {number|null} hoveredIndex - The index of the currently hovered data point.
 * @param {Function} setHoveredIndex - State setter for hoveredIndex.
 */
const ChartContent = ({ data, hoveredIndex, setHoveredIndex }) => {
  // * SVG dimensions and padding
  const width = 750; // * Base width for viewBox scaling
  const height = 250; // * Base height
  const paddingX = 40; // * Left/Right padding for labels
  const paddingY = 20; // * Top/Bottom padding

  // ! Data Sampling Logic
  // * Ensures a maximum number of points (e.g., 9) are plotted for performance/readability,
  // * while guaranteeing the peak value within the original data range is always included.
  let chartPoints = data;
  const desiredPoints = 9;

  if (data.length > desiredPoints) {
    // * Step 1: Select evenly spaced points as initial candidates
    const evenlySpacedPoints = [];
    const step = (data.length - 1) / (desiredPoints - 1);
    for (let i = 0; i < desiredPoints; i++) {
      const index = Math.round(i * step);
      evenlySpacedPoints.push(data[index]);
    }

    // * Step 2: Find the point with the absolute maximum views in the *original* data
    const overallPeak = data.reduce(
      (max, current) => (current.views > max.views ? current : max),
      data[0] // * Initialize with the first point
    );

    // * Step 3: Check if the peak is already included in the candidates
    const isPeakIncluded = evenlySpacedPoints.some(
      (p) => p.date === overallPeak.date
    );

    // * Step 4: If peak is not included and has views > 0, replace the nearest candidate with it
    if (!isPeakIncluded && overallPeak.views > 0) {
      const peakIndexInData = data.findIndex(p => p.date === overallPeak.date);
      let closestPointIndexInCandidates = -1;
      let minDistance = Infinity;

      // * Find the candidate point geometrically closest (by index) to the peak
      evenlySpacedPoints.forEach((point, index) => {
        const pointIndexInData = data.findIndex(p => p.date === point.date);
        const distance = Math.abs(peakIndexInData - pointIndexInData);
        if (distance < minDistance) {
          minDistance = distance;
          closestPointIndexInCandidates = index;
        }
      });

      // * Replace the closest candidate if found
      if (closestPointIndexInCandidates !== -1) {
        evenlySpacedPoints[closestPointIndexInCandidates] = overallPeak;
      }
    }

    // * Step 5: Sort the final points by date to ensure correct line drawing order
    chartPoints = evenlySpacedPoints.sort(
      (a, b) => new Date(a.date + 'T00:00:00Z') - new Date(b.date + 'T00:00:00Z')
    );
  }
  // ! End Data Sampling Logic

  // * Calculate Y-axis range and scaling functions
  const maxViews = Math.max(...chartPoints.map((d) => d.views), 0); // * Ensure maxViews is at least 0
  const niceMaxViews = getNiceUpperBound(maxViews);
  const minViews = 0; // * Assuming views cannot be negative
  const viewRange = niceMaxViews - minViews;

  // * X coordinate calculation based on index
  const getX = (index) =>
    paddingX + ((width - paddingX * 2) / (chartPoints.length > 1 ? chartPoints.length - 1 : 1)) * index;

  // * Y coordinate calculation based on view count
  const getY = (views) =>
    height - paddingY - ((height - paddingY * 2) * Math.max(0, views - minViews)) / (viewRange || 1); // * Ensure non-negative height, handle viewRange=0

  // * Generate SVG path data
  const pathData = generateSmoothPath(chartPoints, getX, getY);
  const areaPathData = `${pathData} L ${getX(chartPoints.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`; // * Close path for area fill

  // * Generate labels for the Y-axis
  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(
    (multiple) => minViews + viewRange * multiple
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet" // * Scale SVG nicely
      onMouseLeave={() => setHoveredIndex(null)} // * Clear tooltip on mouse out
      className="text-xs" // * Base font size for labels
    >
      {/* --- Definitions (e.g., Gradients) --- */}
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
           {/* // * TODO: Use CSS variables for theme-aware colors */}
          <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.4} /> {/* // ! Example color */}
          <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} /> {/* // ! Example color */}
        </linearGradient>
      </defs>

      {/* --- Y-Axis Lines & Labels --- */}
      <g className="text-slate-500 dark:text-slate-400 cursor-default select-none">
        {yAxisLabels.map((labelValue) => (
          <g key={labelValue}>
            <line
              x1={paddingX}
              y1={getY(labelValue)}
              x2={width - paddingX}
              y2={getY(labelValue)}
              stroke="currentColor"
              className="opacity-20"
              strokeWidth="1"
            />
            <text
              x={paddingX - 8}
              y={getY(labelValue)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="currentColor"
            >
              {formatNumber(labelValue)}
            </text>
          </g>
        ))}
      </g>

      {/* --- Chart Line & Area --- */}
      <g className="text-indigo-600 dark:text-indigo-400"> {/* // ! Example color */}
        <path d={areaPathData} fill="url(#chartGradient)" />
        <path d={pathData} fill="none" stroke="currentColor" strokeWidth="2" />
      </g>

      {/* --- Data Point Circles --- */}
       {/* // * Circles are currently transparent with a stroke, consider filling them */}
      <g className="text-indigo-600 dark:text-indigo-400"> {/* // ! Example color */}
        {chartPoints.map((point, index) => (
          <circle
            key={point.date}
            cx={getX(index)}
            cy={getY(point.views)}
            r="4"
            fill="transparent" // * Could be 'currentColor' or white/dark equivalent
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </g>

      {/* --- Hover Targets --- */}
      {/* // * Invisible rectangles to trigger mouse events for tooltips */}
      <g>
        {chartPoints.map((point, index) => (
          <rect
            key={point.date + '-hover'} // * Ensure unique key
            x={getX(index) - 10} // * Wider target area
            y={0}
            width={20} // * Wider target area
            height={height - paddingY}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
          />
        ))}
      </g>

      {/* --- X-Axis Labels --- */}
      <g
        className="text-slate-500 dark:text-slate-400 cursor-default select-none"
        textAnchor="middle"
      >
        {chartPoints.map((point, index) => (
          <text
            key={point.date + '-label'} // * Ensure unique key
            x={getX(index)}
            y={height - 5} // * Position below the chart
            fill="currentColor"
          >
            {formatDate(point.date)}
          </text>
        ))}
      </g>

      {/* --- Tooltip --- */}
      {/* // * Renders only when hoveredIndex is not null */}
      {hoveredIndex !== null && chartPoints[hoveredIndex] && (() => {
          const point = chartPoints[hoveredIndex];
          const x = getX(hoveredIndex);
          const y = getY(point.views);
          const viewsText = `${point.views.toLocaleString('en-US')} views`;
          // * Estimate text width for centering the tooltip background
          const textWidth = viewsText.length * 5 + 24; // * Rough estimate

          return (
            <g
              transform={`translate(${x}, ${y - 12})`} // * Position above the point
              style={{ pointerEvents: 'none' }} // * Prevent tooltip from blocking hover
            >
              {/* Tooltip Background */}
              <rect
                x={-textWidth / 2}
                y={-14}
                width={textWidth}
                height={22}
                rx="5" // * Rounded corners
                className="fill-gray-900 dark:fill-gray-700 opacity-90"
              />
              {/* Tooltip Text */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                className="font-semibold fill-white"
              >
                {viewsText}
              </text>
            </g>
          );
        })()}
    </svg>
  );
};

export default WeeklyViewsChart;