import { useMemo } from 'react';

/**
 * Hook personalizado para generar datos específicos para gráficos especializados
 */
export const useDatosGraficosEspecializados = ({
  selectedCountries,
  selectedSex,
  selectedAgeGroup,
  employmentData,
  unemploymentData,
  informalEmploymentData,
  laborForceData,
  salaryData
}) => {
  // Datos para análisis de correlación (scatter plot)
  const scatterData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    const getLatestData = (dataset, dataType) => {
      return dataset
        .filter(row => {
          const matchesSex = selectedSex === 'Total' || row.sex === selectedSex;
          const matchesCountry = selectedCountries.some(country => row.country.includes(country));
          let matchesAge = true;
          if (dataType !== 'salary' && row.ageGroup) {
            matchesAge = row.ageGroup.includes(selectedAgeGroup);
          }
          return matchesSex && matchesCountry && matchesAge;
        })
        .sort((a, b) => b.year - a.year);
    };

    const latestEmployment = getLatestData(employmentData, 'employment');
    const latestUnemployment = getLatestData(unemploymentData, 'unemployment');
    
    const scatterPoints = [];
    selectedCountries.forEach(country => {
      const empData = latestEmployment.find(row => row.country.includes(country));
      const unempData = latestUnemployment.find(row => row.country.includes(country));
      
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
  }, [selectedCountries, selectedSex, selectedAgeGroup, employmentData, unemploymentData]);

  // Datos para gráfico radar (comparación multidimensional)
  const radarData = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    
    const getLatestValue = (dataset, country, dataType) => {
      const countryData = dataset.filter(row => {
        const matchesSex = selectedSex === 'Total' || row.sex === selectedSex;
        const matchesCountry = row.country.includes(country);
        let matchesAge = true;
        if (dataType !== 'salary' && row.ageGroup) {
          matchesAge = row.ageGroup.includes(selectedAgeGroup);
        }
        return matchesSex && matchesCountry && matchesAge;
      }).sort((a, b) => b.year - a.year);
      
      return countryData.length > 0 ? countryData[0].value : 0;
    };

    return selectedCountries.slice(0, 3).map(country => ({
      country: country,
      employment: getLatestValue(employmentData, country, 'employment'),
      unemployment: getLatestValue(unemploymentData, country, 'unemployment'),
      informal: getLatestValue(informalEmploymentData, country, 'informal'),
      laborForce: getLatestValue(laborForceData, country, 'laborForce'),
      salary: getLatestValue(salaryData, country, 'salary') / 100 // Escalar para visualización
    }));
  }, [selectedCountries, selectedSex, selectedAgeGroup, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  return {
    scatterData,
    radarData
  };
};
