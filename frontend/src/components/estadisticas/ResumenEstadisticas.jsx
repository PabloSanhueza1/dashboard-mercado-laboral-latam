import React from 'react';
import { 
  HiOutlineGlobe, HiOutlineTrendingUp, HiOutlineChartBar,
  HiOutlineCollection, HiOutlineCalendar 
} from 'react-icons/hi';
import StatCard from '../ui/StatCard';

const ResumenEstadisticas = ({
  selectedCountries,
  datasetsWithIcons,
  activeDataset,
  chartData,
  selectedYearRange,
  summaryStats
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <StatCard 
        title="Países Seleccionados" 
        value={selectedCountries.length} 
        icon={HiOutlineGlobe} 
        color="blue" 
      />
      <StatCard 
        title={`Promedio ${datasetsWithIcons[activeDataset].title}`} 
        value={summaryStats.latestAvg} 
        icon={HiOutlineTrendingUp} 
        color="green" 
      />
      <StatCard 
        title="Tendencia Anual" 
        value={summaryStats.trend} 
        icon={HiOutlineChartBar} 
        color="purple" 
      />
      <StatCard 
        title="Puntos de Datos" 
        value={summaryStats.dataPoints} 
        icon={HiOutlineCollection} 
        color="orange" 
      />
      <StatCard 
        title="Rango de Años" 
        value={summaryStats.yearRange} 
        icon={HiOutlineCalendar} 
        color="indigo" 
      />
    </div>
  );
};

export default ResumenEstadisticas;
