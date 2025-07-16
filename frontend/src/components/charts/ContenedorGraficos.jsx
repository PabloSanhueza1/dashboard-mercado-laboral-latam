import React from 'react';
import MapaCoropleticoEmpleoInformal from './MapaCoropleticoEmpleoInformal';
import GraficoBarrasSalarios from './GraficoBarrasSalarios';

const ContenedorGraficos = ({
  informalEmploymentMapData,
  loading,
  error
}) => {
  return (
    <>
      {/* Mapa Coroplético de Empleo Informal */}
      <MapaCoropleticoEmpleoInformal 
        data={informalEmploymentMapData}
        loading={loading}
        error={error}
      />

      {/* Gráfico de Barras - Salario Mínimo vs Ingreso Promedio */}
      <div className="mt-8">
        <GraficoBarrasSalarios />
      </div>
    </>
  );
};

export default ContenedorGraficos;