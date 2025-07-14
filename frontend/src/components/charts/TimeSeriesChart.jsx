import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HiOutlineMap } from 'react-icons/hi';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const TimeSeriesChart = ({ chartData, selectedCountries, datasets, activeDataset }) => {
  if (selectedCountries.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <HiOutlineMap size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Selecciona al menos un país para visualizar los datos.</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" padding={{ left: 30, right: 30 }} />
        <YAxis 
          domain={['auto', 'auto']} 
          label={{ 
            value: `${datasets[activeDataset].title} (${datasets[activeDataset].unit})`, 
            angle: -90, 
            position: 'insideLeft' 
          }} 
        />
        <Tooltip
          formatter={(value) => `${parseFloat(value).toFixed(2)}${datasets[activeDataset].unit}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(5px)',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}
        />
        <Legend />
        {selectedCountries.map((country, index) => (
          <Line
            key={country}
            type="monotone"
            dataKey={country}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimeSeriesChart;
