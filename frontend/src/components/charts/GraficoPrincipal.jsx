import React from 'react';
import TimeSeriesChart from '../charts/TimeSeriesChart';

const GraficoPrincipal = ({
  chartData,
  selectedCountries,
  datasetsWithIcons,
  activeDataset
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Evolución de {datasetsWithIcons[activeDataset].title}
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <span 
            className="w-3 h-3 rounded-full mr-2" 
            style={{backgroundColor: datasetsWithIcons[activeDataset].color}}
          ></span>
          {datasetsWithIcons[activeDataset].title}
        </div>
      </div>
      
      <TimeSeriesChart 
        chartData={chartData}
        selectedCountries={selectedCountries}
        datasets={datasetsWithIcons}
        activeDataset={activeDataset}
      />
    </div>
  );
};

export default GraficoPrincipal;
