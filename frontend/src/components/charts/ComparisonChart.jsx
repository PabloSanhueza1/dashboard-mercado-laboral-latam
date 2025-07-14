import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MultiIndicatorChart = ({ comparisonData, datasets }) => {
  if (comparisonData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Comparación de Todos los Indicadores (Datos más Recientes)
      </h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>* Salarios mostrados divididos por 100 para mejor visualización</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="country" 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'salary') return [`$${(value * 100).toFixed(0)} USD`, 'Salario Promedio'];
              return [`${value?.toFixed(1)}%`, datasets[name]?.title || name];
            }}
          />
          <Legend 
            formatter={(value) => datasets[value]?.title || value}
          />
          <Bar dataKey="employment" fill="#3B82F6" name="Tasa de Empleo" radius={[2, 2, 0, 0]} />
          <Bar dataKey="unemployment" fill="#EF4444" name="Tasa de Desempleo" radius={[2, 2, 0, 0]} />
          <Bar dataKey="informal" fill="#F59E0B" name="Empleo Informal" radius={[2, 2, 0, 0]} />
          <Bar dataKey="laborForce" fill="#10B981" name="Población Económicamente Activa" radius={[2, 2, 0, 0]} />
          <Bar dataKey="salary" fill="#8B5CF6" name="Salarios (÷100)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiIndicatorChart;
