import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from 'recharts';
import Papa from 'papaparse';
import { 
  HiOutlineFilter, HiOutlineMap, HiOutlineXCircle, HiOutlineCheckCircle, 
  HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineGlobe, HiOutlineCurrencyDollar,
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar, HiOutlineRefresh,
  HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineClock, HiOutlineSparkles,
  HiOutlineCollection
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
  
  // Nuevos filtros avanzados
  const [selectedSex, setSelectedSex] = useState('Total');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('15+');
  const [selectedYearRange, setSelectedYearRange] = useState([2015, 2024]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSexOptions, setAvailableSexOptions] = useState(['Total']);
  const [availableAgeGroups, setAvailableAgeGroups] = useState(['15+']);
  
  // Estado para controlar qué gráficos mostrar
  const [activeCharts, setActiveCharts] = useState({
    timeSeries: true,
    comparison: true,
    distribution: true,
    scatter: true,
    radar: true
  });

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

  // Función para procesar datos CSV con filtros avanzados
  const processCSVData = (data, dataType) => {
    // Validar que data existe y es un array
    if (!data || !Array.isArray(data)) {
      console.warn(`No data provided for ${dataType}`);
      return { 
        processedData: [], 
        countries: [],
        sexOptions: ['Total'],
        ageGroups: ['15+'],
        years: []
      };
    }

    const countrySet = new Set();
    const sexSet = new Set();
    const ageGroupSet = new Set();
    const yearSet = new Set();
    
    const southAmericaList = [
      'Argentina', 'Bolivia (Plurinational State of)', 'Brazil', 'Chile', 'Colombia',
      'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname',
      'Uruguay', 'Venezuela (Bolivarian Republic of)'
    ];

    const processedData = data
      .filter(row => row && typeof row === 'object') // Filtrar filas válidas
      .map(row => ({
        country: row['ref_area.label'] || '',
        year: parseInt(row.time, 10),
        value: parseFloat(row.obs_value),
        sex: row['sex.label'] || 'Total',
        ageGroup: row['classif1.label'] || '',
        currency: row['classif1.label'] || 'N/A',
        indicator: row['indicator.label'] || ''
      }))
      .filter(row => {
        // Validar datos básicos
        if (!row.country || isNaN(row.year) || isNaN(row.value)) {
          return false;
        }

        const isSouthAmerican = southAmericaList.includes(row.country);
        if (isSouthAmerican) {
          countrySet.add(row.country);
          if (row.sex) sexSet.add(row.sex);
          yearSet.add(row.year);
          
          // Extraer grupos de edad para datasets que los tienen
          if (dataType !== 'salary' && row.ageGroup && row.ageGroup.includes('Age')) {
            ageGroupSet.add(row.ageGroup);
          }
        }
        
        // Para salarios, filtrar por USD
        if (dataType === 'salary') {
          return isSouthAmerican && row.currency && row.currency.includes('U.S. dollars');
        }
        
        return isSouthAmerican;
      });

    return { 
      processedData: processedData || [], 
      countries: Array.from(countrySet),
      sexOptions: Array.from(sexSet).length > 0 ? Array.from(sexSet) : ['Total'],
      ageGroups: Array.from(ageGroupSet).length > 0 ? Array.from(ageGroupSet) : ['15+'],
      years: Array.from(yearSet).sort((a, b) => a - b)
    };
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
            const processed = processCSVData(result.data, datasetKey);
            resolve({ 
              data: processed.processedData || [], 
              countries: processed.countries || [],
              sexOptions: processed.sexOptions || ['Total'],
              ageGroups: processed.ageGroups || ['15+'],
              years: processed.years || []
            });
          },
          error: (err) => {
            console.error(`Error processing ${datasetKey}:`, err);
            resolve({ 
              data: [], 
              countries: [],
              sexOptions: ['Total'],
              ageGroups: ['15+'],
              years: []
            });
          }
        });
      });
    } catch (err) {
      console.error(`Error loading ${datasetKey}:`, err);
      return { 
        data: [], 
        countries: [],
        sexOptions: ['Total'],
        ageGroups: ['15+'],
        years: []
      };
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

        // Combinar todas las opciones disponibles
        const allCountries = new Set([
          ...(employment.countries || []),
          ...(unemployment.countries || []),
          ...(informal.countries || []),
          ...(laborForce.countries || []),
          ...(salary.countries || [])
        ]);
        
        const allSexOptions = new Set([
          ...(employment.sexOptions || ['Total']),
          ...(unemployment.sexOptions || ['Total']),
          ...(informal.sexOptions || ['Total']),
          ...(laborForce.sexOptions || ['Total']),
          ...(salary.sexOptions || ['Total'])
        ]);
        
        const allAgeGroups = new Set([
          ...(employment.ageGroups || ['15+']),
          ...(unemployment.ageGroups || ['15+']),
          ...(informal.ageGroups || ['15+']),
          ...(laborForce.ageGroups || ['15+'])
        ]);
        
        const allYears = new Set([
          ...(employment.years || []),
          ...(unemployment.years || []),
          ...(informal.years || []),
          ...(laborForce.years || []),
          ...(salary.years || [])
        ]);
        
        setAvailableCountries(Array.from(allCountries).sort());
        setAvailableSexOptions(Array.from(allSexOptions).filter(Boolean));
        setAvailableAgeGroups(Array.from(allAgeGroups).filter(Boolean));
        setAvailableYears(Array.from(allYears).filter(Boolean).sort((a, b) => a - b));
        
        // Establecer rango de años inicial
        const yearArray = Array.from(allYears).filter(Boolean).sort((a, b) => a - b);
        if (yearArray.length > 0) {
          setSelectedYearRange([yearArray[Math.max(0, yearArray.length - 10)], yearArray[yearArray.length - 1]]);
        }
        
        console.log('Datos cargados:', {
          employment: employment.data.length,
          unemployment: unemployment.data.length,
          informal: informal.data.length,
          laborForce: laborForce.data.length,
          salary: salary.data.length,
          countries: Array.from(allCountries),
          sexOptions: Array.from(allSexOptions),
          ageGroups: Array.from(allAgeGroups),
          years: Array.from(allYears)
        });
        
      } catch (err) {
        setError(`Error cargando datos: ${err.message}`);
      }
      setLoading(false);
    };

    loadAllData();
  }, []);

  // Función para obtener datos del dataset activo con filtros
  const getFilteredActiveData = () => {
    let data = [];
    switch (activeDataset) {
      case 'employment': data = employmentData; break;
      case 'unemployment': data = unemploymentData; break;
      case 'informal': data = informalEmploymentData; break;
      case 'laborForce': data = laborForceData; break;
      case 'salary': data = salaryData; break;
      default: data = [];
    }

    return data.filter(row => {
      const matchesSex = selectedSex === 'Total' || row.sex === selectedSex;
      const matchesYear = row.year >= selectedYearRange[0] && row.year <= selectedYearRange[1];
      const matchesCountry = selectedCountries.some(country => row.country.includes(country));
      
      // Para datasets con grupos de edad
      let matchesAge = true;
      if (activeDataset !== 'salary' && row.ageGroup) {
        if (selectedAgeGroup === '15+') {
          matchesAge = row.ageGroup.includes('15+');
        } else if (selectedAgeGroup === '15-64') {
          matchesAge = row.ageGroup.includes('15-64');
        } else if (selectedAgeGroup === '15-24') {
          matchesAge = row.ageGroup.includes('15-24');
        } else if (selectedAgeGroup === '25+') {
          matchesAge = row.ageGroup.includes('25+');
        }
      }
      
      return matchesSex && matchesYear && matchesCountry && matchesAge;
    });
  };

  // Procesar datos para el gráfico de series temporales
  const chartData = useMemo(() => {
    const activeData = getFilteredActiveData();
    if (activeData.length === 0 || selectedCountries.length === 0) return [];

    const dataByYear = activeData
      .reduce((acc, row) => {
        const simplifiedCountry = selectedCountries.find(country => row.country.includes(country)) || row.country;
        acc[row.year] = { ...acc[row.year], year: row.year, [simplifiedCountry]: row.value };
        return acc;
      }, {});

    return Object.values(dataByYear).sort((a, b) => a.year - b.year);
  }, [selectedCountries, activeDataset, selectedSex, selectedAgeGroup, selectedYearRange, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  // Datos para análisis de correlación (scatter plot)
  const scatterData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    const getLatestData = (dataset, dataType) => {
      return dataset
        .filter(row => {
          const matchesSex = selectedSex === 'Total' || row.sex === selectedSex;
          const matchesCountry = selectedCountries.some(country => row.country.includes(country));
          let matchesAge = true;
          if (dataType !== 'salary' && row.ageGroup) {
            matchesAge = row.ageGroup.includes(selectedAgeGroup);
          }
          return matchesSex && matchesCountry && matchesAge;
        })
        .sort((a, b) => b.year - a.year);
    };

    const latestEmployment = getLatestData(employmentData, 'employment');
    const latestUnemployment = getLatestData(unemploymentData, 'unemployment');
    
    const scatterPoints = [];
    selectedCountries.forEach(country => {
      const empData = latestEmployment.find(row => row.country.includes(country));
      const unempData = latestUnemployment.find(row => row.country.includes(country));
      
      if (empData && unempData) {
        scatterPoints.push({
          country: country,
          employment: empData.value,
          unemployment: unempData.value,
          year: Math.max(empData.year, unempData.year)
        });
      }
    });
    
    return scatterPoints;
  }, [selectedCountries, selectedSex, selectedAgeGroup, employmentData, unemploymentData]);

  // Datos para gráfico radar (comparación multidimensional)
  const radarData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    const getLatestValue = (dataset, country, dataType) => {
      const countryData = dataset.filter(row => {
        const matchesSex = selectedSex === 'Total' || row.sex === selectedSex;
        const matchesCountry = row.country.includes(country);
        let matchesAge = true;
        if (dataType !== 'salary' && row.ageGroup) {
          matchesAge = row.ageGroup.includes(selectedAgeGroup);
        }
        return matchesSex && matchesCountry && matchesAge;
      }).sort((a, b) => b.year - a.year);
      
      return countryData.length > 0 ? countryData[0].value : 0;
    };

    return selectedCountries.slice(0, 3).map(country => ({
      country: country,
      employment: getLatestValue(employmentData, country, 'employment'),
      unemployment: getLatestValue(unemploymentData, country, 'unemployment'),
      informal: getLatestValue(informalEmploymentData, country, 'informal'),
      laborForce: getLatestValue(laborForceData, country, 'laborForce'),
      salary: getLatestValue(salaryData, country, 'salary') / 100 // Escalar para visualización
    }));
  }, [selectedCountries, selectedSex, selectedAgeGroup, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  // Estadísticas resumidas actualizadas
  const summaryStats = useMemo(() => {
    if (chartData.length === 0 || selectedCountries.length === 0) {
      return { 
        latestAvg: 'N/A', 
        yearRange: 'N/A', 
        totalCountries: 0,
        dataPoints: 0,
        trend: 'N/A'
      };
    }
    
    let totalSum = 0;
    let totalCount = 0;
    const latestYearData = chartData[chartData.length - 1] || {};
    const previousYearData = chartData[chartData.length - 2] || {};

    selectedCountries.forEach(country => {
      if (latestYearData[country] !== undefined) {
        totalSum += latestYearData[country];
        totalCount++;
      }
    });

    // Calcular tendencia
    let trend = 'N/A';
    if (totalCount > 0 && Object.keys(previousYearData).length > 0) {
      let prevSum = 0;
      let prevCount = 0;
      selectedCountries.forEach(country => {
        if (previousYearData[country] !== undefined) {
          prevSum += previousYearData[country];
          prevCount++;
        }
      });
      
      if (prevCount > 0) {
        const currentAvg = totalSum / totalCount;
        const prevAvg = prevSum / prevCount;
        const change = ((currentAvg - prevAvg) / prevAvg) * 100;
        trend = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
      }
    }

    return {
      latestAvg: totalCount > 0 ? `${(totalSum / totalCount).toFixed(2)}${datasets[activeDataset].unit}` : 'N/A',
      yearRange: chartData.length > 0 ? `${chartData[0].year} - ${chartData[chartData.length - 1].year}` : 'N/A',
      totalCountries: selectedCountries.length,
      dataPoints: chartData.length * selectedCountries.length,
      trend: trend
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

        {/* Filtros Avanzados */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-6">
            <HiOutlineSparkles className="mr-2" />
            Filtros Avanzados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtro por Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HiOutlineUserGroup className="mr-2" />
                Sexo
              </label>
              <select
                value={selectedSex}
                onChange={(e) => setSelectedSex(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSexOptions.map(sex => (
                  <option key={sex} value={sex}>{sex}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Grupo de Edad */}
            {activeDataset !== 'salary' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <HiOutlineAcademicCap className="mr-2" />
                  Grupo de Edad
                </label>
                <select
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableAgeGroups.map(age => (
                    <option key={age} value={age}>
                      {age.replace('Age (Youth, adults): ', '')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro por Rango de Años */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HiOutlineClock className="mr-2" />
                Rango de Años
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedYearRange[0]}
                  onChange={(e) => setSelectedYearRange([parseInt(e.target.value), selectedYearRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="self-center text-gray-500">-</span>
                <select
                  value={selectedYearRange[1]}
                  onChange={(e) => setSelectedYearRange([selectedYearRange[0], parseInt(e.target.value)])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selector de Gráficos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <HiOutlineCollection className="mr-2" />
                Gráficos a Mostrar
              </label>
              <div className="space-y-2">
                {Object.entries({
                  timeSeries: 'Series Temporales',
                  comparison: 'Comparación',
                  distribution: 'Distribución',
                  scatter: 'Correlación',
                  radar: 'Radar'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeCharts[key]}
                      onChange={(e) => setActiveCharts(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
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

        {/* Estadísticas Resumen Expandidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            title="Tendencia Anual" 
            value={summaryStats.trend} 
            icon={HiOutlineChartBar} 
            color="purple" 
          />
          <StatCard 
            title="Puntos de Datos" 
            value={summaryStats.dataPoints} 
            icon={HiOutlineCollection} 
            color="orange" 
          />
          <StatCard 
            title="Rango de Años" 
            value={summaryStats.yearRange} 
            icon={HiOutlineCalendar} 
            color="indigo" 
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

        {/* Gráfico 1: Área Apilada - Tendencias Temporales */}
        {activeCharts.timeSeries && selectedCountries.length > 0 && chartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              📈 Análisis de Tendencias - {datasets[activeDataset].title}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis 
                  label={{ 
                    value: `${datasets[activeDataset].title} (${datasets[activeDataset].unit})`, 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <Tooltip
                  formatter={(value) => `${parseFloat(value).toFixed(2)}${datasets[activeDataset].unit}`}
                />
                <Legend />
                {selectedCountries.map((country, index) => (
                  <Area
                    key={country}
                    type="monotone"
                    dataKey={country}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico 2: Scatter Plot - Correlación Empleo vs Desempleo */}
        {activeCharts.scatter && scatterData.length > 0 && (
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
        )}

        {/* Gráfico 3: Radar Chart - Comparación Multidimensional */}
        {activeCharts.radar && radarData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              🎯 Análisis Multidimensional (Primeros 3 Países)
            </h2>
            <div className="mb-4 text-sm text-gray-600">
              <p>Comparación de todos los indicadores. Salarios escalados ÷100</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData[0] ? Object.keys(radarData[0]).filter(k => k !== 'country').map(key => ({
                indicator: key,
                ...radarData.reduce((acc, country, idx) => ({
                  ...acc,
                  [country.country]: country[key] || 0
                }), {})
              })) : []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicator" />
                <PolarRadiusAxis />
                {radarData.map((country, index) => (
                  <Radar
                    key={country.country}
                    name={country.country}
                    dataKey={country.country}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico 4: Gráfico Combinado - Análisis Temporal Avanzado */}
        {activeCharts.comparison && selectedCountries.length > 0 && chartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              📊 Análisis Combinado - {datasets[activeDataset].title}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis 
                  label={{ 
                    value: `${datasets[activeDataset].title} (${datasets[activeDataset].unit})`, 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}${datasets[activeDataset].unit}`} />
                <Legend />
                {selectedCountries.slice(0, 2).map((country, index) => (
                  <Line
                    key={`line-${country}`}
                    type="monotone"
                    dataKey={country}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                  />
                ))}
                {selectedCountries.slice(2, 4).map((country, index) => (
                  <Bar
                    key={`bar-${country}`}
                    dataKey={country}
                    fill={COLORS[(index + 2) % COLORS.length]}
                    fillOpacity={0.7}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico 5: Distribución por Períodos */}
        {activeCharts.distribution && selectedCountries.length > 0 && chartData.length > 0 && (
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
                    data={selectedCountries.map(country => {
                      const countryData = chartData.filter(d => d[country] !== undefined);
                      const avg = countryData.length > 0 
                        ? countryData.reduce((sum, d) => sum + (d[country] || 0), 0) / countryData.length 
                        : 0;
                      return { country, average: avg };
                    })}
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
        )}

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
