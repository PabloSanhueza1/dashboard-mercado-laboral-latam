import React from 'react';
import { HiOutlineFilter, HiOutlineXCircle, HiOutlineCheckCircle } from 'react-icons/hi';

const FiltrosPaises = ({
  availableCountries,
  selectedCountries,
  setSelectedCountries,
  handleCountryToggle
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
        <HiOutlineFilter className="mr-2" />
        Selecciona Países para Comparar
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {availableCountries.map(country => {
          const displayName = country
            .replace(' (Plurinational State of)', '')
            .replace(' (Bolivarian Republic of)', '');
          
          return (
            <button
              key={country}
              onClick={() => handleCountryToggle(displayName)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out flex items-center ${
                selectedCountries.includes(displayName)
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {displayName}
              {selectedCountries.includes(displayName) && (
                <HiOutlineCheckCircle className="ml-2"/>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedCountries.length > 0 && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setSelectedCountries([])}
            className="flex items-center px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <HiOutlineXCircle className="mr-2" />
            Limpiar Selección
          </button>
          <button
            onClick={() => setSelectedCountries(
              availableCountries.map(c => 
                c.replace(' (Plurinational State of)', '')
                 .replace(' (Bolivarian Republic of)', '')
              )
            )}
            className="flex items-center px-4 py-2 text-sm bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
          >
            <HiOutlineCheckCircle className="mr-2" />
            Seleccionar Todos
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosPaises;
