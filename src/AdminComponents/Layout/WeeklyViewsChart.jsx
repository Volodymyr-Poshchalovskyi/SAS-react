// src/AdminComponents/Layout/WeeklyViewsChart.jsx

import React from 'react';

const generateSmoothPath = (data, getX, getY) => {
  if (data.length === 0) return '';
  if (data.length === 1)
    return `M ${getX(0)},${getY(data[0].views)} L ${getX(0)},${getY(data[0].views)}`;

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

const WeeklyViewsChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  const width = 500;
  const height = 200;
  const paddingX = 30;
  const paddingY = 20;

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const minViews = Math.min(...data.map((d) => d.views), 0);
  const viewRange = maxViews - minViews;

  const getX = (index) =>
    ((width - paddingX * 2) / (data.length - 1)) * index + paddingX;

  const getY = (views) =>
    height -
    paddingY -
    ((height - paddingY * 2) * (views - minViews)) / (viewRange || 1);

  const pathData = generateSmoothPath(data, getX, getY);

  const areaPathData = `${pathData} L ${getX(data.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

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
        <g className="text-slate-700">
          {[0, 0.25, 0.5, 0.75, 1].map((multiple) => (
            <line
              key={multiple}
              x1={paddingX}
              y1={getY(minViews + viewRange * multiple)}
              x2={width - paddingX}
              y2={getY(minViews + viewRange * multiple)}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2,5"
            />
          ))}
        </g>
        <path d={areaPathData} fill="url(#chartGradient)" />
        <path
          d={pathData}
          fill="none"
          className="text-teal-400"
          stroke="currentColor"
          strokeWidth="2"
        />{' '}
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
        <g className="text-xs text-slate-400" textAnchor="middle">
          {data.map((point, index) => (
            <text
              key={index}
              x={getX(index)}
              y={height - 5}
              fill="currentColor"
            >
              {point.day}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default WeeklyViewsChart;
