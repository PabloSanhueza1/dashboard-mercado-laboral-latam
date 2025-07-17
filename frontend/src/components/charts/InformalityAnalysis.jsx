import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ComposedChart, Area, AreaChart
} from 'recharts';
import { HiOutlineInformationCircle } from 'react-icons/hi';

const InformalityAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [viewType, setViewType] = useState('comparison'); // comparison, trends, scatter

  // Datos de informalidad por sexo (basados en el CSV)
  const informalityData = [
    // Argentina
    { country: 'Argentina', year: '2024', sex: 'Total', rate: 51.576 },
    { country: 'Argentina', year: '2024', sex: 'Male', rate: 51.29 },
    { country: 'Argentina', year: '2024', sex: 'Female', rate: 51.933 },
    { country: 'Argentina', year: '2023', sex: 'Total', rate: 50.445 },
    { country: 'Argentina', year: '2023', sex: 'Male', rate: 50.789 },
    { country: 'Argentina', year: '2023', sex: 'Female', rate: 50.011 },
    
    // Brasil
    { country: 'Brasil', year: '2024', sex: 'Total', rate: 36.504 },
    { country: 'Brasil', year: '2024', sex: 'Male', rate: 37.952 },
    { country: 'Brasil', year: '2024', sex: 'Female', rate: 34.586 },
    { country: 'Brasil', year: '2023', sex: 'Total', rate: 37.035 },
    { country: 'Brasil', year: '2023', sex: 'Male', rate: 38.483 },
    { country: 'Brasil', year: '2023', sex: 'Female', rate: 35.111 },
    
    // Chile
    { country: 'Chile', year: '2024', sex: 'Total', rate: 27.458 },
    { country: 'Chile', year: '2024', sex: 'Male', rate: 26.086 },
    { country: 'Chile', year: '2024', sex: 'Female', rate: 29.281 },
    { country: 'Chile', year: '2023', sex: 'Total', rate: 27.355 },
    { country: 'Chile', year: '2023', sex: 'Male', rate: 26.207 },
    { country: 'Chile', year: '2023', sex: 'Female', rate: 28.878 },
    
    // Colombia
    { country: 'Colombia', year: '2024', sex: 'Total', rate: 56.143 },
    { country: 'Colombia', year: '2024', sex: 'Male', rate: 57.905 },
    { country: 'Colombia', year: '2024', sex: 'Female', rate: 53.654 },
    { country: 'Colombia', year: '2023', sex: 'Total', rate: 56.506 },
    { country: 'Colombia', year: '2023', sex: 'Male', rate: 58.54 },
    { country: 'Colombia', year: '2023', sex: 'Female', rate: 53.626 },
    
    // Ecuador
    { country: 'Ecuador', year: '2024', sex: 'Total', rate: 68.643 },
    { country: 'Ecuador', year: '2024', sex: 'Male', rate: 67.079 },
    { country: 'Ecuador', year: '2024', sex: 'Female', rate: 70.877 },
    { country: 'Ecuador', year: '2023', sex: 'Total', rate: 68.153 },
    { country: 'Ecuador', year: '2023', sex: 'Male', rate: 66.459 },
    { country: 'Ecuador', year: '2023', sex: 'Female', rate: 70.42 },
    
    // Perú
    { country: 'Perú', year: '2024', sex: 'Total', rate: 72.066 },
    { country: 'Perú', year: '2024', sex: 'Male', rate: 70.236 },
    { country: 'Perú', year: '2024', sex: 'Female', rate: 74.314 },
    { country: 'Perú', year: '2023', sex: 'Total', rate: 77.344 },
    { country: 'Perú', year: '2023', sex: 'Male', rate: 75.824 },
    { country: 'Perú', year: '2023', sex: 'Female', rate: 79.2 },
  ];

  // Datos de salarios estimados (simulados para demostración)
  const salaryData = [
    { country: 'Argentina', avgSalary: 2400, informalityRate: 51.576 },
    { country: 'Brasil', avgSalary: 2200, informalityRate: 36.504 },
    { country: 'Chile', avgSalary: 2900, informalityRate: 27.458 },
    { country: 'Colombia', avgSalary: 2100, informalityRate: 56.143 },
    { country: 'Ecuador', avgSalary: 1800, informalityRate: 68.643 },
    { country: 'Perú', avgSalary: 1900, informalityRate: 72.066 },
  ];

  // Procesar datos para gráficos
  const processedData = useMemo(() => {
    const yearData = informalityData.filter(d => d.year === selectedYear);
    const grouped = {};
    
    yearData.forEach(item => {
      if (!grouped[item.country]) {
        grouped[item.country] = { country: item.country };
      }
      grouped[item.country][item.sex] = item.rate;
    });
    
    return Object.values(grouped);
  }, [selectedYear]);

  // Datos para comparación de brechas de género
  const genderGapData = useMemo(() => {
    return processedData.map(item => ({
      country: item.country,
      Male: item.Male || 0,
      Female: item.Female || 0,
      gap: (item.Female || 0) - (item.Male || 0)
    }));
  }, [processedData]);

  // Datos para tendencias temporales
  const trendsData = useMemo(() => {
    const countries = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Perú'];
    const years = ['2023', '2024'];
    
    return years.map(year => {
      const result = { year };
      countries.forEach(country => {
        const totalRate = informalityData.find(d => 
          d.country === country && d.year === year && d.sex === 'Total'
        );
        if (totalRate) {
          result[country] = totalRate.rate;
        }
      });
      return result;
    });
  }, []);

  const InfoCard = ({ title, value, description, color = "blue" }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <HiOutlineInformationCircle className={`w-6 h-6 text-${color}-500`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header y controles */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Análisis de Informalidad Laboral por Sexo
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vista</label>
            <select 
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="comparison">Comparación por Sexo</option>
              <option value="trends">Tendencias</option>
              <option value="scatter">Informalidad vs Salarios</option>
            </select>
          </div>
        </div>

        {/* Explicación de los datos */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Interpretación de los Datos:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>obs_value:</strong> Tasa de empleo informal como porcentaje (%)</li>
            <li><strong>sex.label:</strong> Total (general), Male (hombres), Female (mujeres)</li>
            <li><strong>time:</strong> Año de los datos (2004-2024)</li>
            <li><strong>Informalidad:</strong> Empleos sin protección social, contratos formales o regulación laboral</li>
          </ul>
        </div>
      </div>

      {/* Métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard 
          title="País con Mayor Informalidad" 
          value="Perú" 
          description="72.1% en 2024"
          color="red"
        />
        <InfoCard 
          title="País con Menor Informalidad" 
          value="Chile" 
          description="27.5% en 2024"
          color="green"
        />
        <InfoCard 
          title="Mayor Brecha de Género" 
          value="Perú" 
          description="4.1% más en mujeres"
          color="orange"
        />
        <InfoCard 
          title="Promedio Regional" 
          value="52.1%" 
          description="Sudamérica 2024"
          color="blue"
        />
      </div>

      {/* Gráficos principales */}
      {viewType === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparación por sexo */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informalidad por Sexo ({selectedYear})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value?.toFixed(1)}%`, 'Tasa de Informalidad']} />
                <Legend />
                <Bar dataKey="Male" fill="#3B82F6" name="Hombres" />
                <Bar dataKey="Female" fill="#EF4444" name="Mujeres" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Brecha de género */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Brecha de Género en Informalidad
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderGapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value?.toFixed(1)}%`, 'Diferencia']} />
                <Bar 
                  dataKey="gap" 
                  fill="#F59E0B" 
                  name="Diferencia (F-M)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewType === 'trends' && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencias de Informalidad por País
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Argentina" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="Brasil" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="Chile" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="Colombia" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Ecuador" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="Perú" stroke="#6B7280" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewType === 'scatter' && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Relación: Informalidad vs Salarios Promedio
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="informalityRate" 
                name="Tasa de Informalidad"
                unit="%" 
              />
              <YAxis 
                dataKey="avgSalary" 
                name="Salario Promedio"
                unit="$" 
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'avgSalary' ? `$${value}` : `${value}%`,
                  name === 'avgSalary' ? 'Salario Promedio' : 'Tasa de Informalidad'
                ]}
                labelFormatter={(label) => `País: ${salaryData[label]?.country || 'N/A'}`}
              />
              <Scatter 
                dataKey="avgSalary" 
                fill="#3B82F6" 
                name="Países"
              />
            </ScatterChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Análisis:</h4>
            <p className="text-sm text-gray-600">
              Se observa una correlación negativa: países con mayor informalidad tienden a tener salarios promedio más bajos.
              Chile tiene la menor informalidad (27.5%) y salarios más altos, mientras que Perú tiene la mayor informalidad (72.1%) con salarios más bajos.
            </p>
          </div>
        </div>
      )}

      {/* Tabla de datos detallados */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Datos Detallados - Informalidad por Sexo ({selectedYear})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hombres (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mujeres (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brecha (F-M)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.Male?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.Female?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.Total?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (row.Female - row.Male) > 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(row.Female - row.Male)?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InformalityAnalysis;
