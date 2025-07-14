import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const DistributionCharts = ({ chartData, selectedCountries, datasets, activeDataset }) => {
  if (selectedCountries.length === 0 || chartData.length === 0) return null;

  const averageData = selectedCountries.map(country => {
    const countryData = chartData.filter(d => d[country] !== undefined);
    const avg = countryData.length > 0 
      ? countryData.reduce((sum, d) => sum + (d[country] || 0), 0) / countryData.length 
      : 0;
    return { country, average: avg };
  });

  const pieData = chartData[chartData.length - 1] ? 
    selectedCountries.map((country, index) => ({
      name: country,
      value: chartData[chartData.length - 1][country] || 0,
      fill: COLORS[index % COLORS.length]
    })).filter(item => item.value > 0) : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        📈 Distribución por Períodos - {datasets[activeDataset].title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por país */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Por País (Promedio del Período)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={averageData}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="country" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)}${datasets[activeDataset].unit}`} />
              <Bar dataKey="average" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {selectedCountries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico circular del último año */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Distribución (Último Año)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
      </div>
    </div>
  );
};

export default DistributionCharts;
