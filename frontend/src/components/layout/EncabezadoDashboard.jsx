import React from 'react';
import { HiOutlineGlobeAlt, HiOutlineChartBar, HiOutlineTrendingUp } from 'react-icons/hi';

const EncabezadoDashboard = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 mb-8 rounded-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-lg">
              <HiOutlineGlobeAlt className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Dashboard Mercado Laboral
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                Análisis Integral de Empleo en Sudamérica
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Datos actualizados • Análisis en tiempo real • Insights avanzados
              </p>
            </div>
          </div>

          <div className="hidden md:flex space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-xl mb-2">
                <HiOutlineChartBar className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm font-semibold">12 Países</p>
              <p className="text-blue-200 text-xs">Sudamérica</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-xl mb-2">
                <HiOutlineTrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm font-semibold">2015-2024</p>
              <p className="text-blue-200 text-xs">Período</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
            <div className="text-2xl font-bold text-white">65.2%</div>
            <div className="text-blue-100 text-sm">Promedio Empleo</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
            <div className="text-2xl font-bold text-white">8.1%</div>
            <div className="text-blue-100 text-sm">Promedio Desempleo</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
            <div className="text-2xl font-bold text-white">+2.3%</div>
            <div className="text-blue-100 text-sm">Crecimiento Anual</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-blue-100 text-sm">Países Analizados</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EncabezadoDashboard;
