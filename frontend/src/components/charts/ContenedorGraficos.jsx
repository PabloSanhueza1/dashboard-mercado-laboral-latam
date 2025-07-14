import React from 'react';
import TrendAreaChart from '../charts/AreaChart';
import CorrelationScatterChart from '../charts/ScatterChart';
import MultiDimensionalRadarChart from '../charts/RadarChart';
import CombinedAnalysisChart from '../charts/ComposedChart';
import DistributionCharts from '../charts/DistributionCharts';
import MultiIndicatorChart from '../charts/ComparisonChart';
import FinalPieChart from '../charts/PieChart';

const ContenedorGraficos = ({
  activeCharts,
  chartData,
  selectedCountries,
  datasetsWithIcons,
  activeDataset,
  selectedSex,
  selectedAgeGroup,
  scatterData,
  radarData
}) => {
  return (
    <>
      {/* Gráfico de Área de Tendencia */}
      {activeCharts.timeSeries && (
        <TrendAreaChart 
          chartData={chartData}
          selectedCountries={selectedCountries}
          datasets={datasetsWithIcons}
          activeDataset={activeDataset}
        />
      )}

      {/* Gráfico de Dispersión de Correlación */}
      {activeCharts.scatter && (
        <CorrelationScatterChart 
          scatterData={scatterData}
          selectedSex={selectedSex}
          selectedAgeGroup={selectedAgeGroup}
        />
      )}

      {/* Gráfico Radar Multidimensional */}
      {activeCharts.radar && (
        <MultiDimensionalRadarChart 
          radarData={radarData}
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

      {/* Gráfico de Múltiples Indicadores */}
      <MultiIndicatorChart 
        comparisonData={[]} // Necesitarás computar esto
        datasets={datasetsWithIcons}
      />

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
