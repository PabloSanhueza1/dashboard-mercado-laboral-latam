

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, BarChart, ReferenceLine
} from 'recharts';
import { 
  HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineFilter, HiOutlineCalendar, 
  HiOutlineInformationCircle, HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineScale
} from 'react-icons/hi';
import { StatCard } from '../estadisticas/ResumenEstadisticas';

const TimelineComparison = () => {
  const [selectedCountry, setSelectedCountry] = useState('Argentina');
  const [selectedYearRange, setSelectedYearRange] = useState({ start: 2010, end: 2024 });

  const [laborForceData, setLaborForceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableYears, setAvailableYears] = useState({ min: 2010, max: 2024 });

  // Función para normalizar nombres de países
  const normalizeCountryName = (countryName) => {
    const countryMap = {
      'Brazil': 'Brasil',
      'Brasil': 'Brasil',
      'Peru': 'Perú',
      'Perú': 'Perú'
    };
    return countryMap[countryName] || countryName;
  };

  // Función para obtener el nombre del país en el dataset
  const getDatasetCountryName = (countryName) => {
    const reverseMap = {
      'Brasil': 'Brazil',
      'Perú': 'Peru'
    };
    return reverseMap[countryName] || countryName;
  };

  // Función para parsear CSV correctamente
  const parseCSV = (text) => {
    const lines = text.split('\n');
    const result = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && (j === 0 || line[j-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (j === line.length - 1 || line[j+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim());
      
      result.push(cols);
    }
    
    return result;
  };

  // Función para cargar datos de PEA desde CSV
  const loadLaborForceData = async () => {
    try {
      const response = await fetch('/dataset/datos_sudamerica/poblacion_economicamente_activa_por_sexo_edad_sudamerica.csv');
      if (!response.ok) throw new Error('Error al cargar datos de PEA');
      
      const text = await response.text();
      const rows = parseCSV(text);
      
      const data = rows
        .map(cols => ({
          country: normalizeCountryName(cols[0]?.replace(/"/g, '').trim()),
          indicator: cols[2]?.replace(/"/g, '').trim(),
          sex: cols[3]?.replace(/"/g, '').trim(),
          ageGroup: cols[4]?.replace(/"/g, '').trim(),
          year: parseInt(cols[5]),
          participationRate: parseFloat(cols[6])
        }))
        .filter(item => 
          item.country && 
          item.sex && 
          item.ageGroup && 
          item.year && 
          !isNaN(item.participationRate) &&
          item.ageGroup.includes('15+') && // Solo datos de 15+
          (item.sex === 'Male' || item.sex === 'Female') &&
          item.year >= 2010 && item.year <= 2024 // Expandir rango de años
        );
      
      console.log('Datos PEA cargados:', data.length, 'registros');
      return data;
    } catch (error) {
      console.error('Error loading labor force data:', error);
      return [];
    }
  };

  // Función para cargar datos de salarios desde CSV
  const loadSalaryData = async () => {
    try {
      const response = await fetch('/dataset/datos_sudamerica/salarios_promedio_mensuales_por_sexo_sudamerica.csv');
      if (!response.ok) throw new Error('Error al cargar datos de salarios');
      
      const text = await response.text();
      const rows = parseCSV(text);
      
      const data = rows
        .map(cols => ({
          country: normalizeCountryName(cols[0]?.replace(/"/g, '').trim()),
          indicator: cols[2]?.replace(/"/g, '').trim(),
          sex: cols[3]?.replace(/"/g, '').trim(),
          currency: cols[4]?.replace(/"/g, '').trim(),
          year: parseInt(cols[5]),
          salary: parseFloat(cols[6])
        }))
        .filter(item => 
          item.country && 
          item.sex && 
          item.currency && 
          item.year && 
          !isNaN(item.salary) &&
          item.currency.includes('U.S. dollars') && // Solo datos en USD
          (item.sex === 'Male' || item.sex === 'Female') &&
          item.year >= 2010 && item.year <= 2024 // Expandir rango de años
        );
      
      console.log('Datos salarios cargados:', data.length, 'registros');
      return data;
    } catch (error) {
      console.error('Error loading salary data:', error);
      return [];
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const [laborData, salaryDataResult] = await Promise.all([
          loadLaborForceData(),
          loadSalaryData()
        ]);
        
        setLaborForceData(laborData);
        setSalaryData(salaryDataResult);
        
        // Extraer países disponibles (solo los que tienen datos en ambos datasets)
        const laborCountries = [...new Set(laborData.map(item => item.country))].filter(Boolean);
        const salaryCountries = [...new Set(salaryDataResult.map(item => item.country))].filter(Boolean);
        const commonCountries = laborCountries.filter(country => salaryCountries.includes(country));
        
        console.log('Países PEA encontrados:', laborCountries);
        console.log('Países salarios encontrados:', salaryCountries);
        console.log('Países comunes disponibles:', commonCountries);
        setAvailableCountries(commonCountries);
        
        // Extraer años disponibles
        const laborYears = laborData.map(item => item.year).filter(year => !isNaN(year));
        const salaryYears = salaryDataResult.map(item => item.year).filter(year => !isNaN(year));
        const allYears = [...laborYears, ...salaryYears];
        
        if (allYears.length > 0) {
          const minYear = Math.min(...allYears);
          const maxYear = Math.max(...allYears);
          setAvailableYears({ min: minYear, max: maxYear });
          
          // Ajustar el rango de años seleccionado si es necesario
          setSelectedYearRange(prev => ({
            start: Math.max(prev.start, minYear),
            end: Math.min(prev.end, maxYear)
          }));
        }
        
        // Seleccionar el primer país disponible si el actual no está disponible
        if (commonCountries.length > 0 && !commonCountries.includes(selectedCountry)) {
          setSelectedCountry(commonCountries[0]);
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Datos de población total estimada (para calcular PEA absoluta)
  const populationData = {
    'Argentina': {
      2010: 40.4, 2011: 40.8, 2012: 41.3, 2013: 41.7, 2014: 42.1,
      2015: 43.3, 2016: 43.5, 2017: 43.8, 2018: 44.0, 2019: 44.3,
      2020: 44.5, 2021: 44.8, 2022: 45.0, 2023: 45.3, 2024: 45.5
    },
    'Brazil': {
      2010: 195.5, 2011: 197.4, 2012: 199.2, 2013: 201.0, 2014: 202.8,
      2015: 205.9, 2016: 206.8, 2017: 207.7, 2018: 208.5, 2019: 209.5,
      2020: 211.0, 2021: 212.1, 2022: 213.2, 2023: 214.3, 2024: 215.3
    },
    'Brasil': {
      2010: 195.5, 2011: 197.4, 2012: 199.2, 2013: 201.0, 2014: 202.8,
      2015: 205.9, 2016: 206.8, 2017: 207.7, 2018: 208.5, 2019: 209.5,
      2020: 211.0, 2021: 212.1, 2022: 213.2, 2023: 214.3, 2024: 215.3
    },
    'Chile': {
      2010: 17.1, 2011: 17.3, 2012: 17.5, 2013: 17.6, 2014: 17.8,
      2015: 18.6, 2016: 18.7, 2017: 18.8, 2018: 18.9, 2019: 19.0,
      2020: 19.1, 2021: 19.2, 2022: 19.3, 2023: 19.4, 2024: 19.5
    },
    'Colombia': {
      2010: 45.5, 2011: 46.0, 2012: 46.4, 2013: 46.8, 2014: 47.2,
      2015: 47.0, 2016: 47.5, 2017: 48.0, 2018: 48.5, 2019: 49.0,
      2020: 49.5, 2021: 50.0, 2022: 50.5, 2023: 51.0, 2024: 51.5
    },
    'Peru': {
      2010: 29.0, 2011: 29.4, 2012: 29.8, 2013: 30.2, 2014: 30.6,
      2015: 31.2, 2016: 31.4, 2017: 31.6, 2018: 31.8, 2019: 32.0,
      2020: 32.2, 2021: 32.4, 2022: 32.6, 2023: 32.8, 2024: 33.0
    },
    'Perú': {
      2010: 29.0, 2011: 29.4, 2012: 29.8, 2013: 30.2, 2014: 30.6,
      2015: 31.2, 2016: 31.4, 2017: 31.6, 2018: 31.8, 2019: 32.0,
      2020: 32.2, 2021: 32.4, 2022: 32.6, 2023: 32.8, 2024: 33.0
    }
  };

  // Procesar datos combinados
  const processedData = useMemo(() => {
    if (loading || laborForceData.length === 0 || salaryData.length === 0) {
      return [];
    }

    // Filtrar datos de PEA para el país y rango de años seleccionados
    const filtered = laborForceData.filter(item => 
      item.country === selectedCountry && 
      item.year >= selectedYearRange.start && 
      item.year <= selectedYearRange.end
    );

    const grouped = {};
    filtered.forEach(item => {
      const key = `${item.year}`;
      if (!grouped[key]) {
        grouped[key] = { year: item.year };
      }
      
      // Obtener población total estimada (buscar con ambos nombres)
      const totalPopulation = populationData[item.country]?.[item.year] || 
                             populationData[getDatasetCountryName(item.country)]?.[item.year] || 0;
      
      // Calcular población económicamente activa en millones
      const activePop = (item.participationRate / 100) * totalPopulation;
      grouped[key][`activePop${item.sex}`] = activePop;
      grouped[key][`participationRate${item.sex}`] = item.participationRate;
    });

    // Agregar datos salariales
    const salaryFiltered = salaryData.filter(item => 
      item.country === selectedCountry && 
      item.year >= selectedYearRange.start && 
      item.year <= selectedYearRange.end
    );

    salaryFiltered.forEach(item => {
      const key = `${item.year}`;
      if (grouped[key]) {
        grouped[key][`salary${item.sex}`] = item.salary;
      }
    });

    return Object.values(grouped)
      .filter(item => item.activePopMale !== undefined && item.activePopFemale !== undefined)
      .sort((a, b) => a.year - b.year);
  }, [selectedCountry, selectedYearRange, laborForceData, salaryData, loading]);

  // Configuración de métricas disponibles
  const metricsConfig = [
    {
      id: 'totalPEA',
      title: 'PEA Total Actual',
      icon: HiOutlineUsers,
      color: 'blue',
      formatter: (value) => `${value.toFixed(1)}M`,
      calculate: (latest, first) => ({
        value: (latest?.activePopMale || 0) + (latest?.activePopFemale || 0),
        firstValue: (first?.activePopMale || 0) + (first?.activePopFemale || 0)
      })
    },
    {
      id: 'avgSalary',
      title: 'Salario Promedio',
      icon: HiOutlineCurrencyDollar,
      color: 'green',
      formatter: (value) => `$${value.toFixed(0)}`,
      calculate: (latest, first) => ({
        value: ((latest?.salaryMale || 0) + (latest?.salaryFemale || 0)) / 2,
        firstValue: ((first?.salaryMale || 0) + (first?.salaryFemale || 0)) / 2
      })
    },
    {
      id: 'peaGap',
      title: 'Brecha PEA (M-F)',
      icon: HiOutlineChartBar,
      color: 'purple',
      formatter: (value) => `${value.toFixed(1)}%`,
      calculate: (latest, first) => ({
        value: (latest?.participationRateMale || 0) - (latest?.participationRateFemale || 0),
        firstValue: (first?.participationRateMale || 0) - (first?.participationRateFemale || 0)
      })
    },
    {
      id: 'salaryGap',
      title: 'Brecha Salarial (M-F)',
      icon: HiOutlineScale,
      color: 'orange',
      formatter: (value) => `$${value.toFixed(0)}`,
      calculate: (latest, first) => ({
        value: (latest?.salaryMale || 0) - (latest?.salaryFemale || 0),
        firstValue: (first?.salaryMale || 0) - (first?.salaryFemale || 0)
      })
    },
    {
      id: 'malePEA',
      title: 'PEA Masculina',
      icon: HiOutlineUsers,
      color: 'blue',
      formatter: (value) => `${value.toFixed(1)}M`,
      calculate: (latest, first) => ({
        value: latest?.activePopMale || 0,
        firstValue: first?.activePopMale || 0
      })
    },
    {
      id: 'femalePEA',
      title: 'PEA Femenina',
      icon: HiOutlineUsers,
      color: 'purple',
      formatter: (value) => `${value.toFixed(1)}M`,
      calculate: (latest, first) => ({
        value: latest?.activePopFemale || 0,
        firstValue: first?.activePopFemale || 0
      })
    },
    {
      id: 'maleSalary',
      title: 'Salario Masculino',
      icon: HiOutlineCurrencyDollar,
      color: 'green',
      formatter: (value) => `$${value.toFixed(0)}`,
      calculate: (latest, first) => ({
        value: latest?.salaryMale || 0,
        firstValue: first?.salaryMale || 0
      })
    },
    {
      id: 'femaleSalary',
      title: 'Salario Femenino',
      icon: HiOutlineCurrencyDollar,
      color: 'orange',
      formatter: (value) => `$${value.toFixed(0)}`,
      calculate: (latest, first) => ({
        value: latest?.salaryFemale || 0,
        firstValue: first?.salaryFemale || 0
      })
    },
    {
      id: 'participationRatio',
      title: 'Ratio PEA M/F',
      icon: HiOutlineScale,
      color: 'indigo',
      formatter: (value) => `${value.toFixed(2)}:1`,
      calculate: (latest, first) => ({
        value: (latest?.activePopMale || 0) / (latest?.activePopFemale || 1),
        firstValue: (first?.activePopMale || 0) / (first?.activePopFemale || 1)
      })
    },
    {
      id: 'salaryRatio',
      title: 'Ratio Salario M/F',
      icon: HiOutlineScale,
      color: 'green',
      formatter: (value) => `${value.toFixed(2)}:1`,
      calculate: (latest, first) => ({
        value: (latest?.salaryMale || 0) / (latest?.salaryFemale || 1),
        firstValue: (first?.salaryMale || 0) / (first?.salaryFemale || 1)
      })
    },
    {
      id: 'yearRange',
      title: 'Rango de Años',
      icon: HiOutlineCalendar,
      color: 'indigo',
      formatter: (value) => value,
      calculate: () => ({
        value: `${selectedYearRange.start}-${selectedYearRange.end}`,
        firstValue: null
      })
    },
    {
      id: 'dataPoints',
      title: 'Puntos de Datos',
      icon: HiOutlineTrendingUp,
      color: 'blue',
      formatter: (value) => value,
      calculate: () => ({
        value: processedData.length,
        firstValue: null
      })
    }
  ];

  // Métricas seleccionadas por defecto (se pueden modificar fácilmente)
  const [selectedMetrics, setSelectedMetrics] = useState([
    'totalPEA', 'avgSalary', 'peaGap', 'salaryGap', 'yearRange', 'dataPoints'
  ]);

  // Configuraciones predefinidas de métricas
  const metricsPresets = {
    principales: ['totalPEA', 'avgSalary', 'peaGap', 'salaryGap'],
    completas: ['totalPEA', 'avgSalary', 'peaGap', 'salaryGap', 'yearRange', 'dataPoints'],
    genero: ['malePEA', 'femalePEA', 'maleSalary', 'femaleSalary'],
    brechas: ['peaGap', 'salaryGap', 'participationRatio', 'salaryRatio'],
    ratios: ['participationRatio', 'salaryRatio'],
    todas: metricsConfig.map(m => m.id)
  };

  // Función para aplicar preset de métricas
  const applyMetricsPreset = (presetName) => {
    setSelectedMetrics(metricsPresets[presetName] || []);
  };

  // Función para calcular métricas dinámicamente
  const calculateMetrics = useMemo(() => {
    if (processedData.length === 0) return [];

    const latestData = processedData[processedData.length - 1];
    const firstData = processedData[0];

    // Calcular tendencias
    const calculateTrend = (latest, first) => {
      if (!latest || !first || first === 0) return 0;
      return ((latest - first) / first) * 100;
    };

    return selectedMetrics.map(metricId => {
      const config = metricsConfig.find(m => m.id === metricId);
      if (!config) return null;

      const { value, firstValue } = config.calculate(latestData, firstData);
      const trend = firstValue !== null ? calculateTrend(value, firstValue) : undefined;

      return {
        id: config.id,
        title: config.title,
        value: config.formatter(value),
        icon: config.icon,
        color: config.color,
        trend: trend !== undefined ? trend.toFixed(1) : undefined
      };
    }).filter(Boolean);
  }, [processedData, selectedYearRange, selectedMetrics]);

  // Componente de tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Año: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="timeline-comparison-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-16 text-white">
            <HiOutlineUsers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-700 text-gray-800">
              Comparación Temporal: PEA vs Salarios
            </h2>
            <p className="text-gray-600 mt-1">
              Análisis de población económicamente activa (15+ años) y salarios promedio por sexo (2010-2024)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* Filtros integrados */}
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Selector de país */}
                <div className="flex items-center gap-2">
                  <HiOutlineFilter className="w-5 h-5 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">País:</label>
                  <select 
                    value={selectedCountry} 
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

            {/* Selector de rango de años */}
            <div className="flex items-center gap-2">
              <HiOutlineCalendar className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Año inicio:</label>
              <select 
                value={selectedYearRange.start} 
                onChange={(e) => setSelectedYearRange({...selectedYearRange, start: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({length: availableYears.max - availableYears.min + 1}, (_, i) => availableYears.min + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-gray-500">a</span>
              <select 
                value={selectedYearRange.end} 
                onChange={(e) => setSelectedYearRange({...selectedYearRange, end: parseInt(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({length: availableYears.max - availableYears.min + 1}, (_, i) => availableYears.min + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de métricas */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <label className="text-sm font-medium text-gray-700">Métricas:</label>
            <div className="flex flex-wrap gap-2">
              {metricsConfig.slice(0, 8).map(metric => (
                <button
                  key={metric.id}
                  onClick={() => {
                    setSelectedMetrics(prev => 
                      prev.includes(metric.id) 
                        ? prev.filter(id => id !== metric.id)
                        : [...prev, metric.id]
                    );
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                    selectedMetrics.includes(metric.id)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {metric.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selector de vista de métricas */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Métricas seleccionadas:</span>
            <span className="text-sm text-gray-500">
              {selectedMetrics.length} de {metricsConfig.length} disponibles
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => applyMetricsPreset('todas')}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Todas
            </button>
            <button
              onClick={() => applyMetricsPreset('principales')}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Principales
            </button>
            <button
              onClick={() => applyMetricsPreset('genero')}
              className="px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Por Género
            </button>
            <button
              onClick={() => applyMetricsPreset('brechas')}
              className="px-3 py-1 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Brechas
            </button>
            <button
              onClick={() => applyMetricsPreset('ratios')}
              className="px-3 py-1 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Ratios
            </button>
          </div>
        </div>

        {/* Métricas clave dinámicas */}
        <div className={`grid gap-4 mb-6 ${
          selectedMetrics.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
          selectedMetrics.length <= 3 ? 'grid-cols-1 md:grid-cols-3' :
          selectedMetrics.length <= 4 ? 'grid-cols-2 md:grid-cols-4' :
          selectedMetrics.length <= 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' :
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}>
          {calculateMetrics.map((metric) => (
            <StatCard 
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de salarios por sexo */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-600 text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-green-600" />
              Salarios Promedio por Sexo (USD)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  stroke="#666" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={12}
                  label={{ value: 'USD', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="salaryMale" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Salario Masculino"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="salaryFemale" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Salario Femenino"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico combinado */}
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-600 text-gray-800 mb-4">
            Análisis Combinado: PEA vs Salarios
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#666" 
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="#666" 
                fontSize={12}
                label={{ value: 'Millones de personas', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#666" 
                fontSize={12}
                label={{ value: 'USD', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="activePopMale" 
                fill="#3B82F6" 
                name="PEA Masculina"
                opacity={0.6}
              />
              <Bar 
                yAxisId="left"
                dataKey="activePopFemale" 
                fill="#EC4899" 
                name="PEA Femenina"
                opacity={0.6}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="salaryMale" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Salario Masculino"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="salaryFemale" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Salario Femenino"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Panel de información */}
        <div className="glass-card p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <HiOutlineInformationCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-600 text-gray-800">Información del Análisis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Población Económicamente Activa (PEA):</strong> Comprende a todas las personas de 15 años y más que participan en la fuerza laboral, ya sea trabajando o buscando trabajo activamente.</p>
              <p className="mt-2"><strong>Salarios en USD:</strong> Salarios promedio mensuales convertidos a dólares estadounidenses para facilitar la comparación entre países.</p>
            </div>
            <div>
              <p><strong>Brecha de PEA:</strong> Diferencia entre la tasa de participación laboral masculina y femenina, indicando disparidades en el acceso al mercado laboral.</p>
              <p className="mt-2"><strong>Brecha Salarial:</strong> Diferencia entre los salarios promedio de hombres y mujeres, reflejando desigualdades en la remuneración.</p>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  </div>
);
};

export default TimelineComparison;
