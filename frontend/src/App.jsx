import React, { useState } from 'react';
import { HiOutlineBriefcase, HiOutlineGlobeAlt, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineCollection } from 'react-icons/hi';

// Import custom hooks
import { useDataLoader } from './hooks/useDataLoader';
import { useProcesadorDatos } from './hooks/useProcesadorDatos';
import { useEstadisticasResumen } from './hooks/useEstadisticasResumen';
import { useDatosGraficosEspecializados } from './hooks/useDatosGraficosEspecializados';

// Import components
import { PantallaCarga, PantallaError } from './components/ui/EstadosPantalla';
import EncabezadoDashboard from './components/layout/EncabezadoDashboard';
import FiltrosPaises from './components/filtros/FiltrosPaises';
import ResumenEstadisticas from './components/estadisticas/ResumenEstadisticas';
import GraficoPrincipal from './components/charts/GraficoPrincipal';
import ContenedorGraficos from './components/charts/ContenedorGraficos';

const Dashboard = () => {
  // Use custom hook for data loading (including informal employment data)
  const {
    employmentData,
    unemploymentData,
    informalEmploymentData,
    availableCountries,
    availableYears,
    availableSexOptions,
    availableAgeGroups,
    loading,
    error,
    datasets
  } = useDataLoader();

  // Local state - valores por defecto sin filtros avanzados
  const [selectedCountries, setSelectedCountries] = useState(['Chile', 'Argentina', 'Brazil', 'Colombia', 'Peru']);
  const selectedSex = 'Total';
  const selectedAgeGroup = '15+';
  const selectedYearRange = [2015, 2024];
  
  const activeCharts = {
    timeSeries: true,
    comparison: true,
    distribution: true,
    informalMap: true
  };

  // Single dataset configuration for employment data
  const datasetsWithIcons = {
    employment: { 
      ...datasets.employment, 
      icon: HiOutlineBriefcase,
      title: 'Tasa de Empleo',
      unit: '%',
      color: '#3B82F6'
    }
  };

  // Use custom hooks for data processing
  const { chartData } = useProcesadorDatos({
    activeDataset: 'employment',
    selectedSex,
    selectedYearRange,
    selectedCountries,
    selectedAgeGroup,
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData: [],
    salaryData: []
  });

  // Get specialized chart data including informal employment map
  const { informalEmploymentMapData } = useDatosGraficosEspecializados({
    selectedCountries,
    selectedSex,
    selectedAgeGroup,
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData: [],
    salaryData: []
  });

  const summaryStats = useEstadisticasResumen({
    chartData,
    selectedCountries,
    datasets: datasetsWithIcons,
    activeDataset: 'employment'
  });

  const handleCountryToggle = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  if (loading) {
    return <PantallaCarga />;
  }

  if (error) {
    return <PantallaError error={error} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content fade-in">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-16 backdrop-blur">
                <HiOutlineGlobeAlt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-800 text-white">
                  Dashboard Mercado Laboral
                </h1>
                <p className="text-blue-100 text-lg mt-2">
                  Análisis Integral de Empleo en Sudamérica
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-6 text-blue-100">
              <div className="flex items-center gap-2">
                <HiOutlineChartBar className="w-5 h-5" />
                <span className="text-sm">Datos actualizados 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineBriefcase className="w-5 h-5" />
                <span className="text-sm">{availableCountries.length} países</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Country Selection */}
          <div className="section-spacing-large">
            <div className="glass-card p-8 slide-up">
              <FiltrosPaises 
                availableCountries={availableCountries}
                selectedCountries={selectedCountries}
                setSelectedCountries={setSelectedCountries}
                handleCountryToggle={handleCountryToggle}
              />
            </div>
          </div>

          <div className="section-divider"></div>

          {/* Statistics Overview */}
          <div className="section-spacing-large slide-up">
            <div className="filter-header">
              <h2 className="filter-title">
                <HiOutlineTrendingUp className="text-green-600" />
                Resumen Estadístico
              </h2>
              <p className="filter-subtitle">
                Métricas clave del análisis actual
              </p>
            </div>
            <ResumenEstadisticas 
              selectedCountries={selectedCountries}
              datasetsWithIcons={datasetsWithIcons}
              activeDataset="employment"
              chartData={chartData}
              selectedYearRange={selectedYearRange}
              summaryStats={summaryStats}
            />
          </div>

          <div className="section-divider"></div>

          {/* Main Chart */}
          <div className="section-spacing-large slide-up">
            <GraficoPrincipal 
              chartData={chartData}
              selectedCountries={selectedCountries}
              datasetsWithIcons={datasetsWithIcons}
              activeDataset="employment"
            />
          </div>

          <div className="section-divider"></div>

          {/* Additional Charts */}
          <div className="section-spacing slide-up">
            <div className="filter-header">
              <h2 className="filter-title">
                <HiOutlineCollection className="text-purple-600" />
                Análisis Detallado
              </h2>
              <p className="filter-subtitle">
                Visualizaciones complementarias y análisis especializado
              </p>
            </div>
            <ContenedorGraficos 
              activeCharts={activeCharts}
              chartData={chartData}
              selectedCountries={selectedCountries}
              datasetsWithIcons={datasetsWithIcons}
              activeDataset="employment"
              selectedSex={selectedSex}
              selectedAgeGroup={selectedAgeGroup}
              informalEmploymentMapData={informalEmploymentMapData}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
