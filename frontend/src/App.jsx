import React, { useState } from 'react';
import { HiOutlineBriefcase, HiOutlineGlobeAlt, HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineCollection } from 'react-icons/hi';

// Import custom hooks
import { useDataLoader } from './hooks/useDataLoader';
import { useProcesadorDatos } from './hooks/useProcesadorDatos';
import { useDatosGraficosEspecializados } from './hooks/useDatosGraficosEspecializados';
import { PantallaCarga, PantallaError } from './components/ui/EstadosPantalla';
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

          <div className="section-divider"></div>

          {/* Additional Charts */}
          <div className="section-spacing slide-up">
            <ContenedorGraficos 
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
