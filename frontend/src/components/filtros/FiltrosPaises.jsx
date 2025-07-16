import React from 'react';
import { HiOutlineGlobeAlt, HiOutlineInformationCircle } from 'react-icons/hi';

const FiltrosPaises = ({ availableCountries = [] }) => {
  const processedCountries = availableCountries.map(country => 
    country
      .replace(' (Plurinational State of)', '')
      .replace(' (Bolivarian Republic of)', '')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HiOutlineGlobeAlt className="w-5 h-5 text-blue-600" />
          </div>
          Países Incluidos en el Análisis
        </h2>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineInformationCircle className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-700 font-medium">
            Este dashboard incluye datos de {processedCountries.length} países de Sudamérica
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {processedCountries.map(country => (
            <div
              key={country}
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-gray-700 font-medium"
            >
              {country}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltrosPaises;
