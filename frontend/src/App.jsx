import React, { useState } from 'react';
import { 
  HiOutlineBriefcase, HiOutlineChartBar, HiOutlineUsers, 
  HiOutlineGlobe, HiOutlineCurrencyDollar
} from 'react-icons/hi';

// Import custom hooks
import { useDataLoader } from './hooks/useDataLoader';
import { useProcesadorDatos } from './hooks/useProcesadorDatos';
import { useDatosGraficosEspecializados } from './hooks/useDatosGraficosEspecializados';
import { useEstadisticasResumen } from './hooks/useEstadisticasResumen';

// Import components
import { PantallaCarga, PantallaError } from './components/ui/EstadosPantalla';
import EncabezadoDashboard from './components/layout/EncabezadoDashboard';
import SelectorDataset from './components/filtros/SelectorDataset';
import FiltrosAvanzados from './components/filtros/FiltrosAvanzados';
import FiltrosPaises from './components/filtros/FiltrosPaises';
import ResumenEstadisticas from './components/estadisticas/ResumenEstadisticas';
import GraficoPrincipal from './components/charts/GraficoPrincipal';
import ContenedorGraficos from './components/charts/ContenedorGraficos';

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

  // Use custom hooks for data processing
  const { chartData } = useProcesadorDatos({
    activeDataset,
    selectedSex,
    selectedYearRange,
    selectedCountries,
    selectedAgeGroup,
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData,
    salaryData
  });

  const { scatterData, radarData } = useDatosGraficosEspecializados({
    selectedCountries,
    selectedSex,
    selectedAgeGroup,
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData,
    salaryData
  });

  const summaryStats = useEstadisticasResumen({
    chartData,
    selectedCountries,
    datasets,
    activeDataset
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

        {/* Selector de Dataset */}
        <SelectorDataset 
          datasetsWithIcons={datasetsWithIcons}
          activeDataset={activeDataset}
          setActiveDataset={setActiveDataset}
        />

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
          activeDataset={activeDataset}
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
          activeDataset={activeDataset}
          chartData={chartData}
          selectedYearRange={selectedYearRange}
          summaryStats={summaryStats}
        />

        {/* Gráfico Principal */}
        <GraficoPrincipal 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasetsWithIcons={datasetsWithIcons}
          activeDataset={activeDataset}
        />

        {/* Contenedor de Gráficos */}
        <ContenedorGraficos 
          activeCharts={activeCharts}
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasetsWithIcons={datasetsWithIcons}
          activeDataset={activeDataset}
          selectedSex={selectedSex}
          selectedAgeGroup={selectedAgeGroup}
          scatterData={scatterData}
          radarData={radarData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
