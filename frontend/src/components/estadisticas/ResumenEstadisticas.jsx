import React from 'react';
import { 
  HiOutlineGlobe, HiOutlineTrendingUp, HiOutlineChartBar,
  HiOutlineCollection, HiOutlineCalendar 
} from 'react-icons/hi';

// StatCard reutilizable
export const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
    green: 'from-green-500 to-green-600 bg-green-50 text-green-600 border-green-200',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-600 border-orange-200',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className="stat-card group relative bg-white bg-opacity-80 rounded-xl border p-5 shadow hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ').slice(2).join(' ')} border transition-all duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
            parseFloat(trend) > 0 ? 'bg-green-100 text-green-600' : parseFloat(trend) < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {parseFloat(trend) > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div>
        <div className="stat-value text-2xl font-bold text-gray-800">{value}</div>
        <div className="stat-label text-gray-500">{title}</div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color].split(' ').slice(0, 2).join(' ')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};

const ResumenEstadisticas = ({
  selectedCountries,
  datasetsWithIcons,
  activeDataset,
  chartData,
  selectedYearRange,
  summaryStats
}) => {
  return (
    <div className="stats-grid grid grid-cols-2 md:grid-cols-5 gap-4">
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
        trend={summaryStats.trend !== 'N/A' ? parseFloat(summaryStats.trend) : undefined}
      />
      <StatCard 
        title="Tendencia Anual" 
        value={summaryStats.trend} 
        icon={HiOutlineChartBar} 
        color="purple"
        trend={summaryStats.trend !== 'N/A' ? parseFloat(summaryStats.trend) : undefined}
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
