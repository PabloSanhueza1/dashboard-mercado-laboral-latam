import React from 'react';
import { HiOutlineFilter, HiOutlineXCircle, HiOutlineCheckCircle, HiOutlineGlobeAlt } from 'react-icons/hi';

const FiltrosPaises = ({
  availableCountries,
  selectedCountries,
  setSelectedCountries,
  handleCountryToggle
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HiOutlineGlobeAlt className="w-5 h-5 text-blue-600" />
          </div>
          Selecciona Países para Comparar
        </h2>
        
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedCountries([])}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 border border-red-200"
          >
            <HiOutlineXCircle className="w-4 h-4" />
            Limpiar
          </button>
          <button
            onClick={() => setSelectedCountries(
              availableCountries.map(c => 
                c.replace(' (Plurinational State of)', '')
                 .replace(' (Bolivarian Republic of)', '')
              )
            )}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all duration-200 border border-green-200"
          >
            <HiOutlineCheckCircle className="w-4 h-4" />
            Seleccionar Todos
          </button>
        </div>
      </div>
      
      <div className="country-pills">
        {availableCountries.map(country => {
          const displayName = country
            .replace(' (Plurinational State of)', '')
            .replace(' (Bolivarian Republic of)', '');
          
          const isSelected = selectedCountries.includes(displayName);
          
          return (
            <button
              key={country}
              onClick={() => handleCountryToggle(displayName)}
              className={`country-pill ${isSelected ? 'selected' : ''} relative overflow-hidden`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {displayName}
                {isSelected && <HiOutlineCheckCircle className="w-4 h-4" />}
              </span>
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedCountries.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            <span className="font-bold">{selectedCountries.length}</span> países seleccionados: {selectedCountries.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FiltrosPaises;
