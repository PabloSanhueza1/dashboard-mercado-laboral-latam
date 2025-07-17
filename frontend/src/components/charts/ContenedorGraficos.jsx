import React from 'react';
import MapaCoropleticoEmpleoInformal from './MapaCoropleticoEmpleoInformal';
import GraficoBarrasSalarios from './GraficoBarrasSalarios';
import DotPlotParticipacionLaboral from './DotPlotParticipacionLaboral';
import InformalityAnalysis from './InformalityAnalysis';
import TimelineComparison from './TimelineComparison';

const ContenedorGraficos = ({
  informalEmploymentMapData,
  loading,
  error
}) => {
  return (
    <div className="space-y-8">
      {/* Mapa Coroplético de Empleo Informal */}
      <MapaCoropleticoEmpleoInformal
        data={informalEmploymentMapData}
        loading={loading}
        error={error}
      />

      {/* Gráfico de Barras - Salario Mínimo vs Ingreso Promedio */}
      <GraficoBarrasSalarios />

      {/* Dot Plot - Participación Laboral por Género */}
      <DotPlotParticipacionLaboral />

      {/* Análisis de Informalidad */}
      <InformalityAnalysis />

      {/* Comparación de Líneas de Tiempo */}
      <TimelineComparison />

    </div>
  );
};

export default ContenedorGraficos;