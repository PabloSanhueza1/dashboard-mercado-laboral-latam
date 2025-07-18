import React from 'react';
import { HiOutlineBriefcase, HiOutlineGlobeAlt, HiOutlineChartBar } from 'react-icons/hi';

// Import custom hooks
import { useDataLoader } from './hooks/useDataLoader';
import { useDatosGraficosEspecializados } from './hooks/useDatosGraficosEspecializados';
import { PantallaCarga, PantallaError } from './components/ui/EstadosPantalla';
import ContenedorGraficos from './components/charts/ContenedorGraficos';

const Dashboard = () => {
  // Use custom hook for data loading (including informal employment data)
  const {
    employmentData,
    unemploymentData,
    informalEmploymentData,
    loading,
    error,
    datasets
  } = useDataLoader();

  // Get specialized chart data including informal employment map
  const { informalEmploymentMapData } = useDatosGraficosEspecializados({
    employmentData,
    unemploymentData,
    informalEmploymentData,
    laborForceData: [],
    salaryData: []
  });

  // Obtener lista de países disponibles para mostrar información
  const availableCountries = React.useMemo(() => {
    if (!informalEmploymentData || informalEmploymentData.length === 0) return [];
    return [...new Set(informalEmploymentData.map(row => row.country))].sort();
  }, [informalEmploymentData]);

  if (loading) {
    return <PantallaCarga />;
  }

  if (error) {
    return <PantallaError error={error} />;
  }

  return (
    <div className=" min-h-screen bg-gradient-to-br from-orange-400 to-yellow-200">
      <div >
        {/* Header Section */}
        <div className="dashboard-header flex justify-center">
          <div
            style={{
              maxWidth: 600,
              width: '100%',
              margin: '2rem auto 1.5rem auto',
              background: 'linear-gradient(90deg, #fff 85%, #fff7ed 100%)',
              borderRadius: '16px',
              boxShadow: '0 2px 16px rgba(251, 191, 36, 0.10)',
              padding: '1.5rem 2rem 1.25rem 2rem',
              border: '1.5px solid #fbbf24',
              minHeight: 80,
              display: 'block',
              position: 'relative',
            }}
          >
            <h1
              className="text-xl font-extrabold"
              style={{
                color: '#b45309',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              Dashboard Mercado Laboral
            </h1>
            <div
              className="text-base"
              style={{
                color: '#b45309',
                marginBottom: 8,
                textAlign: 'center'
              }}
            >
              Análisis Integral de Empleo en Sudamérica
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main flex justify-center">
          {/* Contenedor de gráficos centrado y con ancho máximo */}
          <div
            className="section-spacing slide-up"
            style={{
              maxWidth: 1200, // aumentado el ancho máximo
              width: '100%',
              margin: '0 auto',
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              padding: '2.5rem 2rem',
              border: '1px solid #e5e7eb',
              minHeight: 400,
            }}
          >
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

// Si agregas botones aquí, usa:
// style={{
//   backgroundColor: selected ? '#fde68a' : '#fff',
//   color: selected ? '#b45309' : '#ea580c',
//   border: selected ? '2px solid #ea580c' : '1px solid #fde68a',
//   ...otros estilos
// }}
