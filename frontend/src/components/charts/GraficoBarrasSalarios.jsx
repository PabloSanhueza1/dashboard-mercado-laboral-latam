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
      <div className="flex justify-center items-center h-96">
        <div className="text-lg">Cargando datos de salarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-center mb-6">
        Salario Mínimo vs Ingreso Promedio 2025
      </h3>
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
  );
};

export default GraficoBarrasSalarios;
