import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const MultiDimensionalRadarChart = ({ radarData }) => {
  if (radarData.length === 0) return null;

  const chartData = radarData[0] ? Object.keys(radarData[0]).filter(k => k !== 'country').map(key => ({
    indicator: key,
    ...radarData.reduce((acc, country, idx) => ({
      ...acc,
      [country.country]: country[key] || 0
    }), {})
  })) : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        🎯 Análisis Multidimensional (Primeros 3 Países)
      </h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>Comparación de todos los indicadores. Salarios escalados ÷100</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="indicator" />
          <PolarRadiusAxis />
          {radarData.map((country, index) => (
            <Radar
              key={country.country}
              name={country.country}
              dataKey={country.country}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiDimensionalRadarChart;
