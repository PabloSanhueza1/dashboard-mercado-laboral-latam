import React from 'react';

export const PantallaCarga = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-xl">Cargando datos de empleo...</p>
        <p className="text-sm text-gray-500 mt-2">Procesando datos de tasas de empleo de Sudamérica</p>
      </div>
    </div>
  );
};

export const PantallaError = ({ error }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-red-50 text-red-700 p-4 text-center">
      <div>
        <p className="text-xl mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
};
