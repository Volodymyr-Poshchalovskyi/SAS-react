import React, { useState } from 'react';

// --- Helper Functions (без змін) ---

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
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(dateString);
  return `${date.getDate()} ${months[date.getMonth()]}`;
};


// --- Component ---

const WeeklyViewsChart = ({ data = [], isLoading }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="h-80 w-full">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center text-base-content/50">
          Loading chart data...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-base-content/50">
          No data available for the selected period.
        </div>
      ) : (
        <ChartContent data={data} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} />
      )}
    </div>
  );
};

// --- SVG Chart Sub-component ---

const ChartContent = ({ data, hoveredIndex, setHoveredIndex }) => {
  const width = 750;
  const height = 250;
  const paddingX = 40;
  const paddingY = 20;

  // ✨ ФІНАЛЬНА НАДІЙНА ЛОГІКА: Семплювання з гарантованим збереженням піку
  let chartPoints = data;
  const desiredPoints = 9;

  if (data.length > desiredPoints) {
    // Крок 1: Вибираємо 9 рівномірно розташованих "кандидатів"
    const evenlySpacedPoints = [];
    const step = (data.length - 1) / (desiredPoints - 1);
    for (let i = 0; i < desiredPoints; i++) {
        const index = Math.round(i * step);
        evenlySpacedPoints.push(data[index]);
    }

    // Крок 2: Знаходимо абсолютний пік за весь період
    const overallPeak = data.reduce((max, current) => (current.views > max.views ? current : max), data[0]);

    // Крок 3: Перевіряємо, чи є пік серед кандидатів. Якщо ні - додаємо його.
    const isPeakIncluded = evenlySpacedPoints.some(p => p.date === overallPeak.date);
    
    if (!isPeakIncluded && overallPeak.views > 0) {
        // Знаходимо індекс піку в оригінальному масиві
        const peakIndexInData = data.findIndex(p => p.date === overallPeak.date);

        // Знаходимо найближчого "сусіда" серед кандидатів, щоб його замінити
        let closestPointIndex = -1;
        let minDistance = Infinity;

        evenlySpacedPoints.forEach((point, index) => {
            const pointIndexInData = data.findIndex(p => p.date === point.date);
            const distance = Math.abs(peakIndexInData - pointIndexInData);
            if (distance < minDistance) {
                minDistance = distance;
                closestPointIndex = index;
            }
        });
        
        // Замінюємо найближчого сусіда на наш пік
        if (closestPointIndex !== -1) {
             evenlySpacedPoints[closestPointIndex] = overallPeak;
        }
    }
    
    // Сортуємо фінальний масив за датою, щоб лінія графіка була коректною
    chartPoints = evenlySpacedPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  const maxViews = Math.max(...chartPoints.map((d) => d.views), 0);
  const niceMaxViews = getNiceUpperBound(maxViews);
  const minViews = 0;
  const viewRange = niceMaxViews - minViews;

  const getX = (index) =>
    ((width - paddingX * 2) / (chartPoints.length > 1 ? chartPoints.length - 1 : 1)) * index + paddingX;

  const getY = (views) =>
    height -
    paddingY -
    ((height - paddingY * 2) * (views - minViews)) / (viewRange || 1);

  const pathData = generateSmoothPath(chartPoints, getX, getY);
  const areaPathData = `${pathData} L ${getX(chartPoints.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1].map(
    (multiple) => minViews + viewRange * multiple
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => setHoveredIndex(null)}
      className="text-xs"
    >
        {/* ... решта SVG-коду без змін (defs, осі, тултіпи і т.д.) ... */}
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity={0.4} />
          <stop offset="100%" stopColor="hsl(var(--p))" stopOpacity={0} />
        </linearGradient>
      </defs>

      <g className="text-base-content/60 cursor-default select-none">
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
            <text x={paddingX - 8} y={getY(labelValue)} textAnchor="end" dominantBaseline="middle" fill="currentColor">
              {formatNumber(labelValue)}
            </text>
          </g>
        ))}
      </g>

      <g className="text-primary">
        <path d={areaPathData} fill="url(#chartGradient)" />
        <path d={pathData} fill="none" stroke="currentColor" strokeWidth="2" />
      </g>

      <g className="text-primary">
        {chartPoints.map((point, index) => (
            <circle
              key={point.date} // Використовуємо дату як унікальний ключ
              cx={getX(index)}
              cy={getY(point.views)}
              r="4"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
            />
        ))}
      </g>
      
      <g>
        {chartPoints.map((point, index) => (
          <rect
            key={point.date}
            x={getX(index) - 10}
            y={0}
            width={20}
            height={height - paddingY}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(index)}
          />
        ))}
      </g>

      <g className="text-base-content/60 cursor-default select-none" textAnchor="middle">
        {chartPoints.map((point, index) => (
            <text key={point.date} x={getX(index)} y={height - 5} fill="currentColor">
              {formatDate(point.date)}
            </text>
        ))}
      </g>

      {hoveredIndex !== null && chartPoints[hoveredIndex] && (() => {
        const point = chartPoints[hoveredIndex];
        const x = getX(hoveredIndex);
        const y = getY(point.views);
        const viewsText = `${point.views.toLocaleString('en-US')} views`;
        const textWidth = viewsText.length * 5 + 24;

        return (
          <g transform={`translate(${x}, ${y - 12})`} style={{ pointerEvents: 'none' }}>
            <rect
              x={-textWidth / 2}
              y={-14}
              width={textWidth}
              height={22}
              rx="5"
              className="fill-gray-900 dark:fill-gray-800" 
            />
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