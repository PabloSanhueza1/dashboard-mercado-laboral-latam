import { useMemo } from 'react';

/**
 * Hook personalizado para procesar y filtrar datos del dashboard
 */
export const useProcesadorDatos = ({
  activeDataset,
  selectedSex,
  selectedYearRange,
  selectedCountries,
  selectedAgeGroup,
  employmentData,
  unemploymentData,
  informalEmploymentData,
  laborForceData,
  salaryData
}) => {
  // Función para obtener datos filtrados del dataset activo
  const getFilteredActiveData = () => {
    let data = [];
    switch (activeDataset) {
      case 'employment': data = employmentData; break;
      case 'unemployment': data = unemploymentData; break;
      case 'informal': data = informalEmploymentData; break;
      case 'laborForce': data = laborForceData; break;
      case 'salary': data = salaryData; break;
      default: data = [];
    }

    return data.filter(row => {
      const matchesSex = selectedSex === 'Total' || row.sex === selectedSex;
      const matchesYear = row.year >= selectedYearRange[0] && row.year <= selectedYearRange[1];
      const matchesCountry = selectedCountries.some(country => row.country.includes(country));
      
      let matchesAge = true;
      if (activeDataset !== 'salary' && row.ageGroup) {
        if (selectedAgeGroup === '15+') {
          matchesAge = row.ageGroup.includes('15+');
        } else if (selectedAgeGroup === '15-64') {
          matchesAge = row.ageGroup.includes('15-64');
        } else if (selectedAgeGroup === '15-24') {
          matchesAge = row.ageGroup.includes('15-24');
        } else if (selectedAgeGroup === '25+') {
          matchesAge = row.ageGroup.includes('25+');
        }
      }
      
      return matchesSex && matchesYear && matchesCountry && matchesAge;
    });
  };

  // Datos procesados para gráficos principales
  const chartData = useMemo(() => {
    const activeData = getFilteredActiveData();
    if (activeData.length === 0 || selectedCountries.length === 0) return [];

    const dataByYear = activeData
      .reduce((acc, row) => {
        const simplifiedCountry = selectedCountries.find(country => row.country.includes(country)) || row.country;
        acc[row.year] = { ...acc[row.year], year: row.year, [simplifiedCountry]: row.value };
        return acc;
      }, {});

    return Object.values(dataByYear).sort((a, b) => a.year - b.year);
  }, [selectedCountries, activeDataset, selectedSex, selectedAgeGroup, selectedYearRange, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  return {
    chartData,
    getFilteredActiveData
  };
};
