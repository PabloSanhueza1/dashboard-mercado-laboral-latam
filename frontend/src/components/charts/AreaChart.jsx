import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const TrendAreaChart = ({ chartData, selectedCountries, datasets, activeDataset }) => {
  if (selectedCountries.length === 0 || chartData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        📈 Análisis de Tendencias - {datasets[activeDataset].title}
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis 
            label={{ 
              value: `${datasets[activeDataset].title} (${datasets[activeDataset].unit})`, 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip
            formatter={(value) => `${parseFloat(value).toFixed(2)}${datasets[activeDataset].unit}`}
          />
          <Legend />
          {selectedCountries.map((country, index) => (
            <Area
              key={country}
              type="monotone"
              dataKey={country}
              stackId="1"
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendAreaChart;
