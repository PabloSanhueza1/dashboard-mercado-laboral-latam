import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Papa from 'papaparse';
import { 
  HiOutlineFilter, HiOutlineMap, HiOutlineXCircle, HiOutlineCheckCircle, 
  HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineGlobe, HiOutlineCurrencyDollar,
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar, HiOutlineRefresh
} from 'react-icons/hi';

// Paleta de colores para las líneas del gráfico
const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
  '#6366F1', '#F97316', '#06B6D4', '#D946EF', '#22C55E', '#EAB308'
];

const Dashboard = () => {
  // Estados para cada dataset
  const [employmentData, setEmploymentData] = useState([]);
  const [unemploymentData, setUnemploymentData] = useState([]);
  const [informalEmploymentData, setInformalEmploymentData] = useState([]);
  const [laborForceData, setLaborForceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['Chile', 'Argentina', 'Brazil', 'Colombia', 'Peru']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataset, setActiveDataset] = useState('employment');

  // Configuración de datasets
  const datasets = {
    employment: {
      file: 'tasa_empleo_por_sexo_edad_sudamerica.csv',
      title: 'Tasa de Empleo',
      color: '#3B82F6',
      icon: HiOutlineBriefcase,
      unit: '%'
    },
    unemployment: {
      file: 'tasa_desempleo_por_sexo_edad_sudamerica.csv',
      title: 'Tasa de Desempleo',
      color: '#EF4444',
      icon: HiOutlineChartBar,
      unit: '%'
    },
    informal: {
      file: 'tasa_empleo_informal_por_sexo_sudamerica.csv',
      title: 'Empleo Informal',
      color: '#F59E0B',
      icon: HiOutlineUsers,
      unit: '%'
    },
    laborForce: {
      file: 'poblacion_economicamente_activa_por_sexo_edad_sudamerica.csv',
      title: 'Población Económicamente Activa',
      color: '#10B981',
      icon: HiOutlineGlobe,
      unit: '%'
    },
    salary: {
      file: 'salarios_promedio_mensuales_por_sexo_sudamerica.csv',
      title: 'Salarios Promedio Mensuales',
      color: '#8B5CF6',
      icon: HiOutlineCurrencyDollar,
      unit: 'USD'
    }
  };

  // Función para procesar datos CSV
  const processCSVData = (data, dataType) => {
    const countrySet = new Set();
    const southAmericaList = [
      'Argentina', 'Bolivia (Plurinational State of)', 'Brazil', 'Chile', 'Colombia',
      'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname',
      'Uruguay', 'Venezuela (Bolivarian Republic of)'
    ];

    const processedData = data
      .map(row => ({
        country: row['ref_area.label'],
        year: parseInt(row.time, 10),
        value: parseFloat(row.obs_value),
        sex: row['sex.label'],
        currency: row['classif1.label'] || 'N/A'
      }))
      .filter(row => {
        const isSouthAmerican = southAmericaList.includes(row.country);
        if (isSouthAmerican) {
          countrySet.add(row.country);
        }
        
        // Para salarios, filtrar por USD
        if (dataType === 'salary') {
          return row.country && !isNaN(row.year) && !isNaN(row.value) && 
                 row.sex === 'Total' && isSouthAmerican && 
                 row.currency && row.currency.includes('U.S. dollars');
        }
        
        return row.country && !isNaN(row.year) && !isNaN(row.value) && 
               row.sex === 'Total' && isSouthAmerican;
      });

    return { processedData, countries: Array.from(countrySet) };
  };

  // Función para cargar un dataset específico
  const loadDataset = async (datasetKey) => {
    try {
      const response = await fetch(`/dataset/${datasets[datasetKey].file}`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${datasets[datasetKey].title}`);
      }
      const csvText = await response.text();

      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const { processedData, countries } = processCSVData(result.data, datasetKey);
            resolve({ data: processedData, countries });
          },
          error: (err) => {
            console.error(`Error processing ${datasetKey}:`, err);
            resolve({ data: [], countries: [] });
          }
        });
      });
    } catch (err) {
      console.error(`Error loading ${datasetKey}:`, err);
      return { data: [], countries: [] };
    }
  };

  // Cargar todos los datasets
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [employment, unemployment, informal, laborForce, salary] = await Promise.all([
          loadDataset('employment'),
          loadDataset('unemployment'),
          loadDataset('informal'),
          loadDataset('laborForce'),
          loadDataset('salary')
        ]);

        setEmploymentData(employment.data);
        setUnemploymentData(unemployment.data);
        setInformalEmploymentData(informal.data);
        setLaborForceData(laborForce.data);
        setSalaryData(salary.data);

        // Combinar todos los países únicos
        const allCountries = new Set([
          ...employment.countries,
          ...unemployment.countries,
          ...informal.countries,
          ...laborForce.countries,
          ...salary.countries
        ]);
        
        setAvailableCountries(Array.from(allCountries).sort());
        console.log('Datos cargados:', {
          employment: employment.data.length,
          unemployment: unemployment.data.length,
          informal: informal.data.length,
          laborForce: laborForce.data.length,
          salary: salary.data.length,
          countries: Array.from(allCountries)
        });
        
      } catch (err) {
        setError(`Error cargando datos: ${err.message}`);
      }
      setLoading(false);
    };

    loadAllData();
  }, []);

  // Función para obtener datos del dataset activo
  const getActiveData = () => {
    switch (activeDataset) {
      case 'employment': return employmentData;
      case 'unemployment': return unemploymentData;
      case 'informal': return informalEmploymentData;
      case 'laborForce': return laborForceData;
      case 'salary': return salaryData;
      default: return [];
    }
  };

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    const activeData = getActiveData();
    if (activeData.length === 0 || selectedCountries.length === 0) return [];

    const dataByYear = activeData
      .filter(row => selectedCountries.some(country => row.country.includes(country)))
      .reduce((acc, row) => {
        const simplifiedCountry = selectedCountries.find(country => row.country.includes(country)) || row.country;
        acc[row.year] = { ...acc[row.year], year: row.year, [simplifiedCountry]: row.value };
        return acc;
      }, {});

    return Object.values(dataByYear).sort((a, b) => a.year - b.year);
  }, [selectedCountries, activeDataset, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  // Estadísticas resumidas
  const summaryStats = useMemo(() => {
    if (chartData.length === 0 || selectedCountries.length === 0) {
      return { latestAvg: 'N/A', yearRange: 'N/A', totalCountries: 0 };
    }
    
    let totalSum = 0;
    let totalCount = 0;
    const latestYearData = chartData[chartData.length - 1] || {};

    selectedCountries.forEach(country => {
      if (latestYearData[country] !== undefined) {
        totalSum += latestYearData[country];
        totalCount++;
      }
    });

    return {
      latestAvg: totalCount > 0 ? `${(totalSum / totalCount).toFixed(2)}${datasets[activeDataset].unit}` : 'N/A',
      yearRange: chartData.length > 0 ? `${chartData[0].year} - ${chartData[chartData.length - 1].year}` : 'N/A',
      totalCountries: selectedCountries.length
    };
  }, [chartData, selectedCountries, activeDataset]);

  const handleCountryToggle = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  // Datos para gráfico comparativo
  const comparisonData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    const latestYearData = {};
    
    // Para cada país seleccionado, obtener los datos más recientes de todos los datasets
    selectedCountries.forEach(country => {
      latestYearData[country] = {};
      
      // Empleo
      const employmentCountryData = employmentData.filter(row => row.country.includes(country));
      if (employmentCountryData.length > 0) {
        const latest = employmentCountryData.sort((a, b) => b.year - a.year)[0];
        latestYearData[country].employment = latest.value;
      }
      
      // Desempleo
      const unemploymentCountryData = unemploymentData.filter(row => row.country.includes(country));
      if (unemploymentCountryData.length > 0) {
        const latest = unemploymentCountryData.sort((a, b) => b.year - a.year)[0];
        latestYearData[country].unemployment = latest.value;
      }
      
      // Empleo Informal
      const informalCountryData = informalEmploymentData.filter(row => row.country.includes(country));
      if (informalCountryData.length > 0) {
        const latest = informalCountryData.sort((a, b) => b.year - a.year)[0];
        latestYearData[country].informal = latest.value;
      }
      
      // Población Económicamente Activa
      const laborForceCountryData = laborForceData.filter(row => row.country.includes(country));
      if (laborForceCountryData.length > 0) {
        const latest = laborForceCountryData.sort((a, b) => b.year - a.year)[0];
        latestYearData[country].laborForce = latest.value;
      }
      
      // Salarios (convertir a escala comparable, dividir por 1000)
      const salaryCountryData = salaryData.filter(row => row.country.includes(country));
      if (salaryCountryData.length > 0) {
        const latest = salaryCountryData.sort((a, b) => b.year - a.year)[0];
        latestYearData[country].salary = latest.value / 100; // Escalar para visualización
      }
    });

    return Object.keys(latestYearData).map(country => ({
      country: country,
      ...latestYearData[country]
    })).filter(item => Object.keys(item).length > 1); // Solo países con datos
  }, [selectedCountries, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  // Componente de tarjeta estadística
  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`bg-${color}-100 p-3 rounded-full`}>
          <Icon size={24} className={`text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl">Cargando datos de mercado laboral...</p>
          <p className="text-sm text-gray-500 mt-2">Procesando 5 datasets de Sudamérica</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 p-4 text-center">
        <div>
          <p className="text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Mercado Laboral - Sudamérica</h1>
          <p className="text-gray-500 mt-1">
            Análisis integral de indicadores laborales en países sudamericanos
          </p>
        </header>

        {/* Selector de Dataset */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <HiOutlineChartBar className="mr-2" />
            Selecciona el Indicador a Visualizar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(datasets).map(([key, dataset]) => {
              const IconComponent = dataset.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveDataset(key)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    activeDataset === key
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent 
                    size={24} 
                    className={`mx-auto mb-2 ${
                      activeDataset === key ? 'text-blue-600' : 'text-gray-400'
                    }`} 
                  />
                  <p className={`text-sm font-medium ${
                    activeDataset === key ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    {dataset.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros de países */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <HiOutlineFilter className="mr-2" />
            Selecciona Países para Comparar
          </h2>
          <div className="flex flex-wrap gap-3">
            {availableCountries.map(country => {
              const displayName = country.replace(' (Plurinational State of)', '').replace(' (Bolivarian Republic of)', '');
              return (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(displayName)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out flex items-center ${
                    selectedCountries.includes(displayName)
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {displayName}
                  {selectedCountries.includes(displayName) && <HiOutlineCheckCircle className="ml-2"/>}
                </button>
              );
            })}
          </div>
          {selectedCountries.length > 0 && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedCountries([])}
                className="flex items-center px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <HiOutlineXCircle className="mr-2" />
                Limpiar Selección
              </button>
              <button
                onClick={() => setSelectedCountries(availableCountries.map(c => 
                  c.replace(' (Plurinational State of)', '').replace(' (Bolivarian Republic of)', '')
                ))}
                className="flex items-center px-4 py-2 text-sm bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                <HiOutlineCheckCircle className="mr-2" />
                Seleccionar Todos
              </button>
            </div>
          )}
        </div>

        {/* Estadísticas Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Países Seleccionados" 
            value={summaryStats.totalCountries} 
            icon={HiOutlineGlobe} 
            color="blue" 
          />
          <StatCard 
            title={`Promedio ${datasets[activeDataset].title}`} 
            value={summaryStats.latestAvg} 
            icon={HiOutlineTrendingUp} 
            color="green" 
          />
          <StatCard 
            title="Rango de Años" 
            value={summaryStats.yearRange} 
            icon={HiOutlineCalendar} 
            color="purple" 
          />
        </div>

        {/* Gráfico Principal */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Evolución de {datasets[activeDataset].title}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: datasets[activeDataset].color}}></span>
              {datasets[activeDataset].title}
            </div>
          </div>
          
          {selectedCountries.length > 0 && chartData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <HiOutlineMap size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Selecciona al menos un país para visualizar los datos.</p>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Barras Comparativo - Solo datos más recientes */}
        {selectedCountries.length > 0 && comparisonData.length > 0 && (
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
        )}

        {/* Pie Chart para distribución actual */}
        {selectedCountries.length > 0 && chartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Distribución de {datasets[activeDataset].title} (Año más Reciente)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData[chartData.length - 1] ? 
                    selectedCountries.map((country, index) => ({
                      name: country,
                      value: chartData[chartData.length - 1][country] || 0,
                      fill: COLORS[index % COLORS.length]
                    })).filter(item => item.value > 0) : []
                  }
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
