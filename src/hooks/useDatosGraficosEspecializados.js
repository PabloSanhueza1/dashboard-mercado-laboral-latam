import { useMemo } from 'react';

/**
 * Hook personalizado para generar datos específicos para gráficos especializados
 */
export const useDatosGraficosEspecializados = ({
  employmentData,
  unemploymentData,
  informalEmploymentData,
  laborForceData,
  salaryData
}) => {
  // Datos para análisis de correlación (scatter plot)
  const scatterData = useMemo(() => {
    const getLatestData = (dataset) => {
      return dataset
        .filter(row => row.sex === 'Total') // Solo datos totales
        .sort((a, b) => b.year - a.year);
    };

    const latestEmployment = getLatestData(employmentData);
    const latestUnemployment = getLatestData(unemploymentData);
    
    const scatterPoints = [];
    const countries = [...new Set([...latestEmployment, ...latestUnemployment].map(row => row.country))];
    
    countries.forEach(country => {
      const empData = latestEmployment.find(row => row.country === country);
      const unempData = latestUnemployment.find(row => row.country === country);
      
      if (empData && unempData) {
        scatterPoints.push({
          country: country,
          employment: empData.value,
          unemployment: unempData.value,
          year: Math.max(empData.year, unempData.year)
        });
      }
    });
    
    return scatterPoints;
  }, [employmentData, unemploymentData]);

  // Datos para gráfico radar (comparación multidimensional)
  const radarData = useMemo(() => {
    const getLatestValue = (dataset, country) => {
      const countryData = dataset.filter(row => {
        return row.sex === 'Total' && row.country === country;
      }).sort((a, b) => b.year - a.year);
      
      return countryData.length > 0 ? countryData[0].value : 0;
    };

    const countries = [...new Set(employmentData.map(row => row.country))].slice(0, 3);
    
    return countries.map(country => ({
      country: country,
      employment: getLatestValue(employmentData, country),
      unemployment: getLatestValue(unemploymentData, country),
      informal: getLatestValue(informalEmploymentData, country),
      laborForce: getLatestValue(laborForceData || [], country),
      salary: getLatestValue(salaryData || [], country) / 100 // Escalar para visualización
    }));
  }, [employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  // Datos para mapa coroplético de empleo informal
  const informalEmploymentMapData = useMemo(() => {
    if (!informalEmploymentData || informalEmploymentData.length === 0) {
      console.log('No hay datos de empleo informal disponibles');
      return [];
    }
    
    // Filtrar solo datos con sexo "Total"
    const totalData = informalEmploymentData.filter(row => row.sex === 'Total');
    
    console.log('Datos de empleo informal filtrados (Total):', totalData.length);
    console.log('Muestra de datos:', totalData.slice(0, 5));
    
    // Agrupar por país y año
    const dataByCountryYear = totalData.reduce((acc, row) => {
      const key = `${row.country}-${row.year}`;
      acc[key] = row;
      return acc;
    }, {});
    
    const result = Object.values(dataByCountryYear);
    console.log('Datos procesados para mapa coroplético:', result.length);
    
    return result;
  }, [informalEmploymentData]);

  return {
    scatterData,
    radarData,
    informalEmploymentMapData
  };
};