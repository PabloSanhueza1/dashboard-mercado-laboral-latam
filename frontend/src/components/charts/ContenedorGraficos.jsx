import React from 'react';
import MapaCoropleticoEmpleoInformal from './MapaCoropleticoEmpleoInformal';

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

    </>
  );
};

export default ContenedorGraficos;