import React, { useState } from 'react';
import { HiOutlineBriefcase } from 'react-icons/hi';

// Import custom hooks
import { useDataLoader } from './hooks/useDataLoader';
import { useProcesadorDatos } from './hooks/useProcesadorDatos';
import { useEstadisticasResumen } from './hooks/useEstadisticasResumen';
import { useDatosGraficosEspecializados } from './hooks/useDatosGraficosEspecializados';

// Import components
import { PantallaCarga, PantallaError } from './components/ui/EstadosPantalla';
import EncabezadoDashboard from './components/layout/EncabezadoDashboard';
import FiltrosAvanzados from './components/filtros/FiltrosAvanzados';
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

  // Local state
  const [selectedCountries, setSelectedCountries] = useState(['Chile', 'Argentina', 'Brazil', 'Colombia', 'Peru']);
  const [selectedSex, setSelectedSex] = useState('Total');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('15+');
  const [selectedYearRange, setSelectedYearRange] = useState([2015, 2024]);
  
  const [activeCharts, setActiveCharts] = useState({
    timeSeries: true,
    comparison: true,
    distribution: true,
    informalMap: true
  });

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
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <EncabezadoDashboard />

        {/* Filtros Avanzados */}
        <FiltrosAvanzados 
          selectedSex={selectedSex}
          setSelectedSex={setSelectedSex}
          selectedAgeGroup={selectedAgeGroup}
          setSelectedAgeGroup={setSelectedAgeGroup}
          selectedYearRange={selectedYearRange}
          setSelectedYearRange={setSelectedYearRange}
          activeCharts={activeCharts}
          setActiveCharts={setActiveCharts}
          availableSexOptions={availableSexOptions}
          availableAgeGroups={availableAgeGroups}
          availableYears={availableYears}
          activeDataset="employment"
        />

        {/* Filtros de Países */}
        <FiltrosPaises 
          availableCountries={availableCountries}
          selectedCountries={selectedCountries}
          setSelectedCountries={setSelectedCountries}
          handleCountryToggle={handleCountryToggle}
        />

        {/* Resumen de Estadísticas */}
        <ResumenEstadisticas 
          selectedCountries={selectedCountries}
          datasetsWithIcons={datasetsWithIcons}
          activeDataset="employment"
          chartData={chartData}
          selectedYearRange={selectedYearRange}
          summaryStats={summaryStats}
        />

        {/* Gráfico Principal */}
        <GraficoPrincipal 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasetsWithIcons={datasetsWithIcons}
          activeDataset="employment"
        />

        {/* Contenedor de Gráficos */}
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
  );
};

export default Dashboard;
