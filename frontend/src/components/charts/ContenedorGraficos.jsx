import React from 'react';
import MapaCoropleticoEmpleoInformal from './MapaCoropleticoEmpleoInformal';
import GraficoBarrasSalarios from './GraficoBarrasSalarios';
import BubblePlotBrechaSalarial from './BubblePlotBrechaSalarial';

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

      <BubblePlotBrechaSalarial/>
    </div>
  );
};

export default ContenedorGraficos;