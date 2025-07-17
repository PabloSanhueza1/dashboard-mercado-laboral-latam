import { useMemo } from 'react';

/**
 * Hook personalizado para procesar datos del dashboard
 */
export const useProcesadorDatos = ({
  activeDataset,
  employmentData,
  unemploymentData,
  informalEmploymentData,
  laborForceData,
  salaryData
}) => {
  // Función para obtener datos del dataset activo
  const getActiveData = () => {
    switch (activeDataset) {
      case 'employment': return employmentData;
      case 'unemployment': return unemploymentData;
      case 'informal': return informalEmploymentData;
      case 'laborForce': return laborForceData;
      case 'salary': return salaryData;
      default: return [];
    }
  };

  // Datos procesados para gráficos principales
  const chartData = useMemo(() => {
    const activeData = getActiveData();
    if (activeData.length === 0) return [];

    // Procesar datos por año sin filtros
    const dataByYear = activeData
      .reduce((acc, row) => {
        acc[row.year] = { ...acc[row.year], year: row.year, [row.country]: row.value };
        return acc;
      }, {});

    return Object.values(dataByYear).sort((a, b) => a.year - b.year);
  }, [activeDataset, employmentData, unemploymentData, informalEmploymentData, laborForceData, salaryData]);

  return {
    chartData,
    getActiveData
  };
};