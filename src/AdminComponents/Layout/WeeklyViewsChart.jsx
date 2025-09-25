// src/AdminComponents/Layout/WeeklyViewsChart.jsx

import React from 'react';

const getNiceUpperBound = (maxValue) => {
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

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num;
};

const generateSmoothPath = (data, getX, getY) => {
  if (data.length < 2) return '';
  let path = `M ${getX(0)},${getY(data[0].views)}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x = getX(i);
    const y = getY(data[i].views);
    const nextX = getX(i + 1);
    const nextY = getY(data[i + 1].views);
    const controlX1 = x + (nextX - x) / 2;
    const controlX2 = nextX - (nextX - x) / 2;
    path += ` C ${controlX1},${y} ${controlX2},${nextY} ${nextX},${nextY}`;
  }
  return path;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const WeeklyViewsChart = ({ data = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-400">
        Loading chart data...
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-400">
        No data available for the selected period.
      </div>
    );
  }

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const maxViews = Math.max(...data.map((d) => d.views), 0);
  const niceMaxViews = getNiceUpperBound(maxViews);
  const minViews = 0;
  const viewRange = niceMaxViews - minViews;

  const getX = (index) =>
    ((width - paddingX * 2) / (data.length > 1 ? data.length - 1 : 1)) * index + paddingX;

  const getY = (views) =>
    height -
    paddingY -
    ((height - paddingY * 2) * (views - minViews)) / (viewRange || 1);

  const pathData = generateSmoothPath(data, getX, getY);
  const areaPathData = `${pathData} L ${getX(data.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(
    (multiple) => minViews + viewRange * multiple
  );

  return (
    <div className="h-64 w-full">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#81E6D9" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#81E6D9" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <g className="text-xs text-slate-600 dark:text-slate-400">
          {yAxisLabels.map((labelValue) => (
            <g key={labelValue}>
              <line
                x1={paddingX}
                y1={getY(labelValue)}
                x2={width - paddingX}
                y2={getY(labelValue)}
                className="text-slate-200 dark:text-slate-800"
                stroke="currentColor"
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
        
        <path d={areaPathData} fill="url(#chartGradient)" />
        <path
          d={pathData}
          fill="none"
          className="text-teal-400"
          stroke="currentColor"
          strokeWidth="2"
        />
        <g className="text-white" fill="currentColor">
          {data.map((point, index) => (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(point.views)}
              r="4"
              className="fill-slate-800"
              stroke="currentColor"
              strokeWidth="2"
            />
          ))}
        </g>
        
        <g className="text-xs text-slate-600 dark:text-slate-400" textAnchor="middle">
          {data.map((point, index) => (
            <text
              key={index}
              x={getX(index)}
              y={height - 5}
              fill="currentColor"
            >
              {formatDate(point.date)}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default WeeklyViewsChart;