import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Papa from 'papaparse';
import { 
  HiOutlineFilter, HiOutlineMap, HiOutlineXCircle, HiOutlineCheckCircle, 
  HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineGlobe, HiOutlineCurrencyDollar,
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar
} from 'react-icons/hi';

// Paleta de colores para las líneas del gráfico
const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const Dashboard = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['Chile', 'Argentina', 'Brazil']); // Países iniciales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar y procesar los datos del CSV al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- LÍNEA CORREGIDA ---
        const response = await fetch('/dataset/Encuesta de Fuerza de Trabajo.csv');
        if (!response.ok) {
          throw new Error('No se pudo encontrar el archivo CSV en /public/dataset/Encuesta de Fuerza de Trabajo.csv');
        }
        const csvText = await response.text();          Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            console.log('Total rows in CSV:', result.data.length);
            
            const countrySet = new Set();
            const southAmericaList = [ // Lista para asegurar que solo procesamos países de la región
              'Argentina', 'Bolivia (Plurinational State of)', 'Brazil', 'Chile', 'Colombia',
              'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname',
              'Uruguay', 'Venezuela (Bolivarian Republic of)'
            ];

            const processedData = result.data
              .map(row => ({
                country: row['ref_area.label'],
                year: parseInt(row.time, 10),
                value: parseFloat(row.obs_value),
                sex: row['sex.label']
              }))
              .filter(row => {
                const isSouthAmerican = southAmericaList.includes(row.country);
                if (isSouthAmerican) {
                  countrySet.add(row.country); // Añadir a la lista de países disponibles para filtrar
                }
                return row.country && !isNaN(row.year) && !isNaN(row.value) && row.sex === 'Total' && isSouthAmerican;
              });
            
            console.log('Countries found:', Array.from(countrySet));
            console.log('Processed data length:', processedData.length);
            console.log('Sample data:', processedData.slice(0, 5));
            
            setAvailableCountries(Array.from(countrySet).sort());
            setAllData(processedData);
            setLoading(false);
          },
          error: (err) => {
            setError(`Error al procesar el CSV: ${err.message}`);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar los datos cuando cambia la selección de países
  useEffect(() => {
    if (allData.length > 0) {
      const dataByYear = allData
        .filter(row => selectedCountries.includes(row.country))
        .reduce((acc, row) => {
          acc[row.year] = { ...acc[row.year], year: row.year, [row.country]: row.value };
          return acc;
        }, {});

      const chartData = Object.values(dataByYear).sort((a, b) => a.year - b.year);
      setFilteredData(chartData);
    }
  }, [selectedCountries, allData]);

  const handleCountryToggle = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };
  
  // Componente de tarjeta reutilizable
  const Card = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="bg-blue-100 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
  
  // Memoizamos el cálculo de las estadísticas para evitar recálculos innecesarios
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0 || selectedCountries.length === 0) {
      return { latestAvg: 'N/A', yearRange: 'N/A' };
    }
    
    let totalSum = 0;
    let totalCount = 0;
    const latestYearData = filteredData[filteredData.length - 1] || {};

    selectedCountries.forEach(country => {
        if(latestYearData[country] !== undefined){
            totalSum += latestYearData[country];
            totalCount++;
        }
    });

    return {
      latestAvg: totalCount > 0 ? `${(totalSum / totalCount).toFixed(2)}%` : 'N/A',
      yearRange: filteredData.length > 0 ? `${filteredData[0].year} - ${filteredData[filteredData.length - 1].year}` : 'N/A',
    };
  }, [filteredData, selectedCountries]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-100"><p className="text-xl">Cargando datos...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 p-4 text-center"><p className="text-xl">{error}</p></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Fuerza de Trabajo en Sudamérica</h1>
          <p className="text-gray-500 mt-1">
            Visualización de la Tasa de Participación en la Fuerza Laboral por país y año.
          </p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <HiOutlineFilter className="mr-2" />
            Filtra por País
          </h2>
          <div className="flex flex-wrap gap-2">
            {availableCountries.map(country => (
              <button
                key={country}
                onClick={() => handleCountryToggle(country)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out flex items-center
                  ${selectedCountries.includes(country)
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {country}
                {selectedCountries.includes(country) && <HiOutlineCheckCircle className="ml-2"/>}
              </button>
            ))}
          </div>
          {selectedCountries.length > 0 && (
             <button
                onClick={() => setSelectedCountries([])}
                className="mt-4 flex items-center px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
                <HiOutlineXCircle className="mr-2" />
                Limpiar Selección
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Países Seleccionados" value={selectedCountries.length} icon={<HiOutlineGlobe size={24} className="text-blue-500" />} />
            <Card title="Promedio (Último Año)" value={summaryStats.latestAvg} icon={<HiOutlineTrendingUp size={24} className="text-blue-500" />} />
            <Card title="Rango de Años" value={summaryStats.yearRange} icon={<HiOutlineCalendar size={24} className="text-blue-500" />} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Evolución de la Tasa de Participación Laboral (%)
          </h2>
          {selectedCountries.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" padding={{ left: 30, right: 30 }} />
                <YAxis domain={['auto', 'auto']} label={{ value: 'Tasa (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value) => `${parseFloat(value).toFixed(2)}%`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                    connectNulls // Conecta puntos aunque haya años sin datos para un país
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
                <p>Por favor, selecciona al menos un país para visualizar los datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;