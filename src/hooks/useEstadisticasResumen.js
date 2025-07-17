import { useMemo } from 'react';

/**
 * Hook personalizado para calcular estadísticas resumidas del dashboard
 */
export const useEstadisticasResumen = ({
  chartData,
  selectedCountries,
  datasets,
  activeDataset
}) => {
  const summaryStats = useMemo(() => {
    if (chartData.length === 0 || selectedCountries.length === 0) {
      return { 
        latestAvg: 'N/A', 
        yearRange: 'N/A', 
        totalCountries: 0,
        dataPoints: 0,
        trend: 'N/A'
      };
    }
    
    let totalSum = 0;
    let totalCount = 0;
    const latestYearData = chartData[chartData.length - 1] || {};
    const previousYearData = chartData[chartData.length - 2] || {};

    selectedCountries.forEach(country => {
      if (latestYearData[country] !== undefined) {
        totalSum += latestYearData[country];
        totalCount++;
      }
    });

    // Calcular tendencia
    let trend = 'N/A';
    if (totalCount > 0 && Object.keys(previousYearData).length > 0) {
      let prevSum = 0;
      let prevCount = 0;
      selectedCountries.forEach(country => {
        if (previousYearData[country] !== undefined) {
          prevSum += previousYearData[country];
          prevCount++;
        }
      });
      
      if (prevCount > 0) {
        const currentAvg = totalSum / totalCount;
        const prevAvg = prevSum / prevCount;
        const change = ((currentAvg - prevAvg) / prevAvg) * 100;
        trend = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
      }
    }

    return {
      latestAvg: totalCount > 0 ? `${(totalSum / totalCount).toFixed(2)}${datasets[activeDataset].unit}` : 'N/A',
      yearRange: chartData.length > 0 ? `${chartData[0].year} - ${chartData[chartData.length - 1].year}` : 'N/A',
      totalCountries: selectedCountries.length,
      dataPoints: chartData.length * selectedCountries.length,
      trend: trend
    };
  }, [chartData, selectedCountries, activeDataset, datasets]);

  return summaryStats;
};
