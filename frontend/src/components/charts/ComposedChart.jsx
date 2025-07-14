import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const CombinedAnalysisChart = ({ chartData, selectedCountries, datasets, activeDataset }) => {
  if (selectedCountries.length === 0 || chartData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        📊 Análisis Combinado - {datasets[activeDataset].title}
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis 
            label={{ 
              value: `${datasets[activeDataset].title} (${datasets[activeDataset].unit})`, 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}${datasets[activeDataset].unit}`} />
          <Legend />
          {selectedCountries.slice(0, 2).map((country, index) => (
            <Line
              key={`line-${country}`}
              type="monotone"
              dataKey={country}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
            />
          ))}
          {selectedCountries.slice(2, 4).map((country, index) => (
            <Bar
              key={`bar-${country}`}
              dataKey={country}
              fill={COLORS[(index + 2) % COLORS.length]}
              fillOpacity={0.7}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedAnalysisChart;
