import React from 'react';
import TrendAreaChart from '../charts/AreaChart';
import DistributionCharts from '../charts/DistributionCharts';
import CombinedAnalysisChart from '../charts/ComposedChart';
import FinalPieChart from '../charts/PieChart';
import MapaCoropleticoEmpleoInformal from './MapaCoropleticoEmpleoInformal';

const ContenedorGraficos = ({
  activeCharts,
  chartData,
  selectedCountries,
  datasetsWithIcons,
  activeDataset,
  selectedSex,
  selectedAgeGroup,
  informalEmploymentMapData,
  loading,
  error
}) => {
  return (
    <>
      {/* Mapa Coroplético de Empleo Informal */}
      {activeCharts.informalMap && (
        <MapaCoropleticoEmpleoInformal 
          data={informalEmploymentMapData}
          loading={loading}
          error={error}
        />
      )}

      {/* Gráfico de Área de Tendencia */}
      {activeCharts.timeSeries && (
        <TrendAreaChart 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasets={datasetsWithIcons}
          activeDataset={activeDataset}
        />
      )}

      {/* Gráfico de Análisis Combinado */}
      {activeCharts.comparison && (
        <CombinedAnalysisChart 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasets={datasetsWithIcons}
          activeDataset={activeDataset}
        />
      )}

      {/* Gráficos de Distribución */}
      {activeCharts.distribution && (
        <DistributionCharts 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasets={datasetsWithIcons}
          activeDataset={activeDataset}
        />
      )}

      {/* Gráfico de Pastel Final */}
      <FinalPieChart 
        chartData={chartData}
        selectedCountries={selectedCountries}
        datasets={datasetsWithIcons}
        activeDataset={activeDataset}
      />
    </>
  );
};

export default ContenedorGraficos;