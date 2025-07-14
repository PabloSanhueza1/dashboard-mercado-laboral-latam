import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const FinalPieChart = ({ chartData, selectedCountries, datasets, activeDataset }) => {
  if (selectedCountries.length === 0 || chartData.length === 0) return null;

  const pieData = chartData[chartData.length - 1] ? 
    selectedCountries.map((country, index) => ({
      name: country,
      value: chartData[chartData.length - 1][country] || 0,
      fill: COLORS[index % COLORS.length]
    })).filter(item => item.value > 0) : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Distribución de {datasets[activeDataset].title} (Año más Reciente)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {selectedCountries.map((country, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(2)}${datasets[activeDataset].unit}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinalPieChart;
