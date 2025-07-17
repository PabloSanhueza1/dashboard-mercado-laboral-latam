import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoBarrasSalarios = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/dataset/datos_sudamerica_2025.csv');
        const csvText = await response.text();
        
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(header => header.replace(/"/g, ''));
        
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(value => value.replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          
          return {
            pais: row.Pais,
            salarioMinimo: parseFloat(row.Salario_Minimo_Mensual_USD_2025) || 0,
            ingresoPromedio: parseFloat(row.Ingreso_Promedio_Mensual_Estimado_USD_2025) || 0
          };
        }).filter(item => item.pais && item.salarioMinimo > 0 && item.ingresoPromedio > 0);

        setData(parsedData);
        setLoading(false);
      } catch (err) {
        setError('Error cargando datos de salarios');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px'
        }}>
          <p><strong>{label}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value} USD
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de salarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-700">Error al cargar los datos de salarios</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Header del gráfico */}
      <div className="chart-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Salario mínimo vs Ingreso promedio 2025
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comparación de salarios mínimos e ingresos promedio en Sudamérica
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor del gráfico */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="pais" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              label={{ value: 'USD ($)', angle: -90, position: 'insideLeft' }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="salarioMinimo" 
              fill="#3B82F6" 
              name="Salario Mínimo"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="ingresoPromedio" 
              fill="#10B981" 
              name="Ingreso Promedio"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default GraficoBarrasSalarios;
