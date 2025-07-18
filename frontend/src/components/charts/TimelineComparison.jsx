import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, BarChart, ReferenceLine
} from 'recharts';
import {
  HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineFilter, HiOutlineCalendar,
  HiOutlineInformationCircle, HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineScale, HiChevronDown
} from 'react-icons/hi';
import { StatCard } from '../estadisticas/ResumenEstadisticas';
import { Range } from 'react-range';

const TimelineComparison = () => {
  const [selectedCountry, setSelectedCountry] = useState('Argentina');
  const [selectedYearRange, setSelectedYearRange] = useState({ start: 2010, end: 2023 });

  const [laborForceData, setLaborForceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableYears, setAvailableYears] = useState({ min: 2010, max: 2023 });
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const countryDisplayNames = {
    'Argentina': 'Argentina',
    'Brasil': 'Brasil',
    'Perú': 'Perú',
    'Bolivia': 'Bolivia',
    'Venezuela': 'Venezuela',
    'Chile': 'Chile',
    'Colombia': 'Colombia',
    'Ecuador': 'Ecuador',
    'Paraguay': 'Paraguay',
    'Uruguay': 'Uruguay',
    'Guyana': 'Guyana',
    'Suriname': 'Suriname',
    'Guayana Francesa': 'Guayana Francesa'
  };

  // Función para normalizar nombres de países
  const normalizeCountryName = (countryName) => {
    const countryMap = {
      'Brazil': 'Brasil',
      'Brasil': 'Brasil',
      'Peru': 'Perú',
      'Perú': 'Perú',
      'Bolivia (Plurinational State of)': 'Bolivia',
      'Venezuela (Bolivarian Republic of)': 'Venezuela',
      'Chile': 'Chile',
      'Colombia': 'Colombia',
      'Argentina': 'Argentina',
      'Ecuador': 'Ecuador',
      'Paraguay': 'Paraguay',
      'Uruguay': 'Uruguay',
      'Guyana': 'Guyana',
      'Suriname': 'Suriname',
      'French Guiana': 'Guayana Francesa'
    };
    return countryMap[countryName] || countryName;
  };

  // Función para obtener el nombre del país en el dataset
  const getDatasetCountryName = (countryName) => {
    const reverseMap = {
      'Brasil': 'Brazil',
      'Perú': 'Peru',
      'Bolivia': 'Bolivia (Plurinational State of)',
      'Venezuela': 'Venezuela (Bolivarian Republic of)',
      'Chile': 'Chile',
      'Colombia': 'Colombia',
      'Argentina': 'Argentina',
      'Ecuador': 'Ecuador',
      'Paraguay': 'Paraguay',
      'Uruguay': 'Uruguay',
      'Guyana': 'Guyana',
      'Suriname': 'Suriname',
      'Guayana Francesa': 'French Guiana'
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

        if (char === '"' && (j === 0 || line[j - 1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (j === line.length - 1 || line[j + 1] === ',')) {
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
          item.year >= 2000 && item.year <= 2024 // Rango más amplio para capturar más datos
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
          item.year >= 2000 && item.year <= 2024 // Rango más amplio para capturar más datos
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
    },
    'Bolivia': {
      2010: 10.4, 2011: 10.6, 2012: 10.8, 2013: 11.0, 2014: 11.2,
      2015: 11.4, 2016: 11.6, 2017: 11.8, 2018: 12.0, 2019: 12.2,
      2020: 12.4, 2021: 12.6, 2022: 12.8, 2023: 13.0, 2024: 13.2
    },
    'Venezuela': {
      2010: 29.0, 2011: 29.4, 2012: 29.8, 2013: 30.2, 2014: 30.6,
      2015: 31.0, 2016: 31.4, 2017: 31.8, 2018: 32.2, 2019: 28.2,
      2020: 28.4, 2021: 28.6, 2022: 28.8, 2023: 29.0, 2024: 29.2
    },
    'Ecuador': {
      2010: 15.7, 2011: 15.9, 2012: 16.1, 2013: 16.3, 2014: 16.5,
      2015: 16.8, 2016: 17.0, 2017: 17.2, 2018: 17.4, 2019: 17.6,
      2020: 17.8, 2021: 18.0, 2022: 18.2, 2023: 18.4, 2024: 18.6
    },
    'Paraguay': {
      2010: 6.5, 2011: 6.6, 2012: 6.7, 2013: 6.8, 2014: 6.9,
      2015: 7.0, 2016: 7.1, 2017: 7.2, 2018: 7.3, 2019: 7.4,
      2020: 7.5, 2021: 7.6, 2022: 7.7, 2023: 7.8, 2024: 7.9
    },
    'Uruguay': {
      2010: 3.4, 2011: 3.4, 2012: 3.4, 2013: 3.4, 2014: 3.4,
      2015: 3.5, 2016: 3.5, 2017: 3.5, 2018: 3.5, 2019: 3.5,
      2020: 3.5, 2021: 3.5, 2022: 3.5, 2023: 3.5, 2024: 3.5
    },
    'Guyana': {
      2010: 0.8, 2011: 0.8, 2012: 0.8, 2013: 0.8, 2014: 0.8,
      2015: 0.8, 2016: 0.8, 2017: 0.8, 2018: 0.8, 2019: 0.8,
      2020: 0.8, 2021: 0.8, 2022: 0.8, 2023: 0.8, 2024: 0.8
    },
    'Suriname': {
      2010: 0.5, 2011: 0.5, 2012: 0.5, 2013: 0.5, 2014: 0.5,
      2015: 0.6, 2016: 0.6, 2017: 0.6, 2018: 0.6, 2019: 0.6,
      2020: 0.6, 2021: 0.6, 2022: 0.6, 2023: 0.6, 2024: 0.6
    }
  };

  // Construir array de años disponibles
  const availableYearsArray = useMemo(() => {
    return Array.from({ length: availableYears.max - availableYears.min + 1 }, (_, i) => availableYears.min + i);
  }, [availableYears]);

  // Estado para el slider
  const sliderValues = [
    availableYearsArray.indexOf(selectedYearRange.start),
    availableYearsArray.indexOf(selectedYearRange.end)
  ];

  const handleSliderChange = (values) => {
    const [startIdx, endIdx] = values;
    setSelectedYearRange({
      start: availableYearsArray[startIdx],
      end: availableYearsArray[endIdx]
    });
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

      // Obtener población total estimada (buscar con múltiples nombres posibles)
      const totalPopulation = populationData[item.country]?.[item.year] ||
        populationData[getDatasetCountryName(item.country)]?.[item.year] ||
        populationData[normalizeCountryName(item.country)]?.[item.year] || 0;

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
    brechas: ['peaGap', 'salaryGap'],
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
        <div
          className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg"
          style={{ background: '#fff' }}
        >
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
    <div className="chart-container">
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Cargando datos...</span>
          </div>
        ) : (
          <div className="bg-white bg-opacity-90 rounded-2xl border border-gray-200 shadow-lg p-6">
            {/* Título y descripción */}
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Comparación temporal: PEA vs Salarios
                </h2>
                <p className="text-gray-600 mt-1">
                  Análisis de población económicamente activa (15+ años) y salarios promedio por sexo (2000-2024)
                </p>
              </div>
            </div>

            {/* Filtros integrados */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Selector de país */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">País:</label>
                  {/* Nuevo diseño de selector de país */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableCountries.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`px-4 py-1 rounded border text-sm flex items-center gap-1 transition-colors
                          ${selectedCountry === c
                            ? "bg-[#fde68a] border-[#ea580c] text-[#b45309]"
                            : "bg-[#fff] border-[#fde68a] text-[#ea580c] hover:bg-[#fff7ed] hover:border-[#ea580c]"}`}
                        style={{
                          backgroundColor: selectedCountry === c ? '#fde68a' : '#fff',
                          color: selectedCountry === c ? '#b45309' : '#ea580c',
                          border: selectedCountry === c ? '2px solid #ea580c' : '1px solid #fde68a',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 'normal',
                          fontSize: '16px',
                          boxShadow: 'none',
                          cursor: 'pointer',
                          minWidth: 90,
                          outline: 'none',
                          margin: '8px 8px 8px 0',
                        }}
                        onClick={() => setSelectedCountry(c)}
                      >
                        <span className="truncate">{countryDisplayNames[c] || c}</span>
                        {selectedCountry === c && (
                          <svg width="14" height="14" fill="none" viewBox="0 0 20 20" style={{ marginLeft: 2 }}>
                            <circle cx="10" cy="10" r="7" fill="#fbbf24" opacity="0.7" />
                            <path d="M7.5 10.5l2 2 3-3" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selector de métricas */}
              <div className="flex items-center gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">Métricas:</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metricsConfig.slice(0, 8).map(metric => (
                    <button
                      key={metric.id}
                      type="button"
                      className={`px-4 py-1 rounded border text-sm flex items-center gap-1 transition-colors
                        ${selectedMetrics.includes(metric.id)
                          ? "bg-[#fde68a] border-[#ea580c] text-[#b45309]"
                          : "bg-[#fff] border-[#fde68a] text-[#ea580c] hover:bg-[#fff7ed] hover:border-[#ea580c]"}`}
                      style={{
                        backgroundColor: selectedMetrics.includes(metric.id) ? '#fde68a' : '#fff',
                        color: selectedMetrics.includes(metric.id) ? '#b45309' : '#ea580c',
                        border: selectedMetrics.includes(metric.id) ? '2px solid #ea580c' : '1px solid #fde68a',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'normal',
                        fontSize: '16px',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        minWidth: 90,
                        outline: 'none',
                        margin: '8px 8px 8px 0',
                      }}
                      onClick={() => {
                        setSelectedMetrics(prev =>
                          prev.includes(metric.id)
                            ? prev.filter(id => id !== metric.id)
                            : [...prev, metric.id]
                        );
                      }}
                    >
                      <span className="truncate">{metric.title}</span>
                      {selectedMetrics.includes(metric.id) && (
                        <svg width="14" height="14" fill="none" viewBox="0 0 20 20" style={{ marginLeft: 2 }}>
                          <circle cx="10" cy="10" r="7" fill="#fbbf24" opacity="0.7" />
                          <path d="M7.5 10.5l2 2 3-3" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selector de vista de métricas */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Métricas seleccionadas: </span>
                <span className="text-sm text-gray-500">
                  {selectedMetrics.length} de {metricsConfig.length} disponibles
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => applyMetricsPreset('todas')}
                  type="button"
                  style={{
                    backgroundColor: selectedMetrics.length === metricsConfig.length ? '#fde68a' : '#fff',
                    color: selectedMetrics.length === metricsConfig.length ? '#b45309' : '#ea580c',
                    border: selectedMetrics.length === metricsConfig.length ? '2px solid #ea580c' : '1px solid #fde68a',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'normal',
                    fontSize: '16px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    minWidth: 90,
                    outline: 'none',
                    margin: '8px 8px 8px 0',
                  }}
                  className="transition-colors"
                >
                  Todas
                </button>
                <button
                  onClick={() => applyMetricsPreset('principales')}
                  type="button"
                  style={{
                    backgroundColor:
                      selectedMetrics.length === metricsPresets.principales.length &&
                        metricsPresets.principales.every(id => selectedMetrics.includes(id))
                        ? '#fde68a'
                        : '#fff',
                    color:
                      selectedMetrics.length === metricsPresets.principales.length &&
                        metricsPresets.principales.every(id => selectedMetrics.includes(id))
                        ? '#b45309'
                        : '#ea580c',
                    border:
                      selectedMetrics.length === metricsPresets.principales.length &&
                        metricsPresets.principales.every(id => selectedMetrics.includes(id))
                        ? '2px solid #ea580c'
                        : '1px solid #fde68a',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'normal',
                    fontSize: '16px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    minWidth: 90,
                    outline: 'none',
                    margin: '8px 8px 8px 0',
                  }}
                  className="transition-colors"
                >
                  Principales
                </button>
                <button
                  onClick={() => applyMetricsPreset('genero')}
                  type="button"
                  style={{
                    backgroundColor:
                      selectedMetrics.length === metricsPresets.genero.length &&
                        metricsPresets.genero.every(id => selectedMetrics.includes(id))
                        ? '#fde68a'
                        : '#fff',
                    color:
                      selectedMetrics.length === metricsPresets.genero.length &&
                        metricsPresets.genero.every(id => selectedMetrics.includes(id))
                        ? '#b45309'
                        : '#ea580c',
                    border:
                      selectedMetrics.length === metricsPresets.genero.length &&
                        metricsPresets.genero.every(id => selectedMetrics.includes(id))
                        ? '2px solid #ea580c'
                        : '1px solid #fde68a',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'normal',
                    fontSize: '16px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    minWidth: 90,
                    outline: 'none',
                    margin: '8px 8px 8px 0',
                  }}
                  className="transition-colors"
                >
                  Por Género
                </button>
                <button
                  onClick={() => applyMetricsPreset('brechas')}
                  type="button"
                  style={{
                    backgroundColor:
                      selectedMetrics.length === metricsPresets.brechas.length &&
                        metricsPresets.brechas.every(id => selectedMetrics.includes(id))
                        ? '#fde68a'
                        : '#fff',
                    color:
                      selectedMetrics.length === metricsPresets.brechas.length &&
                        metricsPresets.brechas.every(id => selectedMetrics.includes(id))
                        ? '#b45309'
                        : '#ea580c',
                    border:
                      selectedMetrics.length === metricsPresets.brechas.length &&
                        metricsPresets.brechas.every(id => selectedMetrics.includes(id))
                        ? '2px solid #ea580c'
                        : '1px solid #fde68a',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 'normal',
                    fontSize: '16px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    minWidth: 90,
                    outline: 'none',
                    margin: '8px 8px 8px 0',
                  }}
                  className="transition-colors"
                >
                  Brechas
                </button>
              </div>
            </div>

            {/* Métricas clave dinámicas */}
            <div className="stats-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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

            {/* Sección de Gráficos */}
            <div className="bg-gray-50 p-6 rounded-lg">
              {/* Panel superior: PEA por sexo */}
              <div className="mb-8">
                <h3 className="text-lg font-600 text-gray-800 mb-4 flex items-center gap-2">
                  Tasa de participación laboral (PEA) por sexo (%)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={processedData} syncId="timelineSync">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="year"
                      stroke="#666"
                      fontSize={12}
                      interval={0}
                      padding={{ left: 10, right: 10 }} // <-- Añade espacio a los extremos
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={12}
                      label={{ value: 'PEA (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="participationRateMale"
                      fill="#60a5fa"
                      name="PEA Masculina (%)"
                      opacity={0.7}
                    />
                    <Bar
                      dataKey="participationRateFemale"
                      fill="#a78bfa"
                      name="PEA Femenina (%)"
                      opacity={0.7}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Panel inferior: Salarios por sexo */}
              <div>
                <h3 className="text-lg font-600 text-gray-800 mb-4 flex items-center gap-2">
                  Salarios promedio por sexo (USD)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={processedData} syncId="timelineSync">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="year"
                      stroke="#666"
                      fontSize={12}
                      interval={0}
                      padding={{ left: 10, right: 10 }} // <-- Añade espacio a los extremos
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
                      stroke="#2563eb"
                      strokeWidth={3}
                      name="Salario Masculino"
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="salaryFemale"
                      stroke="#e11d48"
                      strokeWidth={3}
                      name="Salario Femenino"
                      dot={{ fill: '#e11d48', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slider de intervalo de años debajo de los gráficos */}
            <div className="flex flex-col items-center w-full mt-6 mb-6">
              <label className="text-xs text-gray-500 mb-1 text-center">
                Rango de años:
              </label>
              <div className="flex justify-center w-full">
                <div className="flex items-center gap-2" style={{ width: 260 }}>
                  <span className="text-xs text-blue-700 font-semibold">{selectedYearRange.start}</span>
                  <Range
                    step={1}
                    min={0}
                    max={availableYearsArray.length - 1}
                    values={sliderValues}
                    onChange={handleSliderChange}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: 4,
                          width: '100%',
                          background: 'linear-gradient(90deg,#fed7aa 0%,#ea580c 100%)',
                          borderRadius: 8,
                        }}
                      >{children}</div>
                    )}
                    renderThumb={({ props }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: 14,
                          width: 14,
                          backgroundColor: '#ea580c',
                          borderRadius: '50%',
                          border: '2px solid #fff',
                        }}
                      />
                    )}
                  />
                  <span className="text-xs text-blue-700 font-semibold">{selectedYearRange.end}</span>
                </div>
              </div>
            </div>

            {/* Panel de información */}
            <div className="bg-white border border-gray-200 rounded-xl mt-8 shadow-sm">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowInfoPanel((prev) => !prev)}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm"
                  style={{
                    backgroundColor: '#fff5f0',
                    borderColor: '#fed7aa',
                    color: '#ea580c',
                    margin: '0 auto', // centra el botón
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                  aria-label="Mostrar información del análisis"
                >
                  <div className="p-2 bg-orange-100 rounded-full">
                    <HiOutlineInformationCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-orange-800">Información del análisis</h3>
                    <p className="text-sm text-orange-600 mt-1">
                      {showInfoPanel ? 'Haz clic para ocultar conceptos y definiciones' : 'Haz clic para ver conceptos y definiciones'}
                    </p>
                  </div>
                  <div className="text-orange-600">
                    <HiChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${showInfoPanel ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
              </div>
              {showInfoPanel && (
                <div className="mt-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-1">Población Económicamente Activa (PEA)</h4>
                          <p className="text-orange-700">
                            Comprende a todas las personas de 15 años y más que participan en la fuerza laboral, ya sea trabajando o buscando trabajo activamente.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-1">Brecha de PEA</h4>
                          <p className="text-orange-700">
                            Diferencia entre la tasa de participación laboral masculina y femenina, indicando disparidades en el acceso al mercado laboral.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-1">Brecha Salarial</h4>
                          <p className="text-orange-700">
                            Diferencia entre los salarios promedio de hombres y mujeres, reflejando desigualdades en la remuneración.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineComparison;
