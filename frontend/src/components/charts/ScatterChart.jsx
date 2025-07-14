import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const CorrelationScatterChart = ({ scatterData, selectedSex, selectedAgeGroup }) => {
  if (scatterData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        🔍 Análisis de Correlación: Empleo vs Desempleo
      </h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>Cada punto representa un país. Filtros aplicados: {selectedSex}, {selectedAgeGroup}</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="employment" 
            name="Empleo" 
            unit="%" 
            label={{ value: 'Tasa de Empleo (%)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="unemployment" 
            name="Desempleo" 
            unit="%" 
            label={{ value: 'Tasa de Desempleo (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => [`${value.toFixed(2)}%`, name === 'employment' ? 'Empleo' : 'Desempleo']}
            labelFormatter={(label, payload) => payload[0]?.payload?.country || ''}
          />
          <Scatter name="Países" dataKey="unemployment" fill="#8884d8">
            {scatterData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationScatterChart;
