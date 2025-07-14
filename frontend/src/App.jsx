import React, { useState, useMemo } from 'react';
import { 
  HiOutlineFilter, HiOutlineXCircle, HiOutlineCheckCircle, 
  HiOutlineTrendingUp, HiOutlineCalendar, HiOutlineGlobe, HiOutlineCurrencyDollar,
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineChartBar,
  HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineClock, HiOutlineSparkles,
  HiOutlineCollection
} from 'react-icons/hi';

// Import custom hooks and components
import { useDataLoader } from './hooks/useDataLoader';
import StatCard from './components/ui/StatCard';
import TimeSeriesChart from './components/charts/TimeSeriesChart';
import TrendAreaChart from './components/charts/AreaChart';
import CorrelationScatterChart from './components/charts/ScatterChart';
import MultiDimensionalRadarChart from './components/charts/RadarChart';
import CombinedAnalysisChart from './components/charts/ComposedChart';
import DistributionCharts from './components/charts/DistributionCharts';
import MultiIndicatorChart from './components/charts/ComparisonChart';
import FinalPieChart from './components/charts/PieChart';

const Dashboard = () => {
  // Use custom hook for data loading
  const {
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData,
    salaryData,
    availableCountries,
    availableYears,
    availableSexOptions,
    availableAgeGroups,
    loading,
    error,
    datasets
  } = useDataLoader();

  // Local state
  const [selectedCountries, setSelectedCountries] = useState(['Chile', 'Argentina', 'Brazil', 'Colombia', 'Peru']);
  const [activeDataset, setActiveDataset] = useState('employment');
  const [selectedSex, setSelectedSex] = useState('Total');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('15+');
  const [selectedYearRange, setSelectedYearRange] = useState([2015, 2024]);
  
  const [activeCharts, setActiveCharts] = useState({
    timeSeries: true,
    comparison: true,
    distribution: true,
    scatter: true,
    radar: true
  });

  // Add icons to datasets
  const datasetsWithIcons = {
    ...datasets,
    employment: { ...datasets.employment, icon: HiOutlineBriefcase },
    unemployment: { ...datasets.unemployment, icon: HiOutlineChartBar },
    informal: { ...datasets.informal, icon: HiOutlineUsers },
    laborForce: { ...datasets.laborForce, icon: HiOutlineGlobe },
    salary: { ...datasets.salary, icon: HiOutlineCurrencyDollar }
  };

  // Data processing functions
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

  // Memoized data calculations
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

        {/* Dataset Selector */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
            <HiOutlineChartBar className="mr-2" />
            Selecciona el Indicador a Visualizar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(datasetsWithIcons).map(([key, dataset]) => {
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

        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-6">
            <HiOutlineSparkles className="mr-2" />
            Filtros Avanzados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sex Filter */}
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

            {/* Age Group Filter */}
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

            {/* Year Range Filter */}
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

            {/* Chart Selector */}
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

        {/* Country Filters */}
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

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            title="Países Seleccionados" 
            value={selectedCountries.length} 
            icon={HiOutlineGlobe} 
            color="blue" 
          />
          <StatCard 
            title={`Promedio ${datasetsWithIcons[activeDataset].title}`} 
            value="N/A" 
            icon={HiOutlineTrendingUp} 
            color="green" 
          />
          <StatCard 
            title="Tendencia Anual" 
            value="N/A" 
            icon={HiOutlineChartBar} 
            color="purple" 
          />
          <StatCard 
            title="Puntos de Datos" 
            value={chartData.length * selectedCountries.length} 
            icon={HiOutlineCollection} 
            color="orange" 
          />
          <StatCard 
            title="Rango de Años" 
            value={`${selectedYearRange[0]} - ${selectedYearRange[1]}`} 
            icon={HiOutlineCalendar} 
            color="indigo" 
          />
        </div>

        {/* Main Time Series Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Evolución de {datasetsWithIcons[activeDataset].title}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: datasetsWithIcons[activeDataset].color}}></span>
              {datasetsWithIcons[activeDataset].title}
            </div>
          </div>
          
          <TimeSeriesChart 
            chartData={chartData}
            selectedCountries={selectedCountries}
            datasets={datasetsWithIcons}
            activeDataset={activeDataset}
          />
        </div>

        {/* All Chart Components */}
        {activeCharts.timeSeries && (
          <TrendAreaChart 
            chartData={chartData}
            selectedCountries={selectedCountries}
            datasets={datasetsWithIcons}
            activeDataset={activeDataset}
          />
        )}

        {activeCharts.scatter && (
          <CorrelationScatterChart 
            scatterData={[]} // You'll need to compute this
            selectedSex={selectedSex}
            selectedAgeGroup={selectedAgeGroup}
          />
        )}

        {activeCharts.radar && (
          <MultiDimensionalRadarChart 
            radarData={[]} // You'll need to compute this
          />
        )}

        {activeCharts.comparison && (
          <CombinedAnalysisChart 
            chartData={chartData}
            selectedCountries={selectedCountries}
            datasets={datasetsWithIcons}
            activeDataset={activeDataset}
          />
        )}

        {activeCharts.distribution && (
          <DistributionCharts 
            chartData={chartData}
            selectedCountries={selectedCountries}
            datasets={datasetsWithIcons}
            activeDataset={activeDataset}
          />
        )}

        <MultiIndicatorChart 
          comparisonData={[]} // You'll need to compute this
          datasets={datasetsWithIcons}
        />

        <FinalPieChart 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasets={datasetsWithIcons}
          activeDataset={activeDataset}
        />
      </div>
    </div>
  );
};

export default Dashboard;
